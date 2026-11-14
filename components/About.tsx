import type { Dict } from '@/content/types';
import { site } from '@/site.config';
import { RiseText } from './RiseText';

/** "Who you deal with": a face, a name, a town, and direct ways to reach Marc. */
export function About({ t }: { t: Dict['about'] }) {
  const { phone, whatsapp } = site.contact;
  return (
    <section className="about" aria-labelledby="about-title">
      <div className={`wrap about__inner${site.photo ? '' : ' about__inner--text'}`}>
        {site.photo ? (
          <div className="about__portrait">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={site.photo} alt={t.name} width={800} height={1000} loading="lazy" decoding="async" />
          </div>
        ) : null}
        <div className="about__text">
          <RiseText id="about-title" className="h2" text={t.title} />
          {t.body.map((p) => (
            <p key={p} className="about__body" data-reveal>
              {p}
            </p>
          ))}
          <p className="about__sign" data-reveal>
            <span className="about__name">{t.name}</span>
            <span className="about__place">{t.place}</span>
          </p>
          <div className="about__actions" data-reveal>
            {phone ? (
              <a className="btn btn--primary" href={`tel:${phone.replace(/[^+\d]/g, '')}`} data-event="call">
                {t.call} <span className="about__num">{phone}</span>
              </a>
            ) : null}
            {whatsapp ? (
              <a
                className="btn btn--ghost"
                href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(t.whatsappText)}`}
                target="_blank"
                rel="noopener noreferrer"
                data-event="whatsapp"
              >
                {t.whatsapp}
              </a>
            ) : null}
            <a className={phone || whatsapp ? 'link' : 'btn btn--ghost'} href={`mailto:${site.owner.email}`} data-event="email">
              {t.email}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
