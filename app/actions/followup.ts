'use server';
import { cookies } from 'next/headers';
import { site } from '@/site.config';
import { buildFollowUp, parseEuro } from '@/lib/followup';
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
  /** Made once per composed email, so a double tap cannot send it twice. */
  key: string;
};

export type SendResult =
  | { ok: true; to: string; subject: string }
  | { ok: false; error: 'auth' | 'missing' | 'email' | 'amount' | 'unavailable' | 'failed'; detail?: string };

function berlinToday() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin' }).format(new Date());
}

export async function sendFollowUp(v: SendValues): Promise<SendResult> {
  if (!(await isSignedIn())) return { ok: false, error: 'auth' };

  const to = String(v.to ?? '').trim().slice(0, 200);
  const lastName = String(v.lastName ?? '').trim().slice(0, 120);
  const business = String(v.business ?? '').trim().slice(0, 160);
  if (!to || !lastName || !business) return { ok: false, error: 'missing' };
  if (!/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(to)) return { ok: false, error: 'email' };

  const buildFee = parseEuro(String(v.buildFee ?? ''));
  const careFee = parseEuro(String(v.careFee ?? ''));
  const growthFee = parseEuro(String(v.growthFee ?? ''));
  const weeksRaw = String(v.weeks ?? '').trim();
  const weeks = weeksRaw ? Number(weeksRaw) : null;
  if ([buildFee, careFee, growthFee].some((n) => n !== null && (Number.isNaN(n) || n <= 0))) return { ok: false, error: 'amount' };
  if (weeks !== null && (!Number.isInteger(weeks) || weeks < 1 || weeks > 52)) return { ok: false, error: 'amount' };

  const mail = buildFollowUp({
    lang: v.lang === 'en' ? 'en' : 'de',
    salutation: v.salutation === 'm' ? 'm' : 'f',
    lastName,
    business,
    buildFee,
    careFee,
    growthFee,
    sentence: String(v.sentence ?? '').slice(0, 1000),
    weeks,
    callDate: /^\d{4}-\d{2}-\d{2}$/.test(String(v.callDate ?? '')) ? v.callDate : '',
    today: berlinToday(),
  });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('[followup] RESEND_API_KEY is not set');
    return { ok: false, error: 'unavailable' };
  }
  const from = process.env.FOLLOWUP_FROM || `${site.owner.fullName} | ${site.name} <${site.owner.email}>`;
  const bcc = process.env.FOLLOWUP_BCC || site.owner.email;

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
        subject: mail.subject,
        text: mail.text,
        html: mail.html,
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
    return { ok: true, to, subject: mail.subject };
  } catch (err) {
    console.error('[followup] network error', err);
    return { ok: false, error: 'failed' };
  }
}
