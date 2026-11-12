import type { Dict } from '@/content/types';
import { site } from '@/site.config';

/** schema.org description of the business, for Google's knowledge panel and local results. */
export function businessJsonLd(t: Dict) {
  const o = site.owner;
  const [postalCode, ...town] = o.city.split(' ');
  const p = site.pricing;
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${site.url}/#business`,
    name: site.name,
    description: t.meta.description,
    url: t.lang === 'de' ? `${site.url}/de` : site.url,
    image: `${site.url}/og-${t.lang}.jpg`,
    logo: `${site.url}/apple-icon.png`,
    email: o.email,
    ...(site.contact.phone ? { telephone: site.contact.phone } : {}),
    ...(p.show ? { priceRange: `€${p.buildFrom}–€${p.buildTo}` } : {}),
    founder: { '@type': 'Person', name: o.fullName },
    address: {
      '@type': 'PostalAddress',
      streetAddress: o.street,
      postalCode,
      addressLocality: town.join(' '),
      addressCountry: 'DE',
    },
    areaServed: [{ '@type': 'Country', name: 'Germany' }, { '@type': 'Country', name: 'Austria' }, { '@type': 'Country', name: 'Switzerland' }],
    knowsLanguage: ['de', 'en'],
  };
}
