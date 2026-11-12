#!/usr/bin/env node
/**
 * Make a private draft page for a business: /fuer/<token>.
 *
 * Only run this after the owner has said yes to receiving a free draft
 * (cold emails/calls without consent are not allowed in Germany, UWG §7).
 *
 *   node scripts/prospect.mjs --url https://www.example.de --name "Schreinerei Beispiel" [--contact "Frau Berger"] [--note "…"] [--days 30]
 *
 * What it does:
 *   1. Opens their website in a headless browser and takes a 1440 × 900 screenshot.
 *   2. Picks up their name, headline, description, logo, brand colour, a hero photo,
 *      phone number and menu items.
 *   3. Saves the images to public/fuer/<token>/ and the data to content/prospects/<token>.json,
 *      and refreshes content/prospects/index.ts.
 * Then commit and push: Vercel publishes the page. Check the draft before sending the link,
 * and fix anything odd (headline, colour, photo) directly in the JSON file.
 *
 * Browser: uses CHROME_PATH if set, otherwise the Chromium installed by `npx playwright-core install chromium`.
 */
import { chromium } from 'playwright-core';
import sharp from 'sharp';
import { randomBytes } from 'node:crypto';
import { mkdir, writeFile, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');

function args() {
  const out = {};
  const a = process.argv.slice(2);
  for (let i = 0; i < a.length; i++) {
    if (a[i].startsWith('--')) out[a[i].slice(2)] = a[i + 1]?.startsWith('--') || a[i + 1] === undefined ? 'true' : a[++i];
  }
  return out;
}

const opts = args();
if (!opts.url || !opts.name) {
  console.error('Usage: node scripts/prospect.mjs --url <website> --name "<business name>" [--contact "<name>"] [--note "<text>"] [--days 30]');
  process.exit(1);
}
const url = /^https?:\/\//.test(opts.url) ? opts.url : `https://${opts.url}`;
const token = randomBytes(12).toString('base64url');
const dir = path.join(ROOT, 'public', 'fuer', token);
const pub = `/fuer/${token}`;
await mkdir(dir, { recursive: true });

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'de-DE', deviceScaleFactor: 1 });
const page = await ctx.newPage();
console.log(`Opening ${url} …`);
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

