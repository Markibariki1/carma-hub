import type { Dict } from '@/content/types';
import { BeforeAfter } from './BeforeAfter';
import { ContactForm } from './ContactForm';
import { Header, Footer } from './Chrome';
import { LayerStack } from './stack/LayerStack';
import { RiseText } from './RiseText';
import { ScrollFX } from './ScrollFX';
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
  const home = t.lang === 'en' ? '/' : '/de';

  return (
    <>
      <ScrollFX />
      <a className="skip" href="#main">
        {t.nav.skip}
      </a>
      <Header t={t} home={home} />

      <main id="main">
        <LayerStack hero={t.hero} stack={t.stack} />

        <section className="compare-section" id="compare" aria-labelledby="compare-title">
          <div className="wrap">
            <div className="section-head">
              <RiseText id="compare-title" className="display" text={t.compare.title} />
              <p className="section-head__body" data-reveal>
                {t.compare.body}
              </p>
            </div>
            <figure className="compare-figure" data-reveal>
              <BeforeAfter
                intro
                before={desk('shang-before', t.compare.beforeAlt)}
                after={desk('shang-after', t.compare.afterAlt)}
                beforeLabel={t.compare.before}
                afterLabel={t.compare.after}
                sliderLabel={t.compare.sliderLabel}
                sizes="(min-width: 1400px) 1320px, 100vw"
              />
              <figcaption className="caption">{t.compare.hint}</figcaption>
            </figure>
          </div>
        </section>

        <section className="audience">
          <div className="wrap audience__inner">
            <RiseText className="statement" text={t.audience.title} />
            <div className="audience__body" data-reveal>
              <p>{t.audience.body}</p>
              <ul className="kinds">
                {t.audience.kinds.map((k) => (
                  <li key={k}>{k}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="services" id="services" aria-labelledby="services-title">
          <div className="wrap services__inner">
            <div className="services__head">
              <RiseText id="services-title" className="h2" text={t.services.title} />
              <p className="muted" data-reveal>
                {t.services.intro}
              </p>
            </div>
            <ol className="services__list">
              {t.services.items.map((s, i) => (
                <li key={s.title} className="service" data-track>
                  <span className="service__n" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="service__title">{s.title}</p>
                  <p className="service__body">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="work" id="work" aria-labelledby="work-title">
          <div className="wrap">
            <h2 id="work-title" className="visually-hidden">
              {t.work.title}
            </h2>
            <header className="case__head">
              <div>
                <RiseText as="p" className="case__client" text={t.work.client} />
                <p className="case__place" data-reveal>
                  {t.work.place}
                </p>
              </div>
              <p className="case__summary" data-reveal>
                {t.work.summary}
              </p>
            </header>

            <figure className="case__wide" data-parallax>
              <div className="case__frame">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img {...desk('shang-product', t.work.productAlt)} sizes="(min-width: 1400px) 1320px, 100vw" loading="lazy" decoding="async" />
              </div>
              <figcaption className="caption caption--dark">{t.work.productCaption}</figcaption>
            </figure>

            <div className="case__grid">
              <figure className="case__phones">
                <div className="phones">
                  <div className="phone-col" data-parallax>
                    <div className="phone">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img {...phone('shang-before-phone', t.work.beforePhoneAlt)} loading="lazy" decoding="async" />
                    </div>
                    <span className="phone__tag">{t.work.beforePhone}</span>
                  </div>
                  <div className="phone-col phone-col--offset" data-parallax>
                    <div className="phone">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img {...phone('shang-after-phone', t.work.afterPhoneAlt)} loading="lazy" decoding="async" />
                    </div>
                    <span className="phone__tag phone__tag--after">{t.work.afterPhone}</span>
                  </div>
                </div>
                <figcaption className="caption caption--dark">{t.work.phoneCaption}</figcaption>
              </figure>

              <div className="case__side">
                <ul className="facts">
                  {t.work.facts.map((f) => (
                    <li key={f.title} data-reveal>
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

            <figure className="case__wide" data-parallax>
              <div className="case__frame">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img {...desk('shang-collection', t.work.collectionAlt)} sizes="(min-width: 1400px) 1320px, 100vw" loading="lazy" decoding="async" />
              </div>
              <figcaption className="caption caption--dark">{t.work.collectionCaption}</figcaption>
            </figure>
          </div>
        </section>

        <section className="cost" aria-labelledby="cost-title">
          <div className="wrap cost__inner">
            <RiseText id="cost-title" className="h2" text={t.cost.title} />
            <div className="cost__body" data-reveal>
              {t.cost.body.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </div>
        </section>

        <section className="faq" aria-labelledby="faq-title">
          <div className="wrap faq__inner">
            <RiseText id="faq-title" className="h2" text={t.faq.title} />
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

        <section className="contact" id="contact" aria-labelledby="contact-title">
          <div className="wrap contact__inner">
            <div className="contact__intro">
              <RiseText id="contact-title" className="statement" text={t.contact.title} />
              <p className="contact__lede" data-reveal>
                {t.contact.lede}
              </p>
              <p className="muted" data-reveal>
                {t.contact.solo}
              </p>
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

      <Footer t={t} big />
    </>
  );
}
