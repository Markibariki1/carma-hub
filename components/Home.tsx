import type { Dict } from '@/content/types';
import { BeforeAfter } from './BeforeAfter';
import { ContactForm } from './ContactForm';
import { Header, Footer } from './Chrome';
import { site, ownerDetailsComplete } from '@/site.config';

const W = '/work/';
const desk = (name: string, alt: string) => ({
  src: `${W}${name}-1800.webp`,
  srcSet: `${W}${name}-1000.webp 1000w, ${W}${name}-1800.webp 1800w`,
  width: 1800,
  height: 1125,
  alt,
});
const phone = (name: string, alt: string) => ({ src: `${W}${name}.webp`, width: 600, height: 1298, alt });

export function Home({ t }: { t: Dict }) {
  const home = t.lang === 'de' ? '/' : '/en';
  const de = t.lang === 'de';

  return (
    <>
      <a className="skip" href="#main">
        {de ? 'Zum Inhalt springen' : 'Skip to content'}
      </a>
      <Header t={t} home={home} />

      <main id="main">
        {/* Hero: the headline, then the transformation itself */}
        <section className="hero">
          <div className="wrap">
            <h1 className="hero__title">{t.hero.title}</h1>
            <div className="hero__row">
              <p className="hero__lede">{t.hero.lede}</p>
              <div className="hero__actions">
                <a className="btn btn--primary" href="#kontakt">
                  {t.hero.primary}
                </a>
                <a className="link" href="#arbeiten">
                  {t.hero.secondary}
                </a>
              </div>
            </div>
            <figure className="hero__compare">
              <BeforeAfter
                intro
                before={desk('shang-before', de ? 'Alte Startseite von Shang Antique' : 'Shang Antique’s old home page')}
                after={desk('shang-after', de ? 'Neue Startseite von Shang Antique' : 'Shang Antique’s new home page')}
                beforeLabel={t.hero.before}
                afterLabel={t.hero.after}
                sliderLabel={t.hero.sliderLabel}
                sizes="(min-width: 1400px) 1320px, 100vw"
              />
              <figcaption className="caption">
                {t.hero.compareCaption} <span className="caption__hint">{t.hero.compareHint}</span>
              </figcaption>
            </figure>
          </div>
        </section>

        <section className="audience">
          <div className="wrap audience__inner">
            <h2 className="statement">{t.audience.title}</h2>
            <div className="audience__body">
              <p>{t.audience.body}</p>
              <ul className="kinds">
                {t.audience.kinds.map((k) => (
                  <li key={k}>{k}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="services" id="leistungen" aria-labelledby="services-title">
          <div className="wrap services__inner">
            <div className="services__head">
              <h2 id="services-title" className="h2">
                {t.services.title}
              </h2>
              <p className="muted">{t.services.intro}</p>
            </div>
            <dl className="services__list">
              {t.services.items.map((s) => (
                <div key={s.title} className="service">
                  <dt className="service__title">{s.title}</dt>
                  <dd className="service__body">{s.body}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="work" id="arbeiten" aria-labelledby="work-title">
          <div className="wrap">
            <h2 id="work-title" className="visually-hidden">
              {t.work.title}
            </h2>
            <header className="case__head">
              <div>
                <p className="case__client">{t.work.client}</p>
                <p className="case__place">{t.work.place}</p>
              </div>
              <p className="case__summary">{t.work.summary}</p>
            </header>

            <figure className="case__wide">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                {...desk('shang-product', de ? 'Produktseite einer Buddha-Statue auf der neuen Website' : 'Product page for a Buddha statue on the new website')}
                sizes="(min-width: 1400px) 1320px, 100vw"
                loading="lazy"
                decoding="async"
              />
              <figcaption className="caption caption--dark">{t.work.productCaption}</figcaption>
            </figure>

            <div className="case__grid">
              <figure className="case__phones">
                <div className="phones">
                  <div>
                    <div className="phone">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img {...phone('shang-before-phone', de ? 'Alte Website auf dem Handy' : 'Old website on a phone')} loading="lazy" decoding="async" />
                    </div>
                    <span className="phone__tag">{t.work.beforePhone}</span>
                  </div>
                  <div>
                    <div className="phone">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img {...phone('shang-after-phone', de ? 'Neue Website auf dem Handy' : 'New website on a phone')} loading="lazy" decoding="async" />
                    </div>
                    <span className="phone__tag phone__tag--after">{t.work.afterPhone}</span>
                  </div>
                </div>
                <figcaption className="caption caption--dark">{t.work.phoneCaption}</figcaption>
              </figure>

              <div className="case__side">
                <ul className="facts">
                  {t.work.facts.map((f) => (
                    <li key={f.title}>
                      <p className="facts__title">{f.title}</p>
                      <p className="facts__body">{f.body}</p>
                    </li>
                  ))}
                </ul>
                <a className="btn btn--light" href="https://shangantique.com" target="_blank" rel="noopener noreferrer">
                  {t.work.visit}
                </a>
              </div>
            </div>

            <figure className="case__wide">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                {...desk('shang-collection', de ? 'Übersicht der Sammlung mit Filtern' : 'Collection overview with filters')}
                sizes="(min-width: 1400px) 1320px, 100vw"
                loading="lazy"
                decoding="async"
              />
              <figcaption className="caption caption--dark">{t.work.collectionCaption}</figcaption>
            </figure>
          </div>
        </section>

        <section className="process" id="ablauf" aria-labelledby="process-title">
          <div className="wrap">
            <h2 id="process-title" className="h2">
              {t.process.title}
            </h2>
            <ol className="steps">
              {t.process.steps.map((s, i) => (
                <li key={s.title} className="step">
                  <span className="step__n" aria-hidden="true">
                    {i + 1}
                  </span>
                  <p className="step__title">{s.title}</p>
                  <p className="step__body">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="cost" aria-labelledby="cost-title">
          <div className="wrap cost__inner">
            <h2 id="cost-title" className="h2">
              {t.cost.title}
            </h2>
            <div className="cost__body">
              {t.cost.body.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </div>
        </section>

        <section className="faq" aria-labelledby="faq-title">
          <div className="wrap faq__inner">
            <h2 id="faq-title" className="h2">
              {t.faq.title}
            </h2>
            <div className="faq__list">
              {t.faq.items.map((f) => (
                <details key={f.q} className="qa">
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="contact" id="kontakt" aria-labelledby="contact-title">
          <div className="wrap contact__inner">
            <div className="contact__intro">
              <h2 id="contact-title" className="statement">
                {t.contact.title}
              </h2>
              <p className="contact__lede">{t.contact.lede}</p>
              <p className="muted">{t.contact.solo}</p>
            </div>
            <ContactForm
              t={t.contact}
              lang={t.lang}
              privacyHref={t.footer.privacyHref}
              fallbackEmail={ownerDetailsComplete ? site.owner.email : undefined}
            />
          </div>
        </section>
      </main>

      <Footer t={t} />
    </>
  );
}
