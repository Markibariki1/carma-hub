import Link from 'next/link';
import type { Dict } from '@/content/types';
import { site } from '@/site.config';

export function Header({ t, home }: { t: Dict; home: string }) {
  // "/#id" stays on the page when already there, and works from the legal pages too.
  const a = (id: string) => `${home}#${id}`;
  return (
    <header className="header">
      <div className="wrap header__inner">
        <Link href={home} className="wordmark" aria-label="Carma">
          Carma
        </Link>
        <nav className="header__nav" aria-label={t.lang === 'de' ? 'Hauptnavigation' : 'Main'}>
          <a href={a('leistungen')}>{t.nav.services}</a>
          <a href={a('arbeiten')}>{t.nav.work}</a>
          <a href={a('ablauf')}>{t.nav.process}</a>
          <a href={a('kontakt')}>{t.nav.contact}</a>
        </nav>
        <div className="header__end">
          <Link href={t.nav.switchHref} className="header__lang" hrefLang={t.lang === 'de' ? 'en' : 'de'} aria-label={t.nav.switchLabel}>
            {t.lang === 'de' ? 'EN' : 'DE'}
          </Link>
          <a href={a('kontakt')} className="btn btn--primary btn--small">
            {t.nav.cta}
          </a>
        </div>
      </div>
    </header>
  );
}

export function Footer({ t }: { t: Dict }) {
  return (
    <footer className="footer">
      <div className="wrap footer__inner">
        <div>
          <p className="wordmark wordmark--footer">Carma</p>
          <p className="footer__line">{t.footer.line}</p>
        </div>
        <nav className="footer__links" aria-label={t.lang === 'de' ? 'Rechtliches' : 'Legal'}>
          <Link href={t.footer.imprintHref}>{t.footer.imprint}</Link>
          <Link href={t.footer.privacyHref}>{t.footer.privacy}</Link>
          <Link href={t.nav.switchHref} hrefLang={t.lang === 'de' ? 'en' : 'de'}>
            {t.nav.switchTo}
          </Link>
        </nav>
        <p className="footer__copy">
          © {new Date().getFullYear()} {site.name}
        </p>
      </div>
    </footer>
  );
}
