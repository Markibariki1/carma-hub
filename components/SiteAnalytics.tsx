'use client';

import { useEffect } from 'react';
import { Analytics } from '@vercel/analytics/next';
import { track } from '@vercel/analytics';

/**
 * Vercel Web Analytics: cookieless page views, plus a few named events.
 * Any link or button with data-event="name" is counted when clicked
 * (call, whatsapp, email, hero-cta, case-cta …). Prospect pages are counted
 * under one path so their private tokens never reach the analytics data.
 */
export function SiteAnalytics() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest?.('[data-event]') as HTMLElement | null;
      if (!el) return;
      track(el.dataset.event!, { path: location.pathname.startsWith('/fuer/') ? '/fuer/[token]' : location.pathname });
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return (
    <Analytics
      beforeSend={(event) => {
        const url = new URL(event.url);
        if (url.pathname.startsWith('/fuer/')) url.pathname = '/fuer/[token]';
        url.search = '';
        return { ...event, url: url.toString() };
      }}
    />
  );
}
