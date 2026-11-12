import type { Lang } from './types';

/**
 * Case studies. Each one renders at /work/<slug> (English) and /de/arbeiten/<slug> (German)
 * from the same template, so adding a project means adding an entry here plus its images
 * in /public/work.
 */

type Shot = { src: string; srcSet?: string; width: number; height: number };

export type CaseText = {
  metaTitle: string;
  metaDescription: string;
  client: string;
  place: string;
  summary: string;
  details: { label: string; value: string }[];
  compareHint: string;
  beforeAlt: string;
  afterAlt: string;
  story: { title: string; body: string }[];
  facts: { title: string; body: string }[];
  productCaption: string;
  productAlt: string;
  phoneCaption: string;
  beforePhoneAlt: string;
  afterPhoneAlt: string;
  collectionCaption: string;
  collectionAlt: string;
  visit: string;
  /** A real quote from the client. Leave null until they have given one. */
  quote: { text: string; by: string } | null;
};

export type CaseStudy = {
  slug: string;
  url: string;
  images: { before: Shot; after: Shot; product: Shot; collection: Shot; beforePhone: Shot; afterPhone: Shot };
  text: Record<Lang, CaseText>;
};

const W = '/work/';
const desk = (name: string): Shot => ({
  src: `${W}${name}-1800.webp`,
  srcSet: `${W}${name}-1000.webp 1000w, ${W}${name}-1800.webp 1800w`,
  width: 1800,
  height: 1125,
});
const phone = (name: string): Shot => ({ src: `${W}${name}.webp`, width: 600, height: 1298 });

