/**
 * A personal draft page for one business, at /fuer/<token>.
 * Created by scripts/prospect.mjs (or the "Prospect page" GitHub Action) only after
 * the business owner has agreed to receive a free draft.
 */
export type Prospect = {
  /** Unguessable id, part of the private link. */
  token: string;
  business: string;
  /** Person to greet, e.g. "Frau Berger". Optional. */
  contact?: string;
  /** Their current website. */
  url: string;
  /** ISO date the page was made. The page disappears 30 days later. */
  created: string;
  /** Days the link stays online. */
  days: number;
  /** Optional personal note shown under the greeting. */
  note?: string;
  /** What I would change, in plain words. Falls back to a standard list. */
  changes?: string[];
  /** Screenshot of their current home page (1440 × 900). */
  before: string;
  /** Material for the mock-up of the new home page. */
  mock: {
    name: string;
    headline: string;
    lede: string;
    nav: string[];
    /** Brand colour taken from their site, e.g. "#7a2e1d". */
    color: string;
    logo?: string;
    hero?: string;
    phone?: string;
    city?: string;
  };
};
