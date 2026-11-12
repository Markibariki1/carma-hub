/**
 * Business details used across the site (footer, Impressum, Datenschutz, contact).
 * Anything in [square brackets] still needs Marc's real details before launch:
 * German law requires a correct Impressum on a business website.
 */
export const site = {
  name: 'Carma',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.carmasearch.com',
  owner: {
    fullName: 'Marc Haupter',
    street: 'Meersburger Straße 13',
    city: '88709 Hagnau am Bodensee',
    country: 'Deutschland',
    email: 'marchaupter@outlook.com', // swap for the business address once it exists
    phone: '', // optional, e.g. '+49 …'
    vatId: '', // USt-IdNr., if one exists
  },
  /** Public contact shown on the homepage. Leave empty to hide the buttons. */
  contact: {
    /** Shown as a tap-to-call button, e.g. '+49 151 2345678'. */
    phone: '' as string,
    /** WhatsApp number in international format without + or spaces, e.g. '491512345678'. */
    whatsapp: '' as string,
  },
  /** Portrait for the "who you deal with" block, e.g. '/marc.jpg' in /public. Empty shows initials. */
  photo: '' as string,
  /** Prices shown on the homepage. Set show to false to go back to "fixed quote after the first call". */
  pricing: {
    show: true as boolean,
    buildFrom: 500,
    buildTo: 900,
    carePerMonth: 39.99,
  },
} as const;

/** True once the placeholder details above have been replaced. */
export const ownerDetailsComplete = !Object.values(site.owner).some(
  (v) => typeof v === 'string' && v.startsWith('['),
);
