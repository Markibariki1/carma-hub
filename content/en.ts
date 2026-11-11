import type { Dict } from './types';

export const en: Dict = {
  lang: 'en',
  meta: {
    title: 'Carma – New websites for small businesses',
    description:
      'Carma rebuilds websites for small businesses: using the content you already have, with an editor you can use yourself, and care after launch.',
  },
  nav: {
    services: 'Services',
    work: 'Work',
    process: 'Process',
    contact: 'Contact',
    cta: 'Start a project',
    switchTo: 'Deutsch',
    switchHref: '/',
    switchLabel: 'Auf Deutsch wechseln',
  },
  hero: {
    title: 'Your website, rebuilt.',
    lede:
      'I redesign websites for small businesses. Built from what you already have, with an editor you can use yourself, and looked after once it is live.',
    primary: 'Book a first call',
    secondary: 'See the work',
    compareCaption: 'Shang Antique, Singapore: before and after.',
    compareHint: 'Drag the handle to compare.',
    before: 'Before',
    after: 'After',
    sliderLabel: 'Before and after comparison',
  },
  audience: {
    title: 'For businesses whose website no longer shows how good they are.',
    body:
      'Many websites were made years ago and never touched again: blurry photos, hard to read on a phone, and nobody left who can change them. That is where I come in.',
    kinds: ['Trades and crafts', 'Shops and galleries', 'Restaurants and cafés', 'Practices and offices', 'Hotels and holiday rentals'],
  },
  services: {
    title: 'What you get',
    intro: 'A complete website, not just a new look. Everything from one person.',
    items: [
      {
        title: 'Redesign',
        body:
          'A design made for your business, not a template. I move over your existing texts, photos and products, so you are not starting from scratch.',
      },
      {
        title: 'Edit it yourself',
        body:
          'You get a simple editor. Change products, posts or opening hours yourself, no coding needed. Press publish and the change is live.',
      },
      {
        title: 'Contact that arrives',
        body: 'A WhatsApp button on every page and a contact form whose messages land straight in your inbox.',
      },
      {
        title: 'Getting found',
        body: 'Fast loading, clean foundations for Google, and redirects so old links and bookmarks keep working.',
      },
      {
        title: 'Care',
        body: 'Hosting, security updates, backups and small changes every month. If something is wrong, I fix it.',
      },
    ],
  },
  work: {
    title: 'Work',
    client: 'Shang Antique',
    place: 'Antiques dealer in Singapore, since 1984',
    summary:
      'The old site hid a remarkable collection behind pop-ups, a cropped banner and a shopping cart nobody needed. The new one puts every piece front and centre and turns an enquiry into a single tap.',
    facts: [
      { title: '117 pieces moved over', body: 'With photos, origin, period and dimensions from the old shop.' },
      { title: 'Enquiries by WhatsApp', body: 'The message already names the piece, so the customer types nothing.' },
      { title: 'Run by the owner', body: 'He adds new pieces and blog posts himself.' },
      { title: 'Old links still work', body: 'Previous addresses redirect to the new pages.' },
    ],
    visit: 'Visit shangantique.com',
    phoneCaption: 'On a phone, before and after.',
    productCaption: 'Every piece gets its own page with all the details.',
    collectionCaption: 'The collection, filterable by origin and material.',
    beforePhone: 'Before',
    afterPhone: 'After',
  },
  process: {
    title: 'How it works',
    steps: [
      { title: 'First call', body: 'We talk about your business and your current website. Free, no obligation.' },
      { title: 'Quote', body: 'You get a fixed quote. No timesheets, no surprises.' },
      { title: 'Design', body: 'I move your content over and design the new site. You see everything before it goes live.' },
      { title: 'Launch', body: 'The new site goes live, old links are redirected, and I show you the editor.' },
      { title: 'Care', body: 'From then on I look after the technology, updates and small changes.' },
    ],
  },
  cost: {
    title: 'What it costs',
    body: [
      'Every business is different, so there is no price list. After our first call you get a quote with two parts: a one-off fee for design and build, then a monthly amount for hosting and care.',
      'Care can be cancelled with 30 days’ notice. The website and its content belong to you.',
    ],
  },
  faq: {
    title: 'Questions',
    items: [
      {
        q: 'Do I need to provide new texts and photos?',
        a: 'No. I move over what is on your current website. Better photos always help, but they are not required.',
      },
      { q: 'Do I keep my domain?', a: 'Yes. Your address stays yours; it simply points to the new site.' },
      {
        q: 'Can I change things myself later?',
        a: 'Yes. You get access to the editor and a short walkthrough. I am happy to take on bigger changes.',
      },
      { q: 'Who owns the website?', a: 'You do. Once the design and build fee is paid, the site and its content are yours.' },
      {
        q: 'What if I cancel the care plan?',
        a: 'You can cancel with 30 days’ notice, and I will help you move the site somewhere else.',
      },
    ],
  },
  contact: {
    title: 'Tell me about your business.',
    lede: 'Send me a few lines and a link to your current website. I will reply with a time for a first call.',
    solo: 'Carma is a one-person studio. You talk to the same person from the first message to launch day.',
    fields: {
      name: 'Name',
      business: 'Business',
      website: 'Current website',
      email: 'Email',
      phone: 'Phone',
      message: 'Message',
      optional: 'optional',
    },
    placeholderWebsite: 'www.your-business.com',
    placeholderMessage: 'What bothers you about your current website?',
    privacy: 'I only use your details to reply to your enquiry.',
    privacyLink: 'Privacy',
    submit: 'Send enquiry',
    sending: 'Sending …',
    sent: 'Enquiry sent.',
    sentBody: 'Thank you. I usually reply within two working days.',
    errorMissing: 'Please fill in your name, email and message.',
    errorEmail: 'Please check the email address.',
    errorUnavailable: 'The form is not available right now. Please email me directly:',
    errorFailed: 'Your enquiry could not be sent. Please try again or email me directly:',
    errorRetry: 'Your enquiry could not be sent just now. Please try again later.',
    emailFallback: 'Send an email',
  },
  footer: {
    line: 'New websites for small businesses.',
    imprint: 'Legal notice',
    privacy: 'Privacy',
    imprintHref: '/impressum',
    privacyHref: '/datenschutz',
  },
};
