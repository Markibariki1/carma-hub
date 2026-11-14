import { site } from '@/site.config';

/**
 * Follow-up email after a phone call, filled in from a few details.
 *
 * Four emails: two kinds, each in German and English.
 *   'info'   the client asked for more information (shows the price range)
 *   'offer'  a straight offer with the build fee and monthly fee agreed on the phone
 *
 * draftFollowUp() writes the subject and the plain text. On the private /send page that
 * text can be edited freely before sending; textToHtml() then turns whatever is in the
 * box into the email, and adds the Carma logo at the bottom.
 *
 * Text format (kept simple so it is easy to edit by hand):
 *   - a blank line starts a new paragraph
 *   - lines starting with "- " are bullet points
 *   - a line directly above bullet points is their heading and is shown in bold
 */

export type FollowUpKind = 'info' | 'offer';

export type FollowUpInput = {
  kind: FollowUpKind;
  lang: 'de' | 'en';
  /** 'f' = Frau / Ms, 'm' = Herr / Mr. Only used when a last name is given. */
  salutation: 'f' | 'm';
  /** May be empty: the email then opens with a neutral greeting. */
  lastName: string;
  business: string;
  /** One-off build fee in euros (offer only). */
  buildFee: number | null;
  /** Monthly care fee in euros (offer only). null uses the starting price from site.config.ts. */
  careFee: number | null;
  /** Optional growth package per month (offer only). */
  growthFee: number | null;
  /** The one sentence from the call. Empty leaves the paragraph out. */
  sentence: string;
  /** Typical weeks until launch (offer only). null leaves the timing out. */
  weeks: number | null;
  /** Day of the call as YYYY-MM-DD, and today's date in the same form. */
  callDate: string;
  today: string;
};

export type FollowUpDraft = { subject: string; text: string };

/** Logo shown under the signature. The file is public/email/carma-logo.png (137 × 48). */
export const LOGO = { path: '/email/carma-logo.png', width: 114, height: 40 };

/** A [placeholder] left in the text, e.g. "[Betrag]". Such an email must not be sent. */
export const PLACEHOLDER = /\[[^\]\n]{1,40}\]/;

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

