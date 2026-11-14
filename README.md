# Carma website

The public website for Carma, Marc's web design studio for small businesses: what you get, one highlighted project, who Marc is, prices and terms, FAQ and a contact form. Live at www.carmasearch.com.

Built from the old Carma car-search app (`carmasearchv_b`), keeping only what a marketing site needs: Next.js on Vercel, the security headers, and the Resend email set-up.

## Pages

| Path | What |
|---|---|
| `/` | English home page (default) |
| `/de` | German home page |
| `/work/<slug>`, `/de/arbeiten/<slug>` | Case studies (English, German) |
| `/fuer/<token>` | Private draft pages for prospects (German, not indexed, expire after 30 days) |
| `/impressum`, `/datenschutz` | Legal pages (German) |
| `/send` | Private page for sending the follow-up email after a phone call (password, not indexed) |

Any other address shows a bilingual 404 (`app/global-not-found.tsx`).

**Copy:** `content/en.ts` and `content/de.ts`. Case studies: `content/cases.ts`.

**Settings:** `site.config.ts` holds the business details (Impressum, privacy page, structured data), the public phone and WhatsApp numbers (empty = buttons hidden), the portrait photo (empty = initials) and the prices (`pricing.show: false` goes back to "fixed quote after the first call").

**Languages:** `proxy.ts` sends first-time visitors to `/de` when their browser's main language is German, or when they are in Germany/Austria and German is among their browser languages. The language switch is remembered in a cookie. To add a language, add `content/<lang>.ts`, an `app/(<lang>)` route and a rule in `proxy.ts`.

**The 3D hero** (`components/stack/`): a website shown as four layers (content, design, editor, hosting & care) for a made-up joinery, drawn in code in `textures.ts`. On desktop it pulls apart as you scroll (`scene.ts` has the choreography); on phones it plays by itself in one screen. It only draws when something moves. With reduced motion, no GPU or no JavaScript, visitors see a still picture instead (`public/stack-poster-en.webp`, `-de.webp`). Add `?force3d` to the address to see the 3D version on a machine without a GPU (for screenshots). Smooth scrolling, word-rise headings and parallax live in `components/ScrollFX.tsx`.

**Analytics:** Vercel Web Analytics, without cookies (`components/SiteAnalytics.tsx`). Buttons with `data-event="…"` are counted as events (call, whatsapp, email, hero-cta, header-cta, case-open, case-cta, prospect-reply), plus `enquiry-sent` and `enquiry-error` from the form. Turn it on in Vercel > Project > Analytics.

## Case studies

Add an entry to `content/cases.ts` (English and German text, image paths) and the screenshots to `public/work/` as `.webp` (1000 and 1800 px wide for desktop, 600 px for phone shots). The page, sitemap entry and language links follow automatically. Leave `quote` as `null` until the client has given a real quote.

## Prospect drafts (`/fuer/<token>`)

A personal page showing a business its current home page next to a first draft in its own name, colours and photos. **Only make one after the owner has agreed to receive it** (unsolicited advertising by phone or email to businesses needs their consent in Germany, UWG §7).

- **From GitHub:** Actions > "Prospect pages" > Run workflow, fill in website and business name (optionally the person to greet, town, a personal line). The job builds the draft, commits it and Vercel publishes it; the private link is in the job summary.
- **Locally:** `node scripts/prospect.mjs --url www.example.de --name "Bäckerei Beispiel" --contact "Frau Berger"` (set `CHROME_PATH` or run `npx playwright-core install chromium` first), then commit and push.

Always open the draft before sending the link; adjust the headline, colour or photo in `content/prospects/<token>.json` if the script picked something odd. Pages stop working after 30 days, and the same workflow deletes expired drafts and their images every night (`scripts/prospect-cleanup.mjs`).

## Follow-up emails (`/send`)

After a call, open `/send` (save it to the phone's home screen), enter the client's email, business name, last name, the build fee and the monthly fee, check the preview and send. The email goes out from support@carmasearch.com with a copy (BCC) to the same address, and replies land there.

- **Build fee filled in:** the full version with a fixed quote. **Build fee empty:** the short version with the price range from `site.config.ts` that asks for details.
- German or English, Frau/Herr; the sentence from the call is optional but recommended. "More options" has the day of the call, weeks until launch and the growth package price.
- **Wording:** `lib/followup.ts` (follows the project doc "Follow-up email after a phone call"). The preview and the sent email come from the same code.
- **Vercel environment variables:** `SEND_PASSWORD` (the page stays locked without it; changing it signs every device out) and `RESEND_API_KEY` (shared with the contact form). Optional: `FOLLOWUP_FROM`, `FOLLOWUP_BCC`. The domain carmasearch.com must be verified in Resend.

## Before going live

1. **Contact form** – in Vercel > Project > Settings > Environment Variables add:
   - `RESEND_API_KEY` – from resend.com > API Keys
   - `CONTACT_TO` – optional; enquiries go to the email in `site.config.ts` (support@carmasearch.com) unless this is set
   - `CONTACT_FROM` – e.g. `Carma <hallo@carmasearch.com>` once the domain is verified in Resend. Until then leave it out; Resend's test sender only delivers to your own Resend account email.
2. Have the Impressum and Datenschutz text checked (e.g. with an e-Recht24 generator or your accountant/lawyer).

## Run locally

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # what Vercel runs
```

## Vercel note

Commits must use the author email that matches the GitHub account (`Markibariki1`), or Vercel blocks the deployment.