// Close cookie banners the polite way: accept only if that is the only way to see the page.
for (const label of [/nur notwendige/i, /ablehnen/i, /alle akzeptieren/i, /akzeptieren/i, /zustimmen/i, /accept all/i, /accept/i, /einverstanden/i, /^ok$/i]) {
  const btn = page.getByRole('button', { name: label }).first();
  if (await btn.isVisible().catch(() => false)) {
    await btn.click({ timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(800);
    break;
  }
}
await page.waitForTimeout(1200);

const shot = await page.screenshot({ type: 'png' });
await sharp(shot).webp({ quality: 80 }).toFile(path.join(dir, 'before.webp'));

const found = await page.evaluate(() => {
  const text = (el) => (el?.textContent || '').replace(/\s+/g, ' ').trim();
  const abs = (u) => {
    try {
      return new URL(u, location.href).href;
    } catch {
      return null;
    }
  };
  const meta = (n) => document.querySelector(`meta[name="${n}"], meta[property="${n}"]`)?.getAttribute('content') || '';

  // Logo: an image whose name, alt or class says logo, preferably in the header.
  const imgs = Array.from(document.images);
  const logoEl =
    imgs.find((i) => /logo/i.test(`${i.src} ${i.alt} ${i.className} ${i.id}`) && i.closest('header, nav, [class*="head"]')) ||
    imgs.find((i) => /logo/i.test(`${i.src} ${i.alt} ${i.className} ${i.id}`)) ||
    document.querySelector('header img');
  const svgLogo = !logoEl && document.querySelector('header svg, [class*="logo"] svg');

  // Hero photo: the largest photo near the top of the page.
  const hero = imgs
    .filter((i) => i !== logoEl && Math.max(i.naturalWidth, i.getBoundingClientRect().width) >= 500 && i.getBoundingClientRect().top < 1600 && !/logo|icon/i.test(i.src))
    .sort((a, b) => b.naturalWidth * b.naturalHeight - a.naturalWidth * a.naturalHeight)[0];
  let heroSrc = hero ? hero.currentSrc || hero.src : null;
  if (!heroSrc) {
    // Background images on big blocks.
    for (const el of Array.from(document.querySelectorAll('section, header, div')).slice(0, 400)) {
      const r = el.getBoundingClientRect();
      if (r.width < 700 || r.height < 300 || r.top > 1400) continue;
      const m = getComputedStyle(el).backgroundImage.match(/url\(["']?([^"')]+)/);
      if (m) {
        heroSrc = m[1];
        break;
      }
    }
  }

  // Brand colour: the most colourful background or text colour on buttons and links.
  const score = (rgb) => {
    const m = rgb.match(/\d+(\.\d+)?/g);
    if (!m) return null;
    const [r, g, b, a = 1] = m.map(Number);
    if (a < 0.6) return null;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const sat = max === 0 ? 0 : (max - min) / max;
    if (sat < 0.25 || max < 60 || min > 225) return null;
    return { hex: `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`, sat };
  };
  const counts = new Map();
  const themeMeta = meta('theme-color');
  for (const el of Array.from(document.querySelectorAll('a, button, [class*="btn"], [class*="button"], header, nav, h1, h2')).slice(0, 600)) {
    const cs = getComputedStyle(el);
    // Backgrounds say more about a brand than text colour; browser-default link colours say nothing.
    for (const [c, weight] of [
      [cs.backgroundColor, 3],
      [cs.color, 1],
    ]) {
      const s = score(c);
      if (s && !['#0000ee', '#551a8b', '#0000ff'].includes(s.hex)) counts.set(s.hex, (counts.get(s.hex) || 0) + weight * (1 + s.sat));
    }
  }
  const color = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || (/^#[0-9a-f]{6}$/i.test(themeMeta) ? themeMeta : '');

  const nav = Array.from(document.querySelectorAll('header nav a, nav a, header a'))
    .map(text)
    .filter((t) => t.length > 1 && t.length < 22 && !/^(home|start|startseite|de|en|login|suche)$/i.test(t))
    .filter((t, i, all) => all.indexOf(t) === i)
    .slice(0, 4);

  const tel = document.querySelector('a[href^="tel:"]');
  const h1 = text(document.querySelector('h1'));
  return {
    title: document.title,
    h1,
    description: meta('description') || meta('og:description'),
    logo: logoEl ? abs(logoEl.currentSrc || logoEl.src) : null,
    svgLogo: svgLogo ? svgLogo.outerHTML : null,
    hero: heroSrc ? abs(heroSrc) : meta('og:image') ? abs(meta('og:image')) : null,
    color,
    nav,
    phone: tel ? text(tel) || decodeURIComponent(tel.getAttribute('href').slice(4)) : '',
  };
});

async function download(src, name, width) {
  if (!src) return undefined;
  try {
    const res = await ctx.request.get(src, { timeout: 20000 });
    if (!res.ok()) return undefined;
    const buf = await res.body();
    const img = sharp(buf, { density: 300 });
    const out = path.join(dir, `${name}.webp`);
    await (width ? img.resize({ width, withoutEnlargement: true }) : img.resize({ height: 160, withoutEnlargement: true })).webp({ quality: 82 }).toFile(out);
    return `${pub}/${name}.webp`;
  } catch (e) {
    console.warn(`Could not use ${name}: ${e.message}`);
    return undefined;
  }
}

const logo = await download(found.logo, 'logo');
const hero = await download(found.hero, 'hero', 1600);
await browser.close();

const clean = (s, max) => {
  const t = (s || '').replace(/\s+/g, ' ').trim();
  return t.length > max ? `${t.slice(0, max).replace(/\s+\S*$/, '')} …` : t;
};
const headline = clean(found.h1 && found.h1.length > 6 ? found.h1 : found.title.split(/[|–-]/)[0], 70) || opts.name;
const lede = clean(found.description, 160) || `${opts.name}: Qualität, auf die man sich verlassen kann.`;

const prospect = {
  token,
  business: opts.name,
  ...(opts.contact ? { contact: opts.contact } : {}),
  url,
  created: new Date().toISOString().slice(0, 10),
  days: Number(opts.days || 30),
  ...(opts.note ? { note: opts.note } : {}),
  before: `${pub}/before.webp`,
  mock: {
    name: opts.name,
    headline,
    lede,
    nav: found.nav,
    color: found.color || '#2633c9',
    ...(logo ? { logo } : {}),
    ...(hero ? { hero } : {}),
    ...(found.phone ? { phone: found.phone } : {}),
    ...(opts.city ? { city: opts.city } : {}),
  },
};

const dataDir = path.join(ROOT, 'content', 'prospects');
await writeFile(path.join(dataDir, `${token}.json`), `${JSON.stringify(prospect, null, 2)}\n`);

// Refresh the index so the site knows about every prospect file.
const files = (await readdir(dataDir)).filter((f) => f.endsWith('.json')).sort();
const lines = files.map((f, i) => `import p${i} from './${f}';`);
const index = `// Generated by scripts/prospect.mjs. Lists every prospect page; edit by re-running the script.
import type { Prospect } from './types';
${lines.join('\n')}

export const prospects: Prospect[] = [${files.map((_, i) => `p${i}`).join(', ')}];
`;
await writeFile(path.join(dataDir, 'index.ts'), index);

const site = (await readFile(path.join(ROOT, 'site.config.ts'), 'utf8')).match(/https:\/\/[^'"]+/)?.[0] || 'https://www.carmasearch.com';
console.log(`\nDraft for ${opts.name}`);
console.log(`  headline: ${headline}`);
console.log(`  colour:   ${prospect.mock.color}   logo: ${logo ? 'yes' : 'no'}   photo: ${hero ? 'yes' : 'no'}`);
console.log(`  data:     content/prospects/${token}.json`);
console.log(`\nLink (after deploy): ${site}/fuer/${token}`);
if (process.env.GITHUB_STEP_SUMMARY) {
  await writeFile(
    process.env.GITHUB_STEP_SUMMARY,
    `### Draft for ${opts.name}\n\nLink (live in about a minute): ${site}/fuer/${token}\n\n- Headline: ${headline}\n- Colour: ${prospect.mock.color}\n- Logo: ${logo ? 'yes' : 'no'}, photo: ${hero ? 'yes' : 'no'}\n\nCheck it before sending. Fix anything odd in \`content/prospects/${token}.json\`.\n`,
    { flag: 'a' },
  );
}