function callDay({ lang, callDate, today }: FollowUpInput) {
  const todayWord = lang === 'de' ? 'heute' : 'today';
  if (!callDate || callDate === today) return todayWord;
  const d = new Date(`${callDate}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return todayWord;
  const s = d.toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-GB', { day: 'numeric', month: 'long', timeZone: 'UTC' });
  return lang === 'de' ? `am ${s}` : `on ${s}`;
}

function greeting(i: FollowUpInput) {
  if (!i.lastName) return i.lang === 'de' ? 'Guten Tag,' : 'Hello,';
  if (i.lang === 'de') return `Guten Tag ${i.salutation === 'f' ? 'Frau' : 'Herr'} ${i.lastName},`;
  return `Dear ${i.salutation === 'f' ? 'Ms' : 'Mr'} ${i.lastName},`;
}

function signature(lang: 'de' | 'en') {
  const phone = site.contact.phone || site.owner.phone;
  const web = lang === 'de' ? 'www.carmasearch.com/de' : 'www.carmasearch.com';
  return [
    lang === 'de' ? 'Mit freundlichen Grüßen' : 'Kind regards,',
    site.owner.fullName,
    [site.owner.email, web, phone].filter(Boolean).join(' | '),
  ].join('\n');
}

function de(i: FollowUpInput, day: string): { subject: string; parts: (string | false)[] } {
  const b = i.business;
  if (i.kind === 'info') {
    return {
      subject: `Neue Website für ${b}: die Infos aus unserem Telefonat`,
      parts: [
        `vielen Dank für das nette Gespräch ${day}. Wie versprochen bekommen Sie hier kurz das Wichtigste zu einer neuen Website für ${b}.`,
        i.sentence,
        [
          'Was Sie bekommen:',
          '- Ein eigenes Design, das zu Ihrem Betrieb passt und auf dem Handy genauso gut aussieht wie am Computer',
          '- Ihre bisherigen Texte, Fotos und Produkte ziehen mit um',
          '- Inhalte ändern Sie danach selbst, ganz ohne Technikkenntnisse',
          '- Hosting, Updates, Backups und kleine Änderungen übernehme ich laufend',
        ].join('\n'),
        [
          'Was es kostet:',
          `- Erstellung: einmalig ${site.pricing.buildFrom}–${euro(site.pricing.buildTo, 'de')}, je nach Umfang, zahlbar erst, wenn die Website online ist`,
          `- Betreuung: ab ${euro(site.pricing.careFrom, 'de')} im Monat, ohne Mindestlaufzeit`,
        ].join('\n'),
        'Alle Preise netto zzgl. MwSt., sofern anfallend.',
        'Ein Beispiel meiner Arbeit ist shangantique.com. Den Vorher-nachher-Vergleich finden Sie auf www.carmasearch.com/de.',
        'Wenn Sie mögen, schicke ich Ihnen ein festes Angebot. Dafür genügen mir die Adresse Ihrer jetzigen Website und ein Satz dazu, was Ihnen an der neuen wichtig ist. Antworten Sie einfach auf diese E-Mail.',
      ],
    };
  }
  const care = i.careFee ?? site.pricing.careFrom;
  return {
    subject: `Ihr Angebot: neue Website für ${b}`,
    parts: [
      `vielen Dank für das nette Gespräch ${day}. Wie besprochen bekommen Sie hier mein Angebot für die neue Website von ${b}.`,
      i.sentence,
      [
        'Ihr Angebot:',
        `- Erstellung der Website: ${i.buildFee === null ? '[Betrag] €' : euro(i.buildFee, 'de')} einmalig, zahlbar erst, wenn die Website online ist`,
        `- Hosting und Betreuung: ${euro(care, 'de')} im Monat, ohne Mindestlaufzeit, mit 30 Tagen Frist kündbar`,
        i.growthFee !== null &&
          `- Wachstumspaket: ${euro(i.growthFee, 'de')} im Monat für Artikel, Backlinks, Social-Media-Beiträge und einen monatlichen Bericht`,
      ]
        .filter(Boolean)
        .join('\n'),
      'Alle Preise netto zzgl. MwSt., sofern anfallend.',
      [
        'Darin enthalten:',
        '- Ein eigenes Design, optimiert für Handy und Computer',
        '- Umzug Ihrer bisherigen Texte, Fotos und Produkte',
        '- Ein einfacher Editor, mit dem Sie Inhalte selbst ändern, inklusive kurzer Einweisung',
        '- WhatsApp-Button und Kontaktformular',
        '- Laufend: Hosting, Sicherheitsupdates, Backups und kleine Änderungen',
      ].join('\n'),
      'Domain, Zugangsdaten und Inhalte bleiben Ihr Eigentum. Ein Beispiel meiner Arbeit ist shangantique.com; den Vorher-nachher-Vergleich finden Sie auf www.carmasearch.com/de.',
      `Wenn das Angebot für Sie passt, antworten Sie einfach kurz auf diese E-Mail. Sie bekommen dann die Vereinbarung von mir${i.weeks ? `, und in der Regel ist Ihre neue Website innerhalb von ${i.weeks} Wochen online` : ''}. Bei Fragen melden Sie sich gern jederzeit.`,
    ],
  };
}

function en(i: FollowUpInput, day: string): { subject: string; parts: (string | false)[] } {
  const b = i.business;
  if (i.kind === 'info') {
    return {
      subject: `A new website for ${b}: the details from our call`,
      parts: [
        `Thank you for the call ${day}. As promised, here is a short overview of what a new website for ${b} would look like.`,
        i.sentence,
        [
          'What you get:',
          '- A design made for your business that looks as good on a phone as on a computer',
          '- Your existing texts, photos and products are moved over',
          '- You can change content yourself afterwards, no technical knowledge needed',
          '- I look after hosting, updates, backups and small changes from then on',
        ].join('\n'),
        [
          'What it costs:',
          `- Build: €${site.pricing.buildFrom}–${site.pricing.buildTo} one-off, depending on size, payable only once the site is live`,
          `- Care: from ${euro(site.pricing.careFrom, 'en')} a month, with no minimum term`,
        ].join('\n'),
        'All prices are net, plus VAT where applicable.',
        'One example of my work is shangantique.com. You can see the before and after at www.carmasearch.com.',
        'If you like, I will send you a fixed quote. All I need is the address of your current website and a line on what matters most to you in the new one. Simply reply to this email.',
      ],
    };
  }
  const care = i.careFee ?? site.pricing.careFrom;
  return {
    subject: `Your quote: a new website for ${b}`,
    parts: [
      `Thank you for the call ${day}. As discussed, here is my quote for the new website for ${b}.`,
      i.sentence,
      [
        'Your quote:',
        `- Website build: ${i.buildFee === null ? '€[amount]' : euro(i.buildFee, 'en')} one-off, payable only once the site is live`,
        `- Hosting and care: ${euro(care, 'en')} a month, with no minimum term and 30 days' notice`,
        i.growthFee !== null &&
          `- Growth package: ${euro(i.growthFee, 'en')} a month for articles, backlinks, social posts and a monthly report`,
      ]
        .filter(Boolean)
        .join('\n'),
      'All prices are net, plus VAT where applicable.',
      [
        'What is included:',
        '- A design made for your business, built for phones and computers',
        '- Your existing texts, photos and products moved over',
        '- A simple editor to change content yourself, with a short walkthrough',
        '- A WhatsApp button and a contact form',
        '- Ongoing: hosting, security updates, backups and small changes',
      ].join('\n'),
      'Your domain, logins and content remain yours. One example of my work is shangantique.com; you can see the before and after at www.carmasearch.com.',
      `If the quote works for you, simply reply to this email. I will then send you the agreement${i.weeks ? `, and your new website is typically live within ${i.weeks} weeks` : ''}. If you have any questions, get in touch any time.`,
    ],
  };
}

