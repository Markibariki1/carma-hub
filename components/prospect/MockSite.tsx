import type { Prospect } from '@/content/prospects/types';

/**
 * A first-draft home page for a prospect, built from material on their own site
 * (name, headline, logo, brand colour, hero photo). Rendered at a fixed 1440 × 900
 * and scaled into place by ScaledFrame, so it looks like a real screenshot but stays crisp.
 */
export function MockSite({ mock, lang = 'de' }: { mock: Prospect['mock']; lang?: 'de' | 'en' }) {
  const c = mock.color || '#2633c9';
  const words = lang === 'de' ? { contact: 'Kontakt aufnehmen', call: 'Anrufen', more: 'Mehr erfahren', wa: 'WhatsApp' } : { contact: 'Get in touch', call: 'Call', more: 'Learn more', wa: 'WhatsApp' };
  const nav = mock.nav.slice(0, 4);
  return (
    <div className="mock" style={{ ['--mock' as string]: c }}>
      <header className="mock__bar">
        {mock.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="mock__logo" src={mock.logo} alt="" />
        ) : (
          <span className="mock__name">{mock.name}</span>
        )}
        <nav className="mock__nav">
          {nav.map((n) => (
            <span key={n}>{n}</span>
          ))}
        </nav>
        <span className="mock__btn mock__btn--small">{words.contact}</span>
      </header>
      <section className="mock__hero">
        <div className="mock__copy">
          <p className="mock__kicker">{[mock.name, mock.city].filter(Boolean).join(', ')}</p>
          <h2 className="mock__headline">{mock.headline}</h2>
          <p className="mock__lede">{mock.lede}</p>
          <div className="mock__actions">
            <span className="mock__btn">{words.contact}</span>
            {mock.phone ? <span className="mock__link">{`${words.call}: ${mock.phone}`}</span> : <span className="mock__link">{words.more}</span>}
          </div>
        </div>
        <div className="mock__photo">
          {mock.hero ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mock.hero} alt="" />
          ) : (
            <span className="mock__photo-fill" />
          )}
        </div>
      </section>
      <section className="mock__strip">
        {(nav.length ? nav.slice(0, 3) : ['', '', '']).map((n, i) => (
          <div key={i} className="mock__card">
            <span className="mock__card-t">{n}</span>
            <span className="mock__card-l" />
            <span className="mock__card-l mock__card-l--short" />
          </div>
        ))}
      </section>
      <span className="mock__wa">{words.wa}</span>
    </div>
  );
}
