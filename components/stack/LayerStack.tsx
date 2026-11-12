'use client';

import { useEffect, useRef, useState } from 'react';
import type { Dict, Lang } from '@/content/types';

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** Layer label for each slab, bottom → top. Indexes match scene.ts. */
const LABEL_FOR_LAYER = [3, 0, 2, 1]; // layer index → step index (foundation=step 4, content=1, editor=3, design=2)

/**
 * Phone loop: one screen, no long pin. Keyframes are [seconds, progress, spin].
 * Assembled → pulled apart → each layer steps forward → clicks back together,
 * then turns slowly back to the start.
 */
const LOOP: [number, number, number][] = [
  [0, 0, 0],
  [1.6, 0, 0],
  [2.8, 0.24, 0.12],
  [3.3, 0.325, 0.16],
  [4.9, 0.325, 0.2],
  [5.4, 0.475, 0.26],
  [7.0, 0.475, 0.3],
  [7.5, 0.625, 0.36],
  [9.1, 0.625, 0.4],
  [9.6, 0.775, 0.46],
  [11.2, 0.775, 0.5],
  [12.4, 0.97, 0.5],
  [15.4, 0.97, 0],
];
const LOOP_LEN = LOOP[LOOP.length - 1][0];

function loopAt(seconds: number): [number, number] {
  const t = seconds % LOOP_LEN;
  for (let i = 1; i < LOOP.length; i++) {
    const [t1, p1, s1] = LOOP[i];
    const [t0, p0, s0] = LOOP[i - 1];
    if (t <= t1) {
      const k = smooth(0, 1, (t - t0) / (t1 - t0));
      return [p0 + (p1 - p0) * k, s0 + (s1 - s0) * k];
    }
  }
  return [0, 0];
}

/**
 * True when the device can draw WebGL on a real GPU. Software rendering (no GPU, or a
 * blocklisted driver) gets the still picture instead: it would make the page sluggish.
 * Add ?force3d to the address to see the 3D version anyway (used for screenshots).
 */
const lowPowerCaveat = () => !/[?&]force3d\b/.test(location.search);

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    const attrs = { failIfMajorPerformanceCaveat: lowPowerCaveat() };
    const gl = (c.getContext('webgl2', attrs) || c.getContext('webgl', attrs)) as WebGLRenderingContext | null;
    if (!gl) return false;
    let software = false;
    if (lowPowerCaveat()) {
      const info = gl.getExtension('WEBGL_debug_renderer_info');
      const renderer = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
      software = /swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer);
    }
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return !software;
  } catch {
    return false;
  }
}

/** ssr: server render (no decision yet). still: picture instead of 3D. scroll: pinned desktop story. loop: phone autoplay. */
type Mode = 'ssr' | 'still' | 'scroll' | 'loop';

