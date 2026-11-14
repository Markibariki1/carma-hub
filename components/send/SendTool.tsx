'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { sendFollowUp, type SendResult, type SendValues } from '@/app/actions/followup';
import { buildFollowUp, parseEuro } from '@/lib/followup';
import { site } from '@/site.config';

type Fields = Omit<SendValues, 'key'>;

const STORE = 'carma-send-defaults';
/** Kept between emails on this device: these rarely change from call to call. */
type Defaults = Pick<Fields, 'lang' | 'weeks'>;

function berlinToday() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin' }).format(new Date());
}

function blank(defaults: Partial<Defaults> = {}): Fields {
  return {
    to: '',
    lang: defaults.lang ?? 'de',
    salutation: 'f',
    lastName: '',
    business: '',
    buildFee: '',
    careFee: '',
    growthFee: '',
    sentence: '',
    weeks: defaults.weeks ?? '',
    callDate: '',
  };
}

function loadDefaults(): Partial<Defaults> {
  try {
    const d = JSON.parse(localStorage.getItem(STORE) ?? '{}');
    return { lang: d.lang === 'en' ? 'en' : 'de', weeks: typeof d.weeks === 'string' ? d.weeks : '' };
  } catch {
    return {};
  }
}

function saveDefaults(d: Defaults) {
  try {
    localStorage.setItem(STORE, JSON.stringify(d));
  } catch {}
}

const ERRORS: Record<Exclude<SendResult, { ok: true }>['error'], string> = {
  auth: 'You have been signed out. Reload the page and enter the password again.',
  missing: 'Email address, last name and business name are needed.',
  email: 'That email address does not look right.',
  amount: 'Check the amounts: plain numbers such as 500 or 39,99.',
  unavailable: 'Sending is not set up yet: RESEND_API_KEY is missing in Vercel.',
  failed: 'The email could not be sent.',
};

