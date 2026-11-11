export type Lang = 'de' | 'en';

export type Dict = {
  lang: Lang;
  meta: { title: string; description: string };
  nav: { services: string; work: string; process: string; contact: string; cta: string; switchTo: string; switchHref: string; switchLabel: string };
  hero: {
    title: string;
    lede: string;
    primary: string;
    secondary: string;
    compareCaption: string;
    compareHint: string;
    before: string;
    after: string;
    sliderLabel: string;
  };
  audience: { title: string; body: string; kinds: string[] };
  services: { title: string; intro: string; items: { title: string; body: string }[] };
  work: {
    title: string;
    client: string;
    place: string;
    summary: string;
    facts: { title: string; body: string }[];
    visit: string;
    phoneCaption: string;
    productCaption: string;
    collectionCaption: string;
    beforePhone: string;
    afterPhone: string;
  };
  process: { title: string; steps: { title: string; body: string }[] };
  cost: { title: string; body: string[] };
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
