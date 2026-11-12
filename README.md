# Carma website

The public website for Carma, Marc's web design studio for small businesses: services, the Shang Antique case study, how a project runs, FAQ and a contact form. No prices on purpose: every project gets its own quote.

Built from the old Carma car-search app (`carmasearchv_b`), keeping only what a marketing site needs: Next.js on Vercel, the security headers, and the Resend email set-up. Everything vehicle-related is gone.

## Pages

| Path | What |
|---|---|
| `/` | English home page (default) |
| `/de` | German home page |
| `/impressum` | Impressum (required in Germany) |
| `/datenschutz` | Privacy policy |

All copy lives in `content/en.ts` and `content/de.ts`.

**Languages:** `proxy.ts` sends first-time visitors to `/de` when their browser's main language is German, or when they are in Germany/Austria and German is among their browser languages. Using the language switch is remembered in a cookie. To add a language, add `content/<lang>.ts`, an `app/(<lang>)` route and a rule in `proxy.ts`.

**The 3D hero** (`components/stack/`): a website shown as four glass layers (content, design, editor, hosting & care) built with three.js. It assembles on load, pulls apart on scroll and walks through the workflow. Layer images are drawn in `textures.ts`; the scroll choreography is in `scene.ts`. Without WebGL the hero falls back to plain text. Smooth scrolling, word-rise headings and parallax live in `components/ScrollFX.tsx`. Business details for the Impressum and privacy page live in `site.config.ts`.

## Before going live

1. **Fill in `site.config.ts`**: full name, street, postcode and town, email (plus phone/USt-ID if you have them). While any `[placeholder]` is left, the site tells search engines not to index it and the legal pages show a draft note.
2. **Contact form** – in Vercel > Project > Settings > Environment Variables add:
   - `RESEND_API_KEY` – from resend.com > API Keys
   - `CONTACT_TO` – the inbox that receives enquiries
   - `CONTACT_FROM` – e.g. `Carma <hallo@your-domain.de>` once the domain is verified in Resend. Until then leave it out; Resend's test sender only delivers to your own Resend account email.
3. **Domain** – Vercel > Project > Settings > Domains, then set `NEXT_PUBLIC_SITE_URL` to it.
4. Have the Impressum and Datenschutz text checked (e.g. with an e-Recht24 generator or your accountant/lawyer).

## Adding a new portfolio project

Screenshots go in `public/work/` as `.webp` (1000 and 1800 px wide for desktop, 600 px for phone shots). The case study section is in `components/Home.tsx`; its text is under `work` in the content files.

## Run locally

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # what Vercel runs
```

## Vercel note

Commits must use the author email that matches the GitHub account (`Markibariki1`), or Vercel blocks the deployment.
