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

/**
 * Prices laid out like a written quote: one line per item, what it covers on the left,
 * the price on the right, then the terms. Switchable in site.config (pricing.show).
 */
export function Cost({ t, lang }: { t: Dict['cost']; lang: Lang }) {
  const p = site.pricing;
  return (
    <section className="cost" id="cost" aria-labelledby="cost-title">
      <div className="wrap">
        <RiseText id="cost-title" className="h2" text={t.title} />

        {p.show ? (
          <>
            <div className="quote">
              <div className="quote__row">
                <div className="quote__what">
                  <h3 className="quote__name">{t.build}</h3>
                  <p className="quote__note">{t.buildNote}</p>
                </div>
                <p className="quote__price">
                  {range(lang, p.buildFrom, p.buildTo)}
                  <span className="quote__unit">{t.once}</span>
                </p>
              </div>

              <div className="quote__row">
                <div className="quote__what">
                  <h3 className="quote__name">{t.care}</h3>
                  <p className="quote__note">{t.careNote}</p>
                </div>
                <p className="quote__price">
                  <span className="quote__from">{t.from}</span> {eur(lang, p.careFrom, 2)}
                  <span className="quote__unit">{t.perMonth}</span>
                </p>
              </div>

              <div className="quote__row">
                <div className="quote__what">
                  <h3 className="quote__name">
                    {t.growth} <span className="quote__optional">{t.growthTag}</span>
                  </h3>
                  <ul className="quote__items">
                    {t.growthItems.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                  <p className="quote__note">{t.growthNote}</p>
                </div>
                <p className="quote__price">
                  {p.growthFrom ? (
                    <>
                      <span className="quote__from">{t.from}</span> {eur(lang, p.growthFrom, 2)}
                      <span className="quote__unit">{t.perMonth}</span>
                    </>
                  ) : (
                    <span className="quote__onrequest">{t.onRequest}</span>
                  )}
                </p>
              </div>
            </div>
            <p className="quote__vat">{t.vatNote}</p>
          </>
        ) : (
          <div className="cost__plain">
            {t.body.map((b) => (
              <p key={b}>{b}</p>
            ))}
          </div>
        )}

        <div className="terms">
          <h3 className="terms__title">{t.termsTitle}</h3>
          <ul className="terms__list">
            {t.terms.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
