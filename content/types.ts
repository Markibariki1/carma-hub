export type Lang = 'en' | 'de';

export type Dict = {
  lang: Lang;
  meta: { title: string; description: string };
  nav: { work: string; services: string; contact: string; cta: string; switchTo: string; switchHref: string; switchLabel: string; skip: string; main: string; legal: string };
  hero: { title: string; lede: string; primary: string; secondary: string; scrollHint: string };
  stack: {
    intro: string;
    introBody: string;
    stepWord: string;
    /** Workflow order: content, design, editor, foundation. */
    steps: { label: string; title: string; body: string }[];
    outro: string;
    outroBody: string;
    outroCta: string;
  };
  compare: { title: string; body: string; hint: string; before: string; after: string; sliderLabel: string; beforeAlt: string; afterAlt: string };
  audience: { title: string; body: string; kinds: string[] };
  services: {
    title: string;
    intro: string;
    /** `tag` marks an optional add-on, e.g. "Optional". */
    items: { title: string; body: string; tag?: string }[];
  };
  work: {
    title: string;
    /** Homepage highlight. */
    highlightTitle: string;
    caseLink: string;
    client: string;
    place: string;
    summary: string;
    facts: { title: string; body: string }[];
    visit: string;
    phoneCaption: string;
    productCaption: string;
    productAlt: string;
    collectionCaption: string;
    collectionAlt: string;
    beforePhone: string;
    afterPhone: string;
    beforePhoneAlt: string;
    afterPhoneAlt: string;
  };
  about: {
    title: string;
    body: string[];
    name: string;
    place: string;
    call: string;
    whatsapp: string;
    whatsappText: string;
    email: string;
  };
  cost: {
    title: string;
    /** Shown when prices are switched off in site.config. */
    body: string[];
    build: string;
    buildNote: string;
    care: string;
    careNote: string;
    from: string;
    perMonth: string;
    growth: string;
    growthTag: string;
    growthNote: string;
    onRequest: string;
    vatNote: string;
    termsTitle: string;
    terms: string[];
  };
  caseStudy: { back: string; ctaTitle: string; ctaBody: string; cta: string };
  faq: { title: string; items: { q: string; a: string }[] };
  contact: {
    title: string;
    lede: string;
    solo: string;
    fields: { name: string; business: string; website: string; email: string; phone: string; message: string; optional: string };
    placeholderWebsite: string;
    placeholderMessage: string;
    privacy: string;
    privacyLink: string;
    submit: string;
    sending: string;
    sent: string;
    sentBody: string;
    errorMissing: string;
    errorEmail: string;
    errorUnavailable: string;
    errorFailed: string;
    errorRetry: string;
    emailFallback: string;
  };
  footer: { line: string; imprint: string; privacy: string; imprintHref: string; privacyHref: string };
};
