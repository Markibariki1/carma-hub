'use server';
import { cookies } from 'next/headers';
import { site } from '@/site.config';
import { LOGO, PLACEHOLDER, cleanText, textToHtml } from '@/lib/followup';
import { SEND_COOKIE, isSignedIn, same, sessionToken } from '@/lib/sendAuth';

/**
 * Private /send page: sign-in and sending a follow-up email via Resend's REST API.
 *
 * Vercel environment variables:
 *   SEND_PASSWORD   password for the /send page (secret; without it the page stays locked)
 *   RESEND_API_KEY  Resend API key (secret, shared with the contact form)
 *   FOLLOWUP_FROM   optional sender, default "Marc Haupter | Carma <support@carmasearch.com>".
 *                   The address must be on the domain verified in Resend.
 *   FOLLOWUP_BCC    optional copy address, default support@carmasearch.com
 */

const NINETY_DAYS = 60 * 60 * 24 * 90;

export type SignInState = { error?: 'wrong' | 'unset' };

export async function signIn(_prev: SignInState, form: FormData): Promise<SignInState> {
  const password = process.env.SEND_PASSWORD;
  if (!password) return { error: 'unset' };
  const given = String(form.get('password') ?? '');
  if (!same(given, password)) {
    // Slow down guessing.
    await new Promise((r) => setTimeout(r, 1500));
    return { error: 'wrong' };
  }
  (await cookies()).set(SEND_COOKIE, sessionToken(password), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/send',
    maxAge: NINETY_DAYS,
  });
  return {};
}

export type SendValues = {
  to: string;
  /** Subject and text exactly as shown (and possibly edited) on the /send page. */
  subject: string;
  text: string;
  /** Made once per composed email, so a double tap cannot send it twice. */
  key: string;
};

export type SendResult =
  | { ok: true; to: string; subject: string }
  | { ok: false; error: 'auth' | 'missing' | 'email' | 'placeholder' | 'unavailable' | 'failed'; detail?: string };

export async function sendFollowUp(v: SendValues): Promise<SendResult> {
  if (!(await isSignedIn())) return { ok: false, error: 'auth' };

  const to = String(v.to ?? '').trim().slice(0, 200);
  const subject = String(v.subject ?? '').replace(/\s+/g, ' ').trim().slice(0, 200);
  const text = cleanText(String(v.text ?? '')).slice(0, 20000);
  if (!to || !subject || !text) return { ok: false, error: 'missing' };
  if (!/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(to)) return { ok: false, error: 'email' };
  // Never send an email that still has a [placeholder] in it.
  if (PLACEHOLDER.test(subject) || PLACEHOLDER.test(text)) return { ok: false, error: 'placeholder' };

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('[followup] RESEND_API_KEY is not set');
    return { ok: false, error: 'unavailable' };
  }
  const from = process.env.FOLLOWUP_FROM || `${site.owner.fullName} | ${site.name} <${site.owner.email}>`;
  const bcc = process.env.FOLLOWUP_BCC || site.owner.email;
  // Email programs load the logo from the live website.
  const logoUrl = `https://www.carmasearch.com${LOGO.path}`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        ...(/^[\w-]{8,64}$/.test(String(v.key ?? '')) ? { 'Idempotency-Key': `followup-${v.key}` } : {}),
      },
      body: JSON.stringify({
        from,
        to: [to],
        bcc: [bcc],
        reply_to: site.owner.email,
        subject,
        text: `${text}\n`,
        html: textToHtml(text, logoUrl),
      }),
      cache: 'no-store',
    });
    if (!res.ok) {
      const body = await res.text();
      console.error('[followup] Resend error', res.status, body);
      let detail = `Resend ${res.status}`;
      try {
        detail = JSON.parse(body).message || detail;
      } catch {}
      return { ok: false, error: 'failed', detail };
    }
    return { ok: true, to, subject };
  } catch (err) {
    console.error('[followup] network error', err);
    return { ok: false, error: 'failed' };
  }
}
