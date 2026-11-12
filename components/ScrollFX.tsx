'use client';

import { useEffect } from 'react';

/**
 * Page-wide scroll behaviour, mounted once:
 *  - Lenis smooth scrolling (skipped for reduced motion)
 *  - [data-reveal]: adds .is-in when it enters the viewport (word-rise headings, fades)
 *  - [data-parallax]: writes --p (0 → 1 while the element crosses the viewport)
 *  - [data-track]: adds .is-active while the element sits around the middle of the screen
 */
export function ScrollFX() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.documentElement.classList.add('fx');

    let lenis: { raf: (t: number) => void; destroy: () => void; scrollTo: (t: string | HTMLElement, o?: object) => void } | null = null;
    let raf = 0;
    let stopped = false;

    const reveals = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            reveals.unobserve(e.target);
          }
        }),
      { rootMargin: '0px 0px -12% 0px', threshold: 0.01 },
    );
    document.querySelectorAll('[data-reveal]').forEach((n) => reveals.observe(n));

    const tracks = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.target.classList.toggle('is-active', e.isIntersecting)),
      { rootMargin: '-42% 0px -42% 0px' },
    );
    document.querySelectorAll('[data-track]').forEach((n) => tracks.observe(n));

    const parallax = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]'));
    const header = document.querySelector<HTMLElement>('.header');
    const hero = document.querySelector<HTMLElement>('.stack');
    const loop = (time: number) => {
      if (stopped) return;
      lenis?.raf(time);
      const vh = window.innerHeight;
      // Header floats over the 3D hero, then turns solid for the rest of the page.
      if (header) header.classList.toggle('is-solid', !hero || hero.getBoundingClientRect().bottom < 72);
      for (const n of parallax) {
        const r = n.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) continue;
        const p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
        n.style.setProperty('--p', p.toFixed(4));
      }
      raf = requestAnimationFrame(loop);
    };

    // In-page anchors scroll smoothly through Lenis, with room for the header.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.('a[href*="#"]') as HTMLAnchorElement | null;
      if (!a || !lenis) return;
      const url = new URL(a.href, location.href);
      if (url.pathname !== location.pathname || !url.hash) return;
      const target = document.querySelector<HTMLElement>(url.hash);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -80, duration: 1.4 });
      history.replaceState(null, '', url.hash);
    };

    if (!reduce) {
      import('lenis').then(({ default: Lenis }) => {
        if (stopped) return;
        lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
        document.addEventListener('click', onClick);
      });
    }
    raf = requestAnimationFrame(loop);

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      reveals.disconnect();
      tracks.disconnect();
      document.removeEventListener('click', onClick);
      lenis?.destroy();
    };
  }, []);

  return null;
}
