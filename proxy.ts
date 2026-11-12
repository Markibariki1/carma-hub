import { NextResponse, type NextRequest } from 'next/server';

/**
 * Language routing. English lives at "/", German at "/de".
 *
 * First visit to "/": German visitors are sent to /de when
 *   - their browser's preferred language is German, or
 *   - they are in Germany or Austria (Vercel's geo header) and German is
 *     anywhere in their browser languages.
 * A choice made with the language switch is remembered in a cookie and always wins.
 * To add a language later: add it here, add content/<lang>.ts and an app/(<lang>) route.
 */

const COOKIE = 'carma-lang';
const YEAR = 60 * 60 * 24 * 365;
const GERMAN_COUNTRIES = new Set(['DE', 'AT']);

function languages(header: string | null) {
  return (header ?? '')
    .split(',')
    .map((part) => {
      const [tag, q] = part.trim().split(';q=');
      return { lang: tag.toLowerCase().split('-')[0], q: q ? Number(q) : 1 };
    })
    .filter((l) => l.lang)
    .sort((a, b) => b.q - a.q);
}

function prefersGerman(req: NextRequest) {
  const langs = languages(req.headers.get('accept-language'));
  if (langs[0]?.lang === 'de') return true;
  const country = req.headers.get('x-vercel-ip-country')?.toUpperCase();
  return Boolean(country && GERMAN_COUNTRIES.has(country) && langs.some((l) => l.lang === 'de'));
}

export function proxy(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // Explicit switch to English: remember it and drop the query string.
  if (pathname === '/' && searchParams.get('lang') === 'en') {
    const url = req.nextUrl.clone();
    url.searchParams.delete('lang');
    const res = NextResponse.redirect(url);
    res.cookies.set(COOKIE, 'en', { maxAge: YEAR, path: '/', sameSite: 'lax' });
    return res;
  }

  // Visiting the German page remembers German.
  if (pathname === '/de') {
    const res = NextResponse.next();
    if (req.cookies.get(COOKIE)?.value !== 'de') res.cookies.set(COOKIE, 'de', { maxAge: YEAR, path: '/', sameSite: 'lax' });
    return res;
  }

  if (pathname === '/') {
    const saved = req.cookies.get(COOKIE)?.value;
    if (saved === 'de' || (!saved && prefersGerman(req))) {
      const url = req.nextUrl.clone();
      url.pathname = '/de';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = { matcher: ['/', '/de'] };
