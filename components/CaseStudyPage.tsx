import { ViewTransition } from 'react';
import Link from 'next/link';
import type { Dict } from '@/content/types';
import type { CaseStudy } from '@/content/cases';
import { BeforeAfter } from './BeforeAfter';
import { Header, Footer } from './Chrome';
import { RiseText } from './RiseText';
import { ScrollFX } from './ScrollFX';
import { Figures } from './Figures';
import { caseStudyHref } from '@/lib/routes';

/** One template for every project: intro, before/after, the story, the details, a call to action. */
export function CaseStudyPage({ t, study }: { t: Dict; study: CaseStudy }) {
  const c = study.text[t.lang];
  const home = t.lang === 'en' ? '/' : '/de';
  const other = t.lang === 'en' ? 'de' : 'en';
  const switchHref = other === 'de' ? caseStudyHref('de', study.slug) : `${caseStudyHref('en', study.slug)}?lang=en`;
  const img = study.images;

  return (
    <>
      <ScrollFX />
      <a className="skip" href="#main">
        {t.nav.skip}
      </a>
      <Header t={t} home={home} solid switchHref={switchHref} />

      <main id="main" className="casepage">
        <section className="casepage__intro">
          <div className="wrap">
            <Link className="casepage__back" href={home}>
              {t.caseStudy.back}
            </Link>
            <div className="casepage__head">
              <div>
                <RiseText as="h1" className="casepage__client" text={c.client} />
                <p className="casepage__place" data-reveal>
                  {c.place}
                </p>
              </div>
              <p className="casepage__summary" data-reveal>
                {c.summary}
              </p>
            </div>
            <dl className="casepage__details" data-reveal>
              {c.details.map((d) => (
                <div key={d.label}>
                  <dt>{d.label}</dt>
                  <dd>{d.value}</dd>
                </div>
              ))}
              <div>
                <dt>Website</dt>
                <dd>
                  <a className="link" href={study.url} target="_blank" rel="noopener noreferrer">
                    {study.url.replace(/^https?:\/\//, '')}
                  </a>
                </dd>
              </div>
            </dl>
            <Figures items={c.figures} note={c.figuresNote} />
            <ViewTransition name={`case-${study.slug}`}>
              <figure className="compare-figure">
                <BeforeAfter
                  intro
                  before={{ ...img.before, alt: c.beforeAlt }}
                  after={{ ...img.after, alt: c.afterAlt }}
                  beforeLabel={t.compare.before}
                  afterLabel={t.compare.after}
                  sliderLabel={t.compare.sliderLabel}
                  sizes="(min-width: 1400px) 1320px, 100vw"
                />
                <figcaption className="caption">{c.compareHint}</figcaption>
              </figure>
            </ViewTransition>
          </div>
        </section>

        <section className="casepage__story" aria-label={c.story.map((s) => s.title).join(', ')}>
          <div className="wrap casepage__story-inner">
            {c.story.map((s) => (
              <div key={s.title} className="casepage__chapter" data-reveal>
                <h2 className="casepage__chapter-title">{s.title}</h2>
                <p>{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="work">
          <div className="wrap">
            <figure className="case__wide" data-parallax>
              <div className="case__frame">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img {...img.product} alt={c.productAlt} sizes="(min-width: 1400px) 1320px, 100vw" loading="lazy" decoding="async" />
              </div>
              <figcaption className="caption caption--dark">{c.productCaption}</figcaption>
            </figure>

            <div className="case__grid">
              <figure className="case__phones">
                <div className="phones">
                  <div className="phone-col" data-parallax>
                    <div className="phone">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img {...img.beforePhone} alt={c.beforePhoneAlt} loading="lazy" decoding="async" />
                    </div>
                    <span className="phone__tag">{t.compare.before}</span>
                  </div>
                  <div className="phone-col phone-col--offset" data-parallax>
                    <div className="phone">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img {...img.afterPhone} alt={c.afterPhoneAlt} loading="lazy" decoding="async" />
                    </div>
                    <span className="phone__tag phone__tag--after">{t.compare.after}</span>
                  </div>
                </div>
                <figcaption className="caption caption--dark">{c.phoneCaption}</figcaption>
              </figure>

              <div className="case__side">
                <ul className="facts">
                  {c.facts.map((f) => (
                    <li key={f.title} data-reveal>
                      <p className="facts__title">{f.title}</p>
                      <p className="facts__body">{f.body}</p>
                    </li>
                  ))}
                </ul>
                <a className="btn btn--light" href={study.url} target="_blank" rel="noopener noreferrer">
                  {c.visit}
                </a>
              </div>
            </div>

            <figure className="case__wide" data-parallax>
              <div className="case__frame">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img {...img.collection} alt={c.collectionAlt} sizes="(min-width: 1400px) 1320px, 100vw" loading="lazy" decoding="async" />
              </div>
              <figcaption className="caption caption--dark">{c.collectionCaption}</figcaption>
            </figure>

            {c.quote ? (
              <figure className="casepage__quote" data-reveal>
                <blockquote>{c.quote.text}</blockquote>
                <figcaption>{c.quote.by}</figcaption>
              </figure>
            ) : null}
          </div>
        </section>

        <section className="casepage__cta" aria-labelledby="case-cta">
          <div className="wrap casepage__cta-inner">
            <RiseText id="case-cta" className="statement" text={t.caseStudy.ctaTitle} />
            <div data-reveal>
              <p className="casepage__cta-body">{t.caseStudy.ctaBody}</p>
              <a className="btn btn--primary" href={`${home === '/' ? '' : home}/#contact`} data-event="case-cta">
                {t.caseStudy.cta}
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer t={t} big switchHref={switchHref} />
    </>
  );
}
