import { ViewTransition } from 'react';
import type { Dict } from '@/content/types';
import { BeforeAfter } from './BeforeAfter';
import { ContactForm } from './ContactForm';
import { Header, Footer } from './Chrome';
import { LayerStack } from './stack/LayerStack';
import { RiseText } from './RiseText';
import { ScrollFX } from './ScrollFX';
import { site, ownerDetailsComplete } from '@/site.config';
import { About } from './About';
import { Cost } from './Cost';
import Link from 'next/link';
import { caseStudyHref } from '@/lib/routes';
import { businessJsonLd } from '@/lib/jsonld';
import { getCase } from '@/content/cases';
import { Figures } from './Figures';

const W = '/work/';
const desk = (name: string, alt: string) => ({
  src: `${W}${name}-1800.webp`,
  srcSet: `${W}${name}-1000.webp 1000w, ${W}${name}-1800.webp 1800w`,
  width: 1800,
  height: 1125,
  alt,
});

export function Home({ t }: { t: Dict }) {
  const home = t.lang === 'en' ? '/' : '/de';
  const caseHref = caseStudyHref(t.lang, 'shang-antique');
  const shang = getCase('shang-antique')!.text[t.lang];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(businessJsonLd(t)).replace(/</g, '\\u003c') }} />
      <ScrollFX />
      <a className="skip" href="#main">
        {t.nav.skip}
      </a>
      <Header t={t} home={home} />

      <main id="main">
        <LayerStack lang={t.lang} hero={t.hero} stack={t.stack} />

        <section className="highlight" id="work" aria-labelledby="work-title">
          <div className="wrap">
            <div className="section-head">
              <div>
                <RiseText id="work-title" className="display" text={t.work.highlightTitle} />
                <p className="highlight__client" data-reveal>
                  <strong>{t.work.client}</strong>
                  <span>{t.work.place}</span>
                </p>
              </div>
              <p className="section-head__body" data-reveal>
                {t.compare.body}
              </p>
            </div>
            <ViewTransition name="case-shang-antique">
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
            </ViewTransition>
            <div className="highlight__foot">
              <Figures items={shang.figures} note={shang.figuresNote} />
              <div className="highlight__links" data-reveal>
                <Link className="btn btn--primary" href={caseHref} data-event="case-open">
                  {t.work.caseLink}
                </Link>
                <a className="link" href="https://shangantique.com" target="_blank" rel="noopener noreferrer">
                  {t.work.visit}
                </a>
              </div>
            </div>
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
            <ul className="services__list">
              {t.services.items.map((s) => (
                <li key={s.title} className="service" data-track>
                  <p className="service__title">
                    {s.title}
                    {s.tag ? <span className="service__tag">{s.tag}</span> : null}
                  </p>
                  <p className="service__body">{s.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <About t={t.about} />

        <Cost t={t.cost} lang={t.lang} />

        <section className="faq" aria-labelledby="faq-title">
          <div className="wrap faq__inner">
            <RiseText id="faq-title" className="h2" text={t.faq.title} />
            <div className="faq__list">
              {t.faq.items.map((f) => (
                <div key={f.q} className="qa">
                  <h3>{f.q}</h3>
                  <p>{f.a}</p>
                </div>
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
