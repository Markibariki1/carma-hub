import type { Prospect } from '@/content/prospects/types';
import { de } from '@/content/de';
import { site } from '@/site.config';
import { expiresAt } from '@/lib/prospects';
import { BeforeAfter } from '../BeforeAfter';
import { Header, Footer } from '../Chrome';
import { About } from '../About';
import { Cost } from '../Cost';
import { RiseText } from '../RiseText';
import { ScrollFX } from '../ScrollFX';
import { MockSite } from './MockSite';
import { ScaledFrame } from './ScaledFrame';

const COPY = {
  label: (b: string) => `Entwurf, nur für ${b}`,
  title: (b: string) => `So könnte ${b} online aussehen.`,
  greeting: (c?: string) => (c ? `Guten Tag ${c},` : 'Guten Tag,'),
  intro:
    'wie besprochen haben wir uns Ihre Website angesehen und einen ersten Entwurf für die Startseite gebaut, mit Ihrem Namen, Ihren Farben und Ihren Bildern. Er ist kostenlos und unverbindlich.',
  hint: 'Den Regler ziehen: links Ihre Website heute, rechts der Entwurf.',
  before: 'Heute',
  after: 'Entwurf',
  slider: 'Vergleich zwischen heutiger Website und Entwurf',
  beforeAlt: (b: string) => `Die heutige Startseite von ${b}`,
  afterAlt: (b: string) => `Entwurf einer neuen Startseite für ${b}`,
  changesTitle: 'Was wir ändern würden',
  changes: [
    'Auf dem Handy gut lesbar und schnell, denn dort sucht heute der Großteil Ihrer Kunden.',
    'Ein klarer Weg zur Anfrage: Anruf, WhatsApp oder Formular, auf jeder Seite.',
    'Texte, Bilder und Öffnungszeiten ändern Sie selbst, ohne Programmierkenntnisse.',
    'Saubere Grundlagen für Google, und alte Links leiten weiter.',
  ],
  draftNote: 'Ein erster Entwurf aus Ihren öffentlichen Inhalten. Die fertige Seite gestalten wir mit Ihnen gemeinsam.',
  nextTitle: 'Wie es weitergeht',
  next: 'Wenn Ihnen der Entwurf gefällt, sprechen wir kurz über Ihre Wünsche. Danach bekommen Sie ein schriftliches Festangebot. Wenn nicht, ist das völlig in Ordnung: Sie müssen nichts tun, der Link verschwindet von selbst.',
  reply: 'Antworten Sie einfach auf unsere E-Mail',
  expires: (d: string) => `Dieser Entwurf ist nur über diesen Link erreichbar und bis ${d} online.`,
};

export function ProspectPage({ p }: { p: Prospect }) {
  const until = new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'long', year: 'numeric' }).format(expiresAt(p));
  const changes = p.changes?.length ? p.changes : COPY.changes;
  const mail = `mailto:${site.owner.email}?subject=${encodeURIComponent(`Entwurf für ${p.business}`)}`;

  return (
    <>
      <ScrollFX />
      <a className="skip" href="#main">
        {de.nav.skip}
      </a>
      <Header t={de} home="/de" solid />

      <main id="main" className="prospect">
        <section className="prospect__intro">
          <div className="wrap">
            <p className="prospect__label">{COPY.label(p.business)}</p>
            <RiseText as="h1" className="prospect__title" text={COPY.title(p.business)} />
            <div className="prospect__letter" data-reveal>
              <p>{COPY.greeting(p.contact)}</p>
              <p>{COPY.intro}</p>
              {p.note ? <p>{p.note}</p> : null}
            </div>
            <figure className="compare-figure prospect__compare">
              <BeforeAfter
                intro
                before={{ src: p.before, width: 1440, height: 900, alt: COPY.beforeAlt(p.business) }}
                after={{ src: p.before, width: 1440, height: 900, alt: COPY.afterAlt(p.business) }}
                afterNode={
                  <ScaledFrame width={1440} height={900}>
                    <MockSite mock={p.mock} />
                  </ScaledFrame>
                }
                beforeLabel={COPY.before}
                afterLabel={COPY.after}
                sliderLabel={COPY.slider}
              />
              <figcaption className="caption">
                {COPY.hint} {COPY.draftNote}
              </figcaption>
            </figure>
          </div>
        </section>

        <section className="prospect__changes" aria-labelledby="changes-title">
          <div className="wrap prospect__changes-inner">
            <RiseText id="changes-title" className="h2" text={COPY.changesTitle} />
            <ul className="terms__list prospect__list" data-reveal>
              {changes.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        </section>

        <Cost t={de.cost} lang="de" />
        <About t={de.about} />

        <section className="prospect__next" aria-labelledby="next-title">
          <div className="wrap prospect__next-inner">
            <RiseText id="next-title" className="statement" text={COPY.nextTitle} />
            <div data-reveal>
              <p className="prospect__next-body">{COPY.next}</p>
              <a className="btn btn--primary" href={mail} data-event="prospect-reply">
                {COPY.reply}
              </a>
              <p className="prospect__expires">{COPY.expires(until)}</p>
            </div>
          </div>
        </section>
      </main>

      <Footer t={de} />
    </>
  );
}
