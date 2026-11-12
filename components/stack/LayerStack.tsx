'use client';

import { useEffect, useRef, useState } from 'react';
import type { Dict } from '@/content/types';

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** Layer label for each slab, bottom → top. Indexes match scene.ts. */
const LABEL_FOR_LAYER = [3, 0, 2, 1]; // layer index → step index (foundation=step 4, content=1, editor=3, design=2)

export function LayerStack({ hero, stack }: { hero: Dict['hero']; stack: Dict['stack'] }) {
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const outroRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLElement | null)[]>([]);
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const el = section.current;
    const cv = canvas.current;
    if (!el || !cv) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let api: { play: () => void; pause: () => void; dispose: () => void } | null = null;
    let io: IntersectionObserver | null = null;
    let cancelled = false;

    const getProgress = () => {
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      return total > 0 ? clamp(-r.top / total) : 0;
    };

    import('./scene').then(({ createScene }) => {
      if (cancelled) return;
      // Turn on the tall pinned layout first so the canvas has its real size.
      setLive(true);
      requestAnimationFrame(() => {
        if (cancelled) return;
        api = createScene(cv, {
          getProgress,
          reducedMotion,
          onFrame: ({ progress: p, steps, labels, explode }) => {
            const heroOut = smooth(0.015, 0.085, p);
            if (heroRef.current) {
              heroRef.current.style.opacity = String(1 - heroOut);
              heroRef.current.style.transform = `translate3d(0, ${-heroOut * 60}px, 0)`;
              heroRef.current.style.visibility = heroOut >= 1 ? 'hidden' : 'visible';
            }
            const intro = smooth(0.1, 0.15, p) * (1 - smooth(0.21, 0.26, p));
            show(introRef.current, intro);
            steps.forEach((a, k) => show(stepRefs.current[k], a));
            show(outroRef.current, smooth(0.9, 0.96, p));
            labels.forEach((l, i) => {
              const node = labelRefs.current[i];
              if (!node) return;
              const stepIdx = LABEL_FOR_LAYER[i];
              const active = steps[stepIdx];
              node.style.transform = `translate3d(${l.x}px, ${l.y}px, 0) translate(-100%, -50%)`;
              node.style.opacity = String(explode * (0.45 + active * 0.55) * (1 - smooth(0.86, 0.9, p)));
              node.classList.toggle('is-active', active > 0.5);
            });
          },
        });
        if (!api) {
          setLive(false);
          return;
        }
        io = new IntersectionObserver(([e]) => (e.isIntersecting ? api?.play() : api?.pause()), { rootMargin: '100px' });
        io.observe(el);
      });
    });

    return () => {
      cancelled = true;
      io?.disconnect();
      api?.dispose();
    };
  }, []);

  return (
    <section ref={section} className={`stack${live ? ' stack--live' : ''}`} aria-label={stack.intro}>
      <div className="stack__stage">
        <canvas ref={canvas} className="stack__canvas" aria-hidden="true" />

        <div className="wrap stack__layer">
          <div ref={heroRef} className="stack__hero">
            <h1 className="stack__title">{hero.title}</h1>
            <p className="stack__lede">{hero.lede}</p>
            <div className="stack__actions">
              <a className="btn btn--primary" href="#contact">
                {hero.primary}
              </a>
              <a className="link" href="#compare">
                {hero.secondary}
              </a>
            </div>
            <p className="stack__hint" aria-hidden="true">
              <span className="stack__hint-line" />
              {hero.scrollHint}
            </p>
          </div>

          <div ref={introRef} className="stack__panel stack__panel--intro">
            <h2 className="stack__panel-title">{stack.intro}</h2>
            <p className="stack__panel-body">{stack.introBody}</p>
          </div>

          {stack.steps.map((s, k) => (
            <article
              key={s.title}
              ref={(n) => {
                stepRefs.current[k] = n;
              }}
              className="stack__panel stack__step"
            >
              <p className="stack__count">
                {stack.stepWord} {k + 1} / {stack.steps.length}
              </p>
              <h3 className="stack__panel-title">{s.title}</h3>
              <p className="stack__panel-body">{s.body}</p>
            </article>
          ))}

          <div ref={outroRef} className="stack__panel stack__panel--outro">
            <h2 className="stack__panel-title">{stack.outro}</h2>
            <p className="stack__panel-body">{stack.outroBody}</p>
            <a className="btn btn--primary" href="#contact">
              {stack.outroCta}
            </a>
          </div>
        </div>

        <div className="stack__labels" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              ref={(n) => {
                labelRefs.current[i] = n;
              }}
              className="stack__label"
            >
              {stack.steps[LABEL_FOR_LAYER[i]].label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function show(node: HTMLElement | null, a: number) {
  if (!node) return;
  node.style.opacity = String(a);
  node.style.transform = `translate3d(0, ${(1 - a) * 28}px, 0)`;
  node.style.visibility = a <= 0.001 ? 'hidden' : 'visible';
}
