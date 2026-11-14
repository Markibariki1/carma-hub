import { site } from '@/site.config';

/**
 * Follow-up email after a phone call, filled in from a few details.
 *
 * The wording follows the project doc "Follow-up email after a phone call":
 *   Version A (fixed quote)     when a build fee is given
 *   Version B (quote to follow) when the build fee is left empty
 * each in German and English. Used by the private /send page for the live preview
 * and by the server action that sends the email, so both always match.
 */

export type FollowUpInput = {
  lang: 'de' | 'en';
  /** 'f' = Frau / Ms, 'm' = Herr / Mr */
  salutation: 'f' | 'm';
  lastName: string;
  business: string;
  /** One-off build fee in euros. null sends Version B with the price range. */
  buildFee: number | null;
  /** Monthly care fee in euros. null uses the starting price from site.config.ts. */
  careFee: number | null;
  /** Optional growth package, per month. */
  growthFee: number | null;
  /** The one sentence from the call. Empty leaves the paragraph out. */
  sentence: string;
  /** Typical weeks until launch. null leaves the timing out. */
  weeks: number | null;
  /** Day of the call as YYYY-MM-DD, and today's date in the same form. */
  callDate: string;
  today: string;
};

type Block =
  | { type: 'p'; text: string }
  | { type: 'h'; text: string }
  | { type: 'ul' | 'ol'; items: string[] };

export type FollowUp = { version: 'A' | 'B'; subject: string; text: string; html: string };

/** "500", "500 €", "39,99" → number; empty → null; anything else → NaN. */
export function parseEuro(raw: string): number | null {
  const s = raw.replace(/[€\s]/g, '').replace(',', '.');
  if (!s) return null;
  if (!/^\d{1,6}(\.\d{1,2})?$/.test(s)) return NaN;
  return Number(s);
}