export function LayerStack({ lang, hero, stack }: { lang: Lang; hero: Dict['hero']; stack: Dict['stack'] }) {
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const outroRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLParagraphElement>(null);
  const stepRefs = useRef<(HTMLElement | null)[]>([]);
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [mode, setMode] = useState<Mode>('ssr');
  const [caption, setCaption] = useState(0);

  useEffect(() => {
    const el = section.current;
    const cv = canvas.current;
    if (!el || !cv) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion || !hasWebGL()) {
      setMode('still');
      return;
    }
    const loop = window.matchMedia('(max-width: 760px)').matches;
    setMode(loop ? 'loop' : 'scroll');

    let api: { play: () => void; pause: () => void; dispose: () => void } | null = null;
    let io: IntersectionObserver | null = null;
    let cancelled = false;
    let lastCaption = -1;
    let t0 = performance.now();

    const scrollProgress = () => {
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      return total > 0 ? clamp(-r.top / total) : 0;
    };
    // Three rounds, then it rests assembled (saves battery; nothing left to explain).
    const loopNow = (): [number, number] => {
      const s = (performance.now() - t0) / 1000;
      return s > LOOP_LEN * 3 ? [0, 0] : loopAt(s);
    };

    // Load three.js once the page has settled, so the text and buttons are usable first.
    const idle = new Promise<void>((resolve) =>
      'requestIdleCallback' in window ? window.requestIdleCallback(() => resolve(), { timeout: 1200 }) : setTimeout(resolve, 300),
    );
    idle
      .then(() => import('./scene'))
      .then(({ createScene }) => {
        if (cancelled) return;
        requestAnimationFrame(() => {
          if (cancelled) return;
          t0 = performance.now();
          api = createScene(cv, {
            lang,
            reducedMotion: false,
            getProgress: loop ? () => loopNow()[0] : scrollProgress,
            getSpin: loop ? () => loopNow()[1] : undefined,
            follow: loop ? 1 : 0.14,
            maxFps: loop ? 30 : undefined,
            onFrame: ({ progress: p, steps, labels, explode }) => {
              if (loop) {
                // Phones: the hero text stays put; a caption names the layer in front.
                let active = -1;
                steps.forEach((a, k) => {
                  if (a > 0.5) active = k;
                });
                const vis = active >= 0 ? 1 : 0;
                if (captionRef.current) captionRef.current.style.opacity = String(vis * explode);
                if (active >= 0 && active !== lastCaption) {
                  lastCaption = active;
                  setCaption(active);
                }
                return;
              }
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
            setMode('still');
            return;
          }
          io = new IntersectionObserver(([e]) => (e.isIntersecting ? api?.play() : api?.pause()), { rootMargin: '100px' });
          io.observe(el);
        });
      })
      .catch(() => {
        if (!cancelled) setMode('still');
      });

    return () => {
      cancelled = true;
      io?.disconnect();
      api?.dispose();
    };
  }, [lang]);

  const animated = mode === 'scroll' || mode === 'loop';
  const poster = `/stack-poster-${lang}.webp`;
  const posterH = lang === 'de' ? 1255 : 1312;
  const posterAlt = stack.steps.map((s) => s.label).join(', ');

  return (
    <section
      ref={section}
      className={`stack stack--${mode}${mode === 'scroll' ? ' stack--live' : ''}`}
      aria-label={stack.intro}
    >
      <div className="stack__stage">
        <canvas ref={canvas} className="stack__canvas" aria-hidden="true" />

        <div className="wrap stack__layer">
          <div ref={heroRef} className="stack__hero">
            <h1 className="stack__title">{hero.title}</h1>
            <p className="stack__lede">{hero.lede}</p>
            <div className="stack__actions">
              <a className="btn btn--primary" href="#contact" data-event="hero-cta">
                {hero.primary}
              </a>
              <a className="link" href="#work">
                {hero.secondary}
              </a>
            </div>
            <p className="stack__hint" aria-hidden="true">
              <span className="stack__hint-line" />
              {hero.scrollHint}
            </p>
          </div>

          {mode === 'still' ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="stack__poster" src={poster} alt={posterAlt} width={1600} height={posterH} decoding="async" />
          ) : null}
          {mode === 'ssr' ? (
            <noscript>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="stack__poster" src={poster} alt={posterAlt} width={1600} height={posterH} />
            </noscript>
          ) : null}

          {/* When the panels are animated or hidden (phones), screen readers get this list instead. */}
          <div className="visually-hidden stack__srlist">
            <h2>{stack.intro}</h2>
            <p>{stack.introBody}</p>
            <ol>
              {stack.steps.map((s) => (
                <li key={s.title}>
                  {s.title} {s.body}
                </li>
              ))}
            </ol>
          </div>

          <div ref={introRef} className="stack__panel stack__panel--intro" aria-hidden={animated || undefined}>
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
              aria-hidden={animated || undefined}
            >
              <p className="stack__count">
                {stack.stepWord} {k + 1} / {stack.steps.length}
              </p>
              <h3 className="stack__panel-title">{s.title}</h3>
              <p className="stack__panel-body">{s.body}</p>
            </article>
          ))}

          <div ref={outroRef} className="stack__panel stack__panel--outro" aria-hidden={animated || undefined}>
            <h2 className="stack__panel-title">{stack.outro}</h2>
            <p className="stack__panel-body">{stack.outroBody}</p>
            <a className="btn btn--primary" href="#contact" tabIndex={animated ? -1 : undefined}>
              {stack.outroCta}
            </a>
          </div>
        </div>

        <p ref={captionRef} className="stack__caption" aria-hidden="true">
          <span className="stack__caption-n">
            {caption + 1}/{stack.steps.length}
          </span>
          {stack.steps[caption].label}
        </p>

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
