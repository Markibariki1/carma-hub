'use client';

import { useActionState, useEffect, useState } from 'react';
import Link from 'next/link';
import { sendEnquiry, type ContactState } from '@/app/actions/contact';
import type { Dict } from '@/content/types';

type Props = { t: Dict['contact']; lang: Dict['lang']; privacyHref: string; fallbackEmail?: string };

export function ContactForm({ t, lang, privacyHref, fallbackEmail }: Props) {
  const [state, action, pending] = useActionState<ContactState, FormData>(sendEnquiry, { status: 'idle' });
  const [startedAt, setStartedAt] = useState(0);
  useEffect(() => setStartedAt(Date.now()), []);

  if (state.status === 'sent') {
    return (
      <div className="form-done" role="status">
        <p className="form-done__title">{t.sent}</p>
        <p>{t.sentBody}</p>
      </div>
    );
  }

  const error =
    state.status === 'error'
      ? {
          missing: t.errorMissing,
          email: t.errorEmail,
          unavailable: t.errorUnavailable,
          failed: t.errorFailed,
        }[state.reason]
      : null;
  const offerEmail = state.status === 'error' && (state.reason === 'unavailable' || state.reason === 'failed');
  // Without a public email address there is nothing to point to, so ask to retry instead.
  const message = offerEmail && !fallbackEmail ? t.errorRetry : error;

  return (
    <form className="form" action={action} noValidate>
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="started_at" value={startedAt} />
      <div className="form__trap" aria-hidden="true">
        <label>
          Website URL
          <input type="text" name="company_url" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="form__row">
        <label className="field">
          <span className="field__label">{t.fields.name}</span>
          <input name="name" type="text" autoComplete="name" required maxLength={120} />
        </label>
        <label className="field">
          <span className="field__label">{t.fields.business}</span>
          <input name="business" type="text" autoComplete="organization" maxLength={160} />
        </label>
      </div>

      <label className="field">
        <span className="field__label">
          {t.fields.website} <span className="field__opt">{t.fields.optional}</span>
        </span>
        <input name="website" type="text" inputMode="url" placeholder={t.placeholderWebsite} maxLength={300} />
      </label>

      <div className="form__row">
        <label className="field">
          <span className="field__label">{t.fields.email}</span>
          <input name="email" type="email" autoComplete="email" required maxLength={200} />
        </label>
        <label className="field">
          <span className="field__label">
            {t.fields.phone} <span className="field__opt">{t.fields.optional}</span>
          </span>
          <input name="phone" type="tel" autoComplete="tel" maxLength={60} />
        </label>
      </div>

      <label className="field">
        <span className="field__label">{t.fields.message}</span>
        <textarea name="message" rows={5} required maxLength={5000} placeholder={t.placeholderMessage} />
      </label>

      {message && (
        <p className="form__error" role="alert">
          {message}{' '}
          {offerEmail && fallbackEmail && (
            <a href={`mailto:${fallbackEmail}`}>{fallbackEmail}</a>
          )}
        </p>
      )}

      <div className="form__foot">
        <button className="btn btn--primary" type="submit" disabled={pending}>
          {pending ? t.sending : t.submit}
        </button>
        <p className="form__privacy">
          {t.privacy} <Link href={privacyHref}>{t.privacyLink}</Link>
        </p>
      </div>
    </form>
  );
}