export function draftFollowUp(input: FollowUpInput): FollowUpDraft {
  const i = { ...input, lastName: input.lastName.trim(), business: input.business.trim(), sentence: input.sentence.trim() };
  const { subject, parts } = (i.lang === 'de' ? de : en)(i, callDay(i));
  const text = [greeting(i), ...parts.filter(Boolean), signature(i.lang)].join('\n\n');
  return { subject, text };
}

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

/** Tidies text typed by hand: Windows line breaks, trailing spaces, more than one blank line. */
export function cleanText(text: string) {
  return text
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Plain text → email HTML, with the logo underneath.
 * logoUrl is the full address of the logo for the real email, or the path for the preview.
 */
export function textToHtml(text: string, logoUrl: string) {
  const p = 'margin:0 0 16px';
  const isItem = (l: string) => /^[-•]\s+/.test(l);
  const body = cleanText(text)
    .split('\n\n')
    .map((block) => {
      const lines = block.split('\n');
      let out = '';
      let para: string[] = [];
      let items: string[] = [];
      const flushPara = (heading: boolean) => {
        if (!para.length) return;
        const inner = para.map(esc).join('<br>');
        out += heading ? `<p style="margin:0 0 8px"><strong>${inner}</strong></p>` : `<p style="${p}">${inner}</p>`;
        para = [];
      };
      const flushItems = () => {
        if (!items.length) return;
        out += `<ul style="margin:0 0 16px;padding-left:22px">${items.map((it) => `<li style="margin:0 0 6px">${esc(it)}</li>`).join('')}</ul>`;
        items = [];
      };
      for (const line of lines) {
        if (isItem(line)) {
          // A single line directly above bullet points is their heading.
          flushPara(para.length === 1);
          items.push(line.replace(/^[-•]\s+/, ''));
        } else {
          flushItems();
          para.push(line);
        }
      }
      flushPara(false);
      flushItems();
      return out;
    })
    .join('');
  const logo = `<p style="margin:24px 0 0"><img src="${esc(logoUrl)}" width="${LOGO.width}" height="${LOGO.height}" alt="Carma" style="display:block;border:0"></p>`;
  return `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#14171a;max-width:640px">${body}${logo}</div>`;
}
