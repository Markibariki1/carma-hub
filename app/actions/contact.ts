'use server';
import { site } from '@/site.config';

/**
 * Contact form → email via Resend's REST API (no SDK needed).
 *
 * Vercel environment variables:
 *   RESEND_API_KEY  Resend API key (secret)
 *   CONTACT_TO      inbox that receives enquiries
 *   CONTACT_FROM    verified sender, e.g. "Carma <hallo@your-domain.de>".
 *                   Until a domain is verified in Resend, "Carma <onboarding@resend.dev>"
 *                   works, but only delivers to the Resend account's own address.
 */

export type ContactState =
  | { status: 'idle' }
  | { status: 'sent' }
  | { status: 'error'; reason: 'missing' | 'email' | 'unavailable' | 'failed' };

const MAX = { name: 120, business: 160, website: 300, email: 200, phone: 60, message: 5000 };

function field(form: FormData, key: keyof typeof MAX) {
  return String(form.get(key) ?? '').trim().slice(0, MAX[key]);
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

export async function sendEnquiry(_prev: ContactState, form: FormData): Promise<ContactState> {
  // Spam guards: a hidden field people never fill, and a minimum time on the page.
  if (String(form.get('company_url') ?? '') !== '') return { status: 'sent' };
  const startedAt = Number(form.get('started_at') ?? 0);
  if (startedAt && Date.now() - startedAt < 2500) return { status: 'sent' };

  const name = field(form, 'name');
  const business = field(form, 'business');
  const website = field(form, 'website');
  const email = field(form, 'email');
  const phone = field(form, 'phone');
  const message = field(form, 'message');
  const lang = form.get('lang') === 'en' ? 'en' : 'de';

  if (!name || !email || !message) return { status: 'error', reason: 'missing' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { status: 'error', reason: 'email' };

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO || site.owner.email;
  // The sender must be on the domain verified in Resend (carmasearch.com).
  const from = process.env.CONTACT_FROM || `${site.name} <${site.owner.email}>`;
  if (!apiKey || !to) {
    console.error('[contact] RESEND_API_KEY or CONTACT_TO is not set');
    return { status: 'error', reason: 'unavailable' };
  }

  const rows: [string, string][] = [
    ['Name', name],
    ['Betrieb', business],
    ['Website', website],
    ['E-Mail', email],
    ['Telefon', phone],
    ['Sprache', lang.toUpperCase()],
  ];
  const text = rows.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join('\n') + `\n\n${message}`;
  const html =
    '<table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">' +
    rows
      .filter(([, v]) => v)
      .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#666">${k}</td><td>${escapeHtml(v)}</td></tr>`)
      .join('') +
    `</table><p style="font-family:sans-serif;font-size:14px;white-space:pre-wrap">${escapeHtml(message)}</p>`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `Neue Anfrage: ${business || name}`,
        text,
        html,
      }),
      cache: 'no-store',
    });
    if (!res.ok) {
      console.error('[contact] Resend error', res.status, await res.text());
      return { status: 'error', reason: 'failed' };
    }
    return { status: 'sent' };
  } catch (err) {
    console.error('[contact] network error', err);
    return { status: 'error', reason: 'failed' };
  }
}
