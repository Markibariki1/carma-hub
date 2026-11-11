/**
 * Business details used across the site (footer, Impressum, Datenschutz, contact).
 * Anything in [square brackets] still needs Marc's real details before launch:
 * German law requires a correct Impressum on a business website.
 */
export const site = {
  name: 'Carma',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://carma-hub.vercel.app',
  owner: {
    fullName: '[Vor- und Nachname]',
    street: '[Straße und Hausnummer]',
    city: '[PLZ Ort]',
    country: 'Deutschland',
    email: '[E-Mail-Adresse]',
    phone: '', // optional, e.g. '+49 …'
    vatId: '', // USt-IdNr., if one exists
  },
} as const;

/** True once the placeholder details above have been replaced. */
export const ownerDetailsComplete = !Object.values(site.owner).some(
  (v) => typeof v === 'string' && v.startsWith('['),
);
