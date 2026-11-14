'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState, useTransition } from 'react';
import { sendFollowUp, type SendResult } from '@/app/actions/followup';
import { LOGO, PLACEHOLDER, draftFollowUp, parseEuro, type FollowUpKind } from '@/lib/followup';
import { site } from '@/site.config';

type Fields = {
  to: string;
  kind: FollowUpKind;
  lang: 'de' | 'en';
  salutation: 'f' | 'm';
  lastName: string;
  business: string;
  buildFee: string;
  careFee: string;
  growthFee: string;
  sentence: string;
  weeks: string;
  callDate: string;
};

const STORE = 'carma-send-defaults';
/** Kept between emails on this device: these rarely change from call to call. */
type Defaults = Pick<Fields, 'kind' | 'lang' | 'weeks'>;

function berlinToday() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin' }).format(new Date());
}

function blank(defaults: Partial<Defaults> = {}): Fields {
  return {
    to: '',
    kind: defaults.kind ?? 'offer',
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
    return {
      kind: d.kind === 'info' ? 'info' : 'offer',
      lang: d.lang === 'en' ? 'en' : 'de',
      weeks: typeof d.weeks === 'string' ? d.weeks : '',
    };
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
  missing: 'The email address, subject and text are needed.',
  email: 'That email address does not look right.',
  placeholder: 'The email still has a [placeholder] in it.',
  unavailable: 'Sending is not set up yet: RESEND_API_KEY is missing in Vercel.',
  failed: 'The email could not be sent.',
};

export function SendTool({ sendingReady }: { sendingReady: boolean }) {
  const [v, setV] = useState<Fields>(() => blank());
  const [today, setToday] = useState('');
  /** Subject and text once they have been changed by hand; null while they follow the form. */
  const [edited, setEdited] = useState<{ subject: string; text: string } | null>(null);
  const [confirmKey, setConfirmKey] = useState<string | null>(null);
  const [result, setResult] = useState<SendResult | null>(null);
  const [pending, startTransition] = useTransition();
  const body = useRef<HTMLTextAreaElement>(null);

  // Today's date and the remembered choices are only known in the browser.
  useEffect(() => {
    const t = berlinToday();
    setToday(t);
    setV((cur) => ({ ...cur, ...loadDefaults(), callDate: t }));
  }, []);

  function touched() {
    setConfirmKey(null);
    setResult(null);
  }
  function set<K extends keyof Fields>(key: K, value: Fields[K]) {
    setV((cur) => ({ ...cur, [key]: value }));
    touched();
  }

  const offer = v.kind === 'offer';
  const amounts = {
    buildFee: parseEuro(v.buildFee),
    careFee: parseEuro(v.careFee),
    growthFee: parseEuro(v.growthFee),
  };
  const bad = (n: number | null) => n !== null && (Number.isNaN(n) || n <= 0);
  const badAmount = offer && Object.values(amounts).some(bad);
  const weeks = v.weeks.trim() ? Number(v.weeks) : null;
  const badWeeks = offer && weeks !== null && (!Number.isInteger(weeks) || weeks < 1 || weeks > 52);

  const draft = useMemo(
    () =>
      draftFollowUp({
        kind: v.kind,
        lang: v.lang,
        salutation: v.salutation,
        lastName: v.lastName,
        business: v.business.trim() || (v.lang === 'de' ? '[Firmenname]' : '[Business name]'),
        buildFee: bad(amounts.buildFee) ? null : amounts.buildFee,
        careFee: bad(amounts.careFee) ? null : amounts.careFee,
        growthFee: bad(amounts.growthFee) ? null : amounts.growthFee,
        sentence: v.sentence,
        weeks: badWeeks ? null : weeks,
        callDate: v.callDate,
        today,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [v, today],
  );
  const mail = edited ?? draft;

  // The text box grows with the email, so the whole message is visible without scrolling inside it.
  useLayoutEffect(() => {
    const el = body.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight + 2}px`;
  }, [mail.text, result]);

  const emailOk = /^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(v.to.trim());
  const placeholder = PLACEHOLDER.test(mail.subject) || PLACEHOLDER.test(mail.text);
  const empty = !mail.subject.trim() || !mail.text.trim();
  const ready = emailOk && !placeholder && !empty && !badAmount && !badWeeks;

  let blocker = '';
  if (!v.to.trim()) blocker = 'Enter the client’s email address.';
  else if (!emailOk) blocker = ERRORS.email;
  else if (badAmount) blocker = 'Check the amounts: plain numbers such as 500 or 39,99.';
  else if (badWeeks) blocker = 'Weeks until launch must be a whole number from 1 to 52.';
  else if (empty) blocker = 'The subject and the text cannot be empty.';
  else if (placeholder)
    blocker = edited
      ? 'The text still has a [placeholder] in it. Replace it or reset the text.'
      : !v.business.trim()
        ? 'Enter the business name.'
        : 'Enter the build fee.';

  function send() {
    if (!confirmKey) return;
    const key = confirmKey;
    startTransition(async () => {
      let res: SendResult;
      try {
        res = await sendFollowUp({ to: v.to, subject: mail.subject, text: mail.text, key });
      } catch {
        res = { ok: false, error: 'failed', detail: 'No connection to the server.' };
      }
      setResult(res);
      setConfirmKey(null);
      if (res.ok) saveDefaults({ kind: v.kind, lang: v.lang, weeks: v.weeks });
    });
  }

  function next() {
    setV({ ...blank({ kind: v.kind, lang: v.lang, weeks: v.weeks }), callDate: berlinToday() });
    setEdited(null);
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

  const seg = <T extends string>(name: string, value: T, options: [T, string][], onPick: (o: T) => void) => (
    <div className="send__seg">
      {options.map(([o, label]) => (
        <label key={o}>
          <input type="radio" name={name} checked={value === o} onChange={() => onPick(o)} />
          <span>{label}</span>
        </label>
      ))}
    </div>
  );

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

        <fieldset className="send__choice">
          <legend className="field__label">Which email</legend>
          {seg(
            'kind',
            v.kind,
            [
              ['offer', 'Offer'],
              ['info', 'More information'],
            ],
            (o) => set('kind', o),
          )}
        </fieldset>

        <fieldset className="send__choice">
          <legend className="field__label">Language</legend>
          {seg(
            'lang',
            v.lang,
            [
              ['de', 'Deutsch'],
              ['en', 'English'],
            ],
            (o) => set('lang', o),
          )}
        </fieldset>

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
          <label className="field">
            <span className="field__label">
              Last name <span className="field__opt">if known</span>
            </span>
            <input type="text" autoComplete="off" value={v.lastName} onChange={(e) => set('lastName', e.target.value)} maxLength={120} />
          </label>
          <fieldset className="send__choice" disabled={!v.lastName.trim()}>
            <legend className="field__label">Addressed as</legend>
            {seg(
              'salutation',
              v.salutation,
              v.lang === 'de'
                ? [
                    ['f', 'Frau'],
                    ['m', 'Herr'],
                  ]
                : [
                    ['f', 'Ms'],
                    ['m', 'Mr'],
                  ],
              (o) => set('salutation', o),
            )}
          </fieldset>
        </div>

        {offer && (
          <div className="form__row">
            <label className="field">
              <span className="field__label">Build fee, one-off (€)</span>
              <input
                type="text"
                inputMode="decimal"
                placeholder="500"
                value={v.buildFee}
                onChange={(e) => set('buildFee', e.target.value)}
                aria-invalid={bad(amounts.buildFee)}
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
                aria-invalid={bad(amounts.careFee)}
              />
            </label>
          </div>
        )}

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
            <label className="field">
              <span className="field__label">Day of the call</span>
              <input type="date" value={v.callDate} max={today || undefined} onChange={(e) => set('callDate', e.target.value)} />
            </label>
            {offer && (
              <div className="form__row">
                <label className="field">
                  <span className="field__label">
                    Weeks until launch <span className="field__opt">optional</span>
                  </span>
                  <input type="text" inputMode="numeric" placeholder="3" value={v.weeks} onChange={(e) => set('weeks', e.target.value)} aria-invalid={badWeeks} />
                </label>
                <label className="field">
                  <span className="field__label">
                    Growth package (€/month) <span className="field__opt">optional</span>
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={v.growthFee}
                    onChange={(e) => set('growthFee', e.target.value)}
                    aria-invalid={bad(amounts.growthFee)}
                  />
                </label>
              </div>
            )}
          </div>
        </details>

        {edited && (
          <p className="send__note" role="status">
            You changed the text by hand, so the fields here no longer update it.{' '}
            <button
              type="button"
              className="send__link"
              onClick={() => {
                setEdited(null);
                touched();
              }}
            >
              Reset the text
            </button>
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
              {blocker && <p className="form__privacy">{blocker}</p>}
            </>
          )}
        </div>
      </form>

      <section className="send__preview" aria-label="The email">
        <p className="send__preview-meta">
          <span>From</span> {site.owner.fullName} | {site.name} &lt;{site.owner.email}&gt;
        </p>
        <p className="send__preview-meta">
          <span>To</span> {v.to.trim() || '…'}
        </p>
        <label className="send__edit send__edit--subject">
          <span>Subject</span>
          <input
            type="text"
            value={mail.subject}
            maxLength={200}
            onChange={(e) => {
              setEdited({ ...mail, subject: e.target.value });
              touched();
            }}
          />
        </label>
        <label className="send__edit">
          <span className="send__edit-hint">Tap the text to change anything. Lines starting with “- ” become bullet points.</span>
          <textarea
            ref={body}
            value={mail.text}
            maxLength={20000}
            spellCheck
            lang={v.lang}
            onChange={(e) => {
              setEdited({ ...mail, text: e.target.value });
              touched();
            }}
          />
        </label>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="send__logo" src={LOGO.path} width={LOGO.width} height={LOGO.height} alt="Carma logo, added under the email" />
      </section>
    </div>
  );
}
