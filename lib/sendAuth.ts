import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

/**
 * Sign-in for the private /send page: one password (SEND_PASSWORD in Vercel) and a
 * cookie that proves it was entered. Changing the password signs every device out.
 */

export const SEND_COOKIE = 'carma-send';

export function sessionToken(password: string) {
  return createHmac('sha256', password).update('carma-send-v1').digest('hex');
}

export function same(a: string, b: string) {
  const ha = createHash('sha256').update(a).digest();
  const hb = createHash('sha256').update(b).digest();
  return timingSafeEqual(ha, hb);
}

/** True when the visitor has signed in with the current SEND_PASSWORD. */
export async function isSignedIn() {
  const password = process.env.SEND_PASSWORD;
  if (!password) return false;
  const value = (await cookies()).get(SEND_COOKIE)?.value;
  return Boolean(value && same(value, sessionToken(password)));
}