function euro(n: number, lang: 'de' | 'en') {
  const digits = Number.isInteger(n) ? 0 : 2;
  const s = n.toLocaleString(lang === 'de' ? 'de-DE' : 'en-GB', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
  return lang === 'de' ? `${s} €` : `€${s}`;
}

function callDay(input: FollowUpInput) {
  const { lang, callDate, today } = input;
  if (!callDate || callDate === today) return lang === 'de' ? 'heute' : 'today';
  const d = new Date(`${callDate}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return lang === 'de' ? 'heute' : 'today';
  const s = d.toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-GB', { day: 'numeric', month: 'long', timeZone: 'UTC' });
  return lang === 'de' ? `am ${s}` : `on ${s}`;
}

function signature(lang: 'de' | 'en'): string {
  const phone = site.contact.phone || site.owner.phone;
  const web = lang === 'de' ? 'www.carmasearch.com/de' : 'www.carmasearch.com';
  const lines =
    lang === 'de'
      ? ['Mit freundlichen Grüßen', '', site.owner.fullName, 'Carma | Kleiner Betrieb. Großer Auftritt.', 'Hagnau am Bodensee']
      : ['Kind regards,', '', site.owner.fullName, 'Carma | Flagship websites for small businesses', 'Hagnau am Bodensee, Germany'];
  lines.push([site.owner.email, web, phone].filter(Boolean).join(' | '));
  return lines.join('\n');
}

function blocksDe(i: FollowUpInput, day: string): { subject: string; blocks: Block[] } {
  const b = i.business;
  const greeting = i.salutation === 'f' ? `Sehr geehrte Frau ${i.lastName},` : `Sehr geehrter Herr ${i.lastName},`;
  const sentence: Block[] = i.sentence ? [{ type: 'p', text: i.sentence }] : [];

  if (i.buildFee === null) {
    return {
      subject: `Unser Telefonat: eine neue Website für ${b}`,
      blocks: [
        { type: 'p', text: greeting },
        { type: 'p', text: `vielen Dank für das freundliche Telefonat ${day}. Wie besprochen erhalten Sie hier einen kurzen Überblick über Carma und das weitere Vorgehen.` },
        ...sentence,
        { type: 'p', text: 'Carma baut veraltete Websites kleiner Betriebe zu schnellen, modernen Auftritten um, die Sie selbst pflegen können, und betreut sie nach dem Livegang weiter. Ihre bestehenden Texte, Fotos und Produkte werden übernommen, das Design entsteht individuell für Ihr Unternehmen statt aus einer Vorlage, und über einen WhatsApp-Button und ein Kontaktformular erreichen Kunden Sie ganz einfach. Vom ersten Gespräch bis nach dem Livegang haben Sie mit mir einen festen Ansprechpartner.' },
        { type: 'p', text: 'Ein Beispiel: Die Website meines letzten Projekts, Shang Antique in Singapur, erreicht bei Google Lighthouse 97/100 Punkte für die mobile Geschwindigkeit und 100/100 Punkte für Suchmaschinenoptimierung; alle 117 Stücke der Sammlung wurden übernommen. Den Vorher-nachher-Vergleich finden Sie auf www.carmasearch.com/de.' },
        { type: 'h', text: 'Preise' },
        { type: 'ul', items: [
          `Design und Umsetzung: in der Regel ${site.pricing.buildFrom}–${euro(site.pricing.buildTo, 'de')}, einmalig, je nach Art und Größe Ihres Betriebs, fällig erst nach dem Livegang`,
          `Hosting und Betreuung: ab ${euro(site.pricing.careFrom, 'de')} pro Monat`,
          'Alle Preise netto, zzgl. gesetzlicher MwSt., sofern anfallend. Es gibt keine Mindestlaufzeit; die Betreuung ist mit einer Frist von 30 Tagen kündbar.',
        ] },
        { type: 'p', text: 'Bevor die Arbeit beginnt, erhalten Sie ein schriftliches Festpreisangebot. Damit ich es genau ausarbeiten kann, senden Sie mir bitte:' },
        { type: 'ul', items: [
          'die Adresse Ihrer aktuellen Website, falls vorhanden',
          'ungefähr, wie viele Seiten oder Produkte Sie haben',
          'was die neue Website können soll, was die jetzige nicht kann',
        ] },
        { type: 'p', text: 'Das Angebot ist unverbindlich: Sie können es in Ruhe prüfen und dann entscheiden.' },
      ],
    };
  }

  const care = i.careFee ?? site.pricing.careFrom;
  const quote = [
    `Design und Umsetzung: ${euro(i.buildFee, 'de')}, einmalig, fällig erst nach dem Livegang`,
    `Hosting und Betreuung: ${euro(care, 'de')} pro Monat für Hosting, Sicherheitsupdates, Backups, Fehlerbehebung und kleinere monatliche Änderungen`,
  ];
  if (i.growthFee !== null) {
    quote.push(`Wachstumspaket: ${euro(i.growthFee, 'de')} pro Monat für monatliche Artikel, Backlinks, Social-Media-Beiträge und die Auswertung, ob KI-Assistenten Ihr Unternehmen empfehlen`);
  }
  return {
    subject: `Ihr Angebot für eine neue Website: ${b}`,
    blocks: [
      { type: 'p', text: greeting },
      { type: 'p', text: `vielen Dank für das freundliche Telefonat ${day}. Wie besprochen erhalten Sie hier einen Überblick, wie Carma die Website von ${b} neu aufbauen und anschließend betreuen würde, zusammen mit einem Festpreisangebot.` },
      ...sentence,
      { type: 'h', text: 'Leistungsumfang' },
      { type: 'ul', items: [
        `Ein eigenes Design für ${b}, keine Vorlage, optimiert für Smartphone, Tablet und Computer`,
        'Übernahme aller bestehenden Texte, Fotos und Produkte, sodass nichts verloren geht oder neu abgetippt werden muss',
        'Ein einfacher Editor, mit dem Sie Produkte, Beiträge und Öffnungszeiten selbst pflegen, inklusive kurzer Einweisung',
        'Ein WhatsApp-Button auf jeder Seite und ein Kontaktformular, das direkt in Ihrem Postfach ankommt',
        'Schnelle Ladezeiten, saubere SEO-Grundlagen und Weiterleitungen, damit alte Links und Ihre Google-Platzierungen erhalten bleiben',
      ] },
      { type: 'h', text: 'Referenz: Shang Antique, Singapur' },
      { type: 'p', text: 'Shang Antique handelt seit 1984 mit Antiquitäten. Die alte Website versteckte die Sammlung hinter Pop-ups; die neue stellt jedes Stück in den Mittelpunkt und macht eine Anfrage mit einem Klick möglich. Gemessen mit Google Lighthouse im November 2026:' },
      { type: 'ul', items: [
        '97/100 Punkte für die mobile Geschwindigkeit',
        '2,1 Sekunden Ladezeit bei langsamer mobiler Verbindung',
        '100/100 Punkte für Suchmaschinenoptimierung',
        '117 Stücke mit Fotos und Details übernommen',
      ] },
      { type: 'p', text: 'Website: shangantique.com | Vorher-nachher-Vergleich: www.carmasearch.com/de' },
      { type: 'h', text: 'Ihr Festpreisangebot' },
      { type: 'ul', items: quote },
      { type: 'p', text: 'Alle Preise netto, zzgl. gesetzlicher MwSt., sofern anfallend.' },
      { type: 'h', text: 'Ihre Konditionen' },
      { type: 'ul', items: [
        'Keine Mindestlaufzeit: Die Betreuung ist mit einer Frist von 30 Tagen kündbar, und ich unterstütze Sie beim Umzug der Website',
        'Domain, Zugangsdaten und Inhalte bleiben Ihr Eigentum; die Website gehört Ihnen, sobald die Umsetzung bezahlt ist',
        'Am Telefon wird nichts vereinbart: Sie entscheiden in Ruhe',
      ] },
      { type: 'h', text: 'So geht es weiter' },
      { type: 'ol', items: [
        'Sie bestätigen das Angebot und senden mir bei Bedarf ein aktuelles Logo oder neue Fotos (gern arbeite ich auch mit dem Vorhandenen)',
        'Ich gestalte und baue die Website und zeige Ihnen eine Vorschau',
        `Wir stimmen den Feinschliff gemeinsam ab, dann geht die Seite live${i.weeks ? `, in der Regel innerhalb von ${i.weeks} Wochen` : ''}`,
        'Ich führe Sie durch den Editor und betreue die Website ab dann laufend',
      ] },
      { type: 'h', text: 'Nächster Schritt' },
      { type: 'p', text: 'Wenn Sie das Angebot annehmen möchten, antworten Sie einfach auf diese E-Mail, und ich sende Ihnen die Vereinbarung zu. Bei Fragen stehe ich gern für ein weiteres Telefonat zur Verfügung oder komme, wenn Sie in der Nähe sind, auch persönlich vorbei.' },
    ],
  };
}

function blocksEn(i: FollowUpInput, day: string): { subject: string; blocks: Block[] } {
  const b = i.business;
  const greeting = `Dear ${i.salutation === 'f' ? 'Ms' : 'Mr'} ${i.lastName},`;
  const sentence: Block[] = i.sentence ? [{ type: 'p', text: i.sentence }] : [];

  if (i.buildFee === null) {
    return {
      subject: `Following up on our call: a new website for ${b}`,
      blocks: [
        { type: 'p', text: greeting },
        { type: 'p', text: `Thank you for your time on the phone ${day}. As promised, here is a short overview of what Carma does and how we would proceed.` },
        ...sentence,
        { type: 'p', text: 'Carma rebuilds outdated small-business websites into fast, modern sites that you can update yourself, and looks after them once they are live. Your existing texts, photos and products are moved over, the design is made for your business rather than taken from a template, and a WhatsApp button and contact form make it easy for customers to reach you. You have one point of contact, me, from the first call through launch and beyond.' },
        { type: 'p', text: 'As an example, my most recent project, Shang Antique in Singapore, now scores 97/100 for mobile speed and 100/100 for search readiness on Google Lighthouse, with all 117 pieces of the collection moved over. You can see the before and after at www.carmasearch.com.' },
        { type: 'h', text: 'Pricing' },
        { type: 'ul', items: [
          `Design and build: typically €${site.pricing.buildFrom}–${site.pricing.buildTo}, one-off, depending on the type and size of your business, payable only once the site is live`,
          `Hosting and care: from ${euro(site.pricing.careFrom, 'en')} per month`,
          "Prices are net, plus VAT where applicable. There is no minimum term, and care can be cancelled with 30 days' notice.",
        ] },
        { type: 'p', text: 'Before any work begins, you receive a fixed written quote. To prepare it, could you send me:' },
        { type: 'ul', items: [
          'Your current website address, if you have one',
          'Roughly how many pages or products you have',
          'Anything you would like the new site to do that the current one does not',
        ] },
        { type: 'p', text: 'There is no obligation: you can review the quote and decide in your own time.' },
      ],
    };
  }

  const care = i.careFee ?? site.pricing.careFrom;
  const quote = [
    `Design and build: ${euro(i.buildFee, 'en')}, one-off, payable only once your site is live`,
    `Hosting and care: ${euro(care, 'en')} per month, covering hosting, security updates, backups, fixes and small monthly changes`,
  ];
  if (i.growthFee !== null) {
    quote.push(`Growth package: ${euro(i.growthFee, 'en')} per month for monthly articles, backlinks, social posts and tracking of whether AI assistants recommend your business`);
  }
  return {
    subject: `Your website proposal: ${b}`,
    blocks: [
      { type: 'p', text: greeting },
      { type: 'p', text: `Thank you for your time on the phone ${day}. As promised, here is an overview of how Carma would rebuild and look after the website for ${b}, together with a fixed quote.` },
      ...sentence,
      { type: 'h', text: 'What is included' },
      { type: 'ul', items: [
        `A custom design for ${b}, not a template, built for phones, tablets and desktops`,
        'All existing texts, photos and products moved over, so nothing is lost or needs retyping',
        'A simple editor to update products, posts and opening hours yourself, with a short walkthrough at handover',
        'A WhatsApp button on every page and a contact form that delivers straight to your inbox',
        'Fast loading, clean search foundations, and redirects so your old links and Google rankings keep working',
      ] },
      { type: 'h', text: 'Recent work: Shang Antique, Singapore' },
      { type: 'p', text: 'Shang Antique has dealt in antiques since 1984. Its old website hid the collection behind pop-ups; the new one puts every piece first and makes an enquiry a single tap. Measured with Google Lighthouse in November 2026:' },
      { type: 'ul', items: [
        '97/100 mobile speed score',
        '2.1 seconds to load on slow mobile data',
        '100/100 search-readiness score',
        '117 pieces moved over with photos and details',
      ] },
      { type: 'p', text: 'Live site: shangantique.com | Before and after: www.carmasearch.com' },
      { type: 'h', text: 'Your fixed quote' },
      { type: 'ul', items: quote },
      { type: 'p', text: 'All prices are net, plus VAT where applicable.' },
      { type: 'h', text: 'Your terms' },
      { type: 'ul', items: [
        "No minimum term: care can be cancelled with 30 days' notice, and I will help you move the site if you ever leave",
        'Your domain, logins and content remain yours, and the website is yours once the build fee is paid',
        'Nothing is agreed by phone: you decide in your own time',
      ] },
      { type: 'h', text: 'How it works' },
      { type: 'ol', items: [
        'You confirm the quote and, if you like, send an updated logo or photos (I am happy to work with what you have)',
        'I design and build the site and share a preview with you',
        `We refine it together, then launch${i.weeks ? `, typically within ${i.weeks} weeks` : ''}`,
        'I walk you through the editor and look after the site from then on',
      ] },
      { type: 'h', text: 'Next step' },
      { type: 'p', text: 'If you would like to proceed, simply reply to this email and I will send you the agreement. If you have any questions, I am happy to arrange another call or, if you are nearby, to visit in person.' },
    ],
  };
}

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

function toText(blocks: Block[], sig: string) {
  const parts = blocks.map((b) => {
    if (b.type === 'p') return b.text;
    if (b.type === 'h') return b.text.toUpperCase();
    return b.items.map((it, n) => (b.type === 'ol' ? `${n + 1}. ${it}` : `- ${it}`)).join('\n');
  });
  return `${parts.join('\n\n')}\n\n${sig}\n`;
}

function toHtml(blocks: Block[], sig: string) {
  const p = 'margin:0 0 16px';
  const body = blocks
    .map((b) => {
      if (b.type === 'p') return `<p style="${p}">${esc(b.text)}</p>`;
      if (b.type === 'h') return `<p style="margin:24px 0 8px"><strong>${esc(b.text)}</strong></p>`;
      const items = b.items.map((it) => `<li style="margin:0 0 6px">${esc(it)}</li>`).join('');
      return `<${b.type} style="margin:0 0 16px;padding-left:22px">${items}</${b.type}>`;
    })
    .join('');
  const sigHtml = sig
    .split('\n\n')
    .map((part) => `<p style="${p}">${esc(part).replace(/\n/g, '<br>')}</p>`)
    .join('');
  return `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#14171a;max-width:640px">${body}<div style="margin-top:24px">${sigHtml}</div></div>`;
}

export function buildFollowUp(input: FollowUpInput): FollowUp {
  const i = { ...input, lastName: input.lastName.trim(), business: input.business.trim(), sentence: input.sentence.trim() };
  const day = callDay(i);
  const { subject, blocks } = i.lang === 'de' ? blocksDe(i, day) : blocksEn(i, day);
  const sig = signature(i.lang);
  return { version: i.buildFee === null ? 'B' : 'A', subject, text: toText(blocks, sig), html: toHtml(blocks, sig) };
}
