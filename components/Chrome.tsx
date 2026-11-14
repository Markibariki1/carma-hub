import Link from 'next/link';
import type { Dict } from '@/content/types';
import { site } from '@/site.config';

export function Header({ t, home, solid = false, switchHref }: { t: Dict; home: string; solid?: boolean; switchHref?: string }) {
  // "/#id" stays on the page when already there, and works from the legal pages too.
  const a = (id: string) => `${home}#${id}`;
  const other = t.lang === 'en' ? 'de' : 'en';
  return (
    <header className={`header${solid ? ' is-solid' : ''}`}>
      <div className="wrap header__inner">
        <Link href={home} className="wordmark" aria-label="Carma">
          Carma
        </Link>
        <nav className="header__nav" aria-label={t.nav.main}>
          <a href={a('work')}>{t.nav.work}</a>
          <a href={a('services')}>{t.nav.services}</a>
          <a href={a('contact')}>{t.nav.contact}</a>
        </nav>
        <div className="header__end">
          {/* Plain <a> so the language proxy sees the request and remembers the choice. */}
          <a href={switchHref ?? t.nav.switchHref} className="header__lang" hrefLang={other} lang={other} aria-label={t.nav.switchLabel}>
            {other.toUpperCase()}
          </a>
          <a href={a('contact')} className="btn btn--primary btn--small" data-event="header-cta">
            {t.nav.cta}
          </a>
        </div>
      </div>
    </header>
  );
}

export function Footer({ t, switchHref }: { t: Dict; big?: boolean; switchHref?: string }) {
  const other = t.lang === 'en' ? 'de' : 'en';
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer__inner">
          <p className="footer__line">
            <strong>{site.name}</strong> {t.footer.line}
          </p>
          <nav className="footer__links" aria-label={t.nav.legal}>
            <Link href={t.footer.imprintHref}>{t.footer.imprint}</Link>
            <Link href={t.footer.privacyHref}>{t.footer.privacy}</Link>
            <a href={switchHref ?? t.nav.switchHref} hrefLang={other} lang={other}>
              {t.nav.switchTo}
            </a>
          </nav>
          <p className="footer__copy">
            © {new Date().getFullYear()} {site.name}
          </p>
        </div>
      </div>
    </footer>
  );
}