export function SendTool({ sendingReady }: { sendingReady: boolean }) {
  const [v, setV] = useState<Fields>(() => blank());
  const [today, setToday] = useState('');
  const [confirmKey, setConfirmKey] = useState<string | null>(null);
  const [result, setResult] = useState<SendResult | null>(null);
  const [pending, startTransition] = useTransition();

  // Today's date and the remembered language/timing are only known in the browser.
  useEffect(() => {
    const t = berlinToday();
    setToday(t);
    setV((cur) => ({ ...cur, ...loadDefaults(), callDate: t }));
  }, []);

  function set<K extends keyof Fields>(key: K, value: Fields[K]) {
    setV((cur) => ({ ...cur, [key]: value }));
    setConfirmKey(null);
    setResult(null);
  }

  const amounts = {
    buildFee: parseEuro(v.buildFee),
    careFee: parseEuro(v.careFee),
    growthFee: parseEuro(v.growthFee),
  };
  const badAmount = Object.values(amounts).some((n) => n !== null && (Number.isNaN(n) || n <= 0));
  const weeks = v.weeks.trim() ? Number(v.weeks) : null;
  const badWeeks = weeks !== null && (!Number.isInteger(weeks) || weeks < 1 || weeks > 52);
  const emailOk = /^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(v.to.trim());
  const complete = Boolean(v.to.trim() && v.lastName.trim() && v.business.trim());
  const ready = complete && emailOk && !badAmount && !badWeeks;

  const mail = useMemo(
    () =>
      buildFollowUp({
        lang: v.lang,
        salutation: v.salutation,
        lastName: v.lastName || (v.lang === 'de' ? '[Nachname]' : '[Last name]'),
        business: v.business || (v.lang === 'de' ? '[Firmenname]' : '[Business name]'),
        buildFee: Number.isNaN(amounts.buildFee) ? null : amounts.buildFee,
        careFee: Number.isNaN(amounts.careFee) ? null : amounts.careFee,
        growthFee: Number.isNaN(amounts.growthFee) ? null : amounts.growthFee,
        sentence: v.sentence,
        weeks: badWeeks ? null : weeks,
        callDate: v.callDate,
        today,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [v, today],
  );

  function send() {
    if (!confirmKey) return;
    const key = confirmKey;
    startTransition(async () => {
      let res: SendResult;
      try {
        res = await sendFollowUp({ ...v, key });
      } catch {
        res = { ok: false, error: 'failed', detail: 'No connection to the server.' };
      }
      setResult(res);
      setConfirmKey(null);
      if (res.ok) saveDefaults({ lang: v.lang, weeks: v.weeks });
    });
  }

  function next() {
    setV({ ...blank({ lang: v.lang, weeks: v.weeks }), callDate: berlinToday() });
    setResult(null);
    setConfirmKey(null);
    window.scrollTo({ top: 0 });
  }

  if (result?.ok) {
    return (
      <div className="form-done send__done" role="status">
        <p className="form-done__title">Sent.</p>
        <p>
          “{result.subject}” went to <strong>{result.to}</strong>, with a copy to {site.owner.email}.
        </p>
        <button className="btn btn--primary" type="button" onClick={next}>
          Next email
        </button>
      </div>
    );
  }

  const hint =
    amounts.buildFee === null
      ? 'No build fee: sends the short version with the price range and asks for details.'
      : 'Build fee given: sends the full version with a fixed quote.';

  return (
    <div className="send__grid">
      <form
        className="form"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (ready && !pending) setConfirmKey(crypto.randomUUID());
        }}
      >
        {!sendingReady && (
          <p className="send__note" role="status">
            Preview works, but sending is not set up yet: add <code>RESEND_API_KEY</code> in Vercel.
          </p>
        )}

        <label className="field">
          <span className="field__label">Client’s email</span>
          <input
            type="email"
            inputMode="email"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            value={v.to}
            onChange={(e) => set('to', e.target.value)}
            maxLength={200}
            aria-invalid={Boolean(v.to.trim()) && !emailOk}
          />
        </label>

        <label className="field">
          <span className="field__label">Business name</span>
          <input type="text" autoComplete="off" value={v.business} onChange={(e) => set('business', e.target.value)} maxLength={160} />
        </label>

        <div className="form__row">
          <fieldset className="send__choice">
            <legend className="field__label">Addressed as</legend>
            <div className="send__seg">
              {(['f', 'm'] as const).map((s) => (
                <label key={s}>
                  <input type="radio" name="salutation" checked={v.salutation === s} onChange={() => set('salutation', s)} />
                  <span>{v.lang === 'de' ? (s === 'f' ? 'Frau' : 'Herr') : s === 'f' ? 'Ms' : 'Mr'}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <label className="field">
            <span className="field__label">Last name</span>
            <input type="text" autoComplete="off" value={v.lastName} onChange={(e) => set('lastName', e.target.value)} maxLength={120} />
          </label>
        </div>

        <div className="form__row">
          <label className="field">
            <span className="field__label">
              Build fee, one-off (€) <span className="field__opt">empty = quote to follow</span>
            </span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="500"
              value={v.buildFee}
              onChange={(e) => set('buildFee', e.target.value)}
              aria-invalid={amounts.buildFee !== null && (Number.isNaN(amounts.buildFee) || amounts.buildFee <= 0)}
            />
          </label>
          <label className="field">
            <span className="field__label">
              Per month (€) <span className="field__opt">empty = {String(site.pricing.careFrom).replace('.', ',')}</span>
            </span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="40"
              value={v.careFee}
              onChange={(e) => set('careFee', e.target.value)}
              disabled={amounts.buildFee === null}
              aria-invalid={amounts.careFee !== null && (Number.isNaN(amounts.careFee) || amounts.careFee <= 0)}
            />
          </label>
        </div>
        <p className="send__hint">{hint}</p>

        <fieldset className="send__choice">
          <legend className="field__label">Language</legend>
          <div className="send__seg">
            {(['de', 'en'] as const).map((l) => (
              <label key={l}>
                <input type="radio" name="lang" checked={v.lang === l} onChange={() => set('lang', l)} />
                <span>{l === 'de' ? 'Deutsch' : 'English'}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="field">
          <span className="field__label">
            One sentence from the call <span className="field__opt">recommended</span>
          </span>
          <textarea
            rows={3}
            value={v.sentence}
            onChange={(e) => set('sentence', e.target.value)}
            maxLength={1000}
            placeholder={
              v.lang === 'de'
                ? 'Sie hatten erwähnt, dass … Auf der neuen Website …'
                : 'You mentioned that … On the new site …'
            }
          />
        </label>

        <details className="send__more">
          <summary>More options</summary>
          <div className="form send__more-body">
            <div className="form__row">
              <label className="field">
                <span className="field__label">Day of the call</span>
                <input type="date" value={v.callDate} max={today || undefined} onChange={(e) => set('callDate', e.target.value)} />
              </label>
              <label className="field">
                <span className="field__label">
                  Weeks until launch <span className="field__opt">empty = not mentioned</span>
                </span>
                <input type="text" inputMode="numeric" placeholder="3" value={v.weeks} onChange={(e) => set('weeks', e.target.value)} aria-invalid={badWeeks} />
              </label>
            </div>
            <label className="field">
              <span className="field__label">
                Growth package per month (€) <span className="field__opt">empty = not offered</span>
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={v.growthFee}
                onChange={(e) => set('growthFee', e.target.value)}
                disabled={amounts.buildFee === null}
                aria-invalid={amounts.growthFee !== null && (Number.isNaN(amounts.growthFee) || amounts.growthFee <= 0)}
              />
            </label>
          </div>
        </details>

        {(badAmount || badWeeks) && (
          <p className="form__error" role="alert">
            {badWeeks ? 'Weeks until launch must be a whole number from 1 to 52.' : ERRORS.amount}
          </p>
        )}
        {result && !result.ok && (
          <p className="form__error" role="alert">
            {ERRORS[result.error]} {result.detail}
          </p>
        )}

        <div className="form__foot send__foot">
          {confirmKey ? (
            <>
              <p className="send__confirm">
                Send to <strong>{v.to.trim()}</strong>?
              </p>
              <button className="btn btn--primary" type="button" onClick={send} disabled={pending}>
                {pending ? 'Sending…' : 'Yes, send'}
              </button>
              <button className="btn btn--ghost" type="button" onClick={() => setConfirmKey(null)} disabled={pending}>
                Back
              </button>
            </>
          ) : (
            <>
              <button className="btn btn--primary" type="submit" disabled={!ready}>
                Send email
              </button>
              {!ready && <p className="form__privacy">Fill in the email address, business name and last name first.</p>}
            </>
          )}
        </div>
      </form>

      <section className="send__preview" aria-label="Preview">
        <p className="send__preview-meta">
          <span>From</span> {site.owner.fullName} | {site.name} &lt;{site.owner.email}&gt;
        </p>
        <p className="send__preview-meta">
          <span>To</span> {v.to.trim() || '…'}
        </p>
        <p className="send__preview-meta send__preview-subject">
          <span>Subject</span> {mail.subject}
        </p>
        <div className="send__preview-body" dangerouslySetInnerHTML={{ __html: mail.html }} />
      </section>
    </div>
  );
}
