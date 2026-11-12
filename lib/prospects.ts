import { prospects } from '@/content/prospects';
import type { Prospect } from '@/content/prospects/types';

const DAY = 24 * 60 * 60 * 1000;

export const expiresAt = (p: Prospect) => new Date(new Date(p.created).getTime() + p.days * DAY);

/** A prospect page, or undefined once its link has expired. */
export function getProspect(token: string, now = Date.now()) {
  const p = prospects.find((x) => x.token === token);
  if (!p || expiresAt(p).getTime() < now) return undefined;
  return p;
}

export const prospectTokens = () => prospects.map((p) => p.token);
