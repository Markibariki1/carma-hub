import type { Dict, Lang } from '@/content/types';
import { site } from '@/site.config';
import { RiseText } from './RiseText';

const eur = (lang: Lang, n: number, decimals = 0) =>
  new Intl.NumberFormat(lang === 'de' ? 'de-DE' : 'en-IE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);

/** Price range from config, e.g. "€500–900" / "500–900 €". */
function range(lang: Lang, from: number, to: number) {
  const nf = new Intl.NumberFormat(lang === 'de' ? 'de-DE' : 'en-IE');
  return lang === 'de' ? `${nf.format(from)}–${nf.format(to)} €` : `€${nf.format(from)}–${nf.format(to)}`;
}

/** Prices (switchable in site.config) plus the written terms. */
export function Cost({ t, lang }: { t: Dict['cost']; lang: Lang }) {
  const p = site.pricing;
  return (
    <section className="cost" id="cost" aria-labelledby="cost-title">
      <div className="wrap cost__inner">
        <RiseText id="cost-title" className="h2" text={t.title} />
        <div className="cost__body">
          {p.show ? (
            <>
              <dl className="prices" data-reveal>
                <div className="price">
                  <dt className="price__label">{t.build}</dt>
                  <dd className="price__value">{range(lang, p.buildFrom, p.buildTo)}</dd>
                  <dd className="price__note">{t.buildNote}</dd>
                </div>
                <div className="price">
                  <dt className="price__label">{t.care}</dt>
                  <dd className="price__value">
                    <span className="price__from">{t.from}</span> {eur(lang, p.careFrom, 2)}{' '}
                    <span className="price__per">{t.perMonth}</span>
                  </dd>
                  <dd className="price__note">{t.careNote}</dd>
                </div>
                <div className="price price--wide">
                  <dt className="price__label">
                    {t.growth} <span className="price__tag">{t.growthTag}</span>
                  </dt>
                  <dd className="price__value price__value--small">
                    {p.growthFrom ? (
                      <>
                        <span className="price__from">{t.from}</span> {eur(lang, p.growthFrom, 2)}{' '}
                        <span className="price__per">{t.perMonth}</span>
                      </>
                    ) : (
                      t.onRequest
                    )}
                  </dd>
                  <dd className="price__note">{t.growthNote}</dd>
                </div>
              </dl>
              <p className="price__vat" data-reveal>
                {t.vatNote}
              </p>
            </>
          ) : (
            <div data-reveal>
              {t.body.map((b) => (
                <p key={b}>{b}</p>
              ))}
            </div>
          )}
          <div className="terms" data-reveal>
            <h3 className="terms__title">{t.termsTitle}</h3>
            <ul className="terms__list">
              {t.terms.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