export const cases: CaseStudy[] = [
  {
    slug: 'shang-antique',
    url: 'https://shangantique.com',
    images: {
      before: desk('shang-before'),
      after: desk('shang-after'),
      product: desk('shang-product'),
      collection: desk('shang-collection'),
      beforePhone: phone('shang-before-phone'),
      afterPhone: phone('shang-after-phone'),
    },
    text: {
      en: {
        metaTitle: 'Shang Antique website redesign – Carma',
        metaDescription:
          'How an antiques dealer in Singapore got a website that shows the collection, takes enquiries by WhatsApp and is run by the owner himself.',
        client: 'Shang Antique',
        place: 'Antiques dealer in Singapore, since 1984',
        summary:
          'The old site hid a remarkable collection behind pop-ups, a cropped banner and a shopping cart nobody needed. The new one puts every piece front and centre and turns an enquiry into a single tap.',
        details: [
          { label: 'Client', value: 'Shang Antique, Singapore' },
          { label: 'Year', value: '2026' },
          { label: 'Work', value: 'Redesign, content move, editor, care' },
        ],
        compareHint: 'Drag the handle to compare the old and new home page.',
        beforeAlt: 'Shang Antique’s old home page',
        afterAlt: 'Shang Antique’s new home page',
        story: [
          {
            title: 'The problem',
            body: 'Visitors landed on pop-ups and a cropped banner. The pieces themselves were hard to find, and a shopping cart suggested one-click buying, which is not how antiques are sold.',
          },
          {
            title: 'What we did',
            body: 'We moved all 117 pieces over with their photos and details, designed a calm gallery that lets each piece breathe, and replaced the cart with an enquiry button that opens WhatsApp with the piece already named.',
          },
          {
            title: 'Where it is now',
            body: 'The owner adds new pieces and journal posts himself in a simple editor. Old addresses redirect to the new pages, so links from Google and old emails still work.',
          },
        ],
        facts: [
          { title: '117 pieces moved over', body: 'With photos, origin, period and dimensions from the old shop.' },
          { title: 'Enquiries by WhatsApp', body: 'The message already names the piece, so the customer types nothing.' },
          { title: 'Run by the owner', body: 'He adds new pieces and blog posts himself.' },
          { title: 'Old links still work', body: 'Previous addresses redirect to the new pages.' },
        ],
        productCaption: 'Every piece gets its own page with all the details.',
        productAlt: 'Product page for a Buddha statue on the new website',
        phoneCaption: 'On a phone, before and after.',
        beforePhoneAlt: 'Old website on a phone',
        afterPhoneAlt: 'New website on a phone',
        collectionCaption: 'The collection, filterable by origin and material.',
        collectionAlt: 'Collection overview with filters',
        visit: 'Visit shangantique.com',
        quote: null,
      },
      de: {
        metaTitle: 'Redesign für Shang Antique – Carma',
        metaDescription:
          'Wie ein Antiquitätenhändler in Singapur eine Website bekam, die seine Sammlung zeigt, Anfragen per WhatsApp annimmt und die er selbst pflegt.',
        client: 'Shang Antique',
        place: 'Antiquitätenhandel in Singapur, seit 1984',
        summary:
          'Die alte Seite versteckte eine besondere Sammlung hinter Pop-ups, einem abgeschnittenen Banner und einem Warenkorb, den niemand brauchte. Die neue Seite stellt jedes Stück groß in den Mittelpunkt und macht die Anfrage zu einem Fingertipp.',
        details: [
          { label: 'Kunde', value: 'Shang Antique, Singapur' },
          { label: 'Jahr', value: '2026' },
          { label: 'Leistung', value: 'Redesign, Umzug der Inhalte, Editor, Betreuung' },
        ],
        compareHint: 'Den Regler ziehen, um alte und neue Startseite zu vergleichen.',
        beforeAlt: 'Alte Startseite von Shang Antique',
        afterAlt: 'Neue Startseite von Shang Antique',
        story: [
          {
            title: 'Das Problem',
            body: 'Besucher landeten auf Pop-ups und einem abgeschnittenen Banner. Die Stücke selbst waren schwer zu finden, und ein Warenkorb versprach Kauf per Klick. So werden Antiquitäten nicht verkauft.',
          },
          {
            title: 'Was wir gemacht haben',
            body: 'Wir haben alle 117 Stücke mit Fotos und Angaben übernommen, eine ruhige Galerie gestaltet, in der jedes Stück wirken kann, und den Warenkorb durch einen Anfrage-Button ersetzt, der WhatsApp mit dem Namen des Stücks öffnet.',
          },
          {
            title: 'Wo es jetzt steht',
            body: 'Der Inhaber stellt neue Stücke und Beiträge selbst in einem einfachen Editor online. Alte Adressen leiten auf die neuen Seiten weiter, Links aus Google und alten E-Mails funktionieren also weiter.',
          },
        ],
        facts: [
          { title: '117 Stücke übernommen', body: 'Mit Fotos, Herkunft, Epoche und Maßen aus dem alten Shop.' },
          { title: 'Anfragen per WhatsApp', body: 'Die Nachricht nennt das Stück schon, der Kunde muss nichts abtippen.' },
          { title: 'Vom Inhaber gepflegt', body: 'Neue Stücke und Blogbeiträge stellt er selbst online.' },
          { title: 'Alte Links funktionieren', body: 'Frühere Adressen leiten auf die neuen Seiten weiter.' },
        ],
        productCaption: 'Jedes Stück bekommt eine eigene Seite mit allen Details.',
        productAlt: 'Produktseite einer Buddha-Statue auf der neuen Website',
        phoneCaption: 'Auf dem Handy, vorher und nachher.',
        beforePhoneAlt: 'Alte Website auf dem Handy',
        afterPhoneAlt: 'Neue Website auf dem Handy',
        collectionCaption: 'Die Sammlung, filterbar nach Herkunft und Material.',
        collectionAlt: 'Übersicht der Sammlung mit Filtern',
        visit: 'shangantique.com ansehen',
        quote: null,
      },
    },
  },
];

export const getCase = (slug: string) => cases.find((c) => c.slug === slug);
