'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

type Img = { src: string; srcSet?: string; width: number; height: number; alt: string };

type Props = {
  before: Img;
  after: Img;
  beforeLabel: string;
  afterLabel: string;
  sliderLabel: string;
  sizes?: string;
  className?: string;
  /** Plays a single sweep the first time the comparison scrolls into view. */
  intro?: boolean;
  /** Live content for the "after" side instead of an image (after still sets size and label). */
  afterNode?: ReactNode;
};

export function BeforeAfter({ before, after, beforeLabel, afterLabel, sliderLabel, sizes, className, intro = false, afterNode }: Props) {
  const [pos, setPos] = useState(intro ? 88 : 50);
  const [animating, setAnimating] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  // One orchestrated moment: the divider sweeps from "mostly before" to the middle.
  useEffect(() => {
    if (!intro || !root.current) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setPos(50);
      return;
    }
    const el = root.current;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          setAnimating(true);
          requestAnimationFrame(() => setPos(50));
          window.setTimeout(() => setAnimating(false), 1500);
        }
      },
      { threshold: 0.45 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [intro]);

  function fromPointer(clientX: number) {
    const r = root.current?.getBoundingClientRect();
    if (!r) return;
    setAnimating(false);
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  }

  return (
    <div
      ref={root}
      className={`compare${animating ? ' compare--animating' : ''}${className ? ` ${className}` : ''}`}
      style={{ ['--pos' as string]: `${pos}%`, aspectRatio: `${after.width} / ${after.height}` }}
      onPointerDown={(e) => {
        dragging.current = true;
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        fromPointer(e.clientX);
      }}
      onPointerMove={(e) => dragging.current && fromPointer(e.clientX)}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
    >
      {afterNode ? (
        <div className="compare__img compare__node" role="img" aria-label={after.alt}>
          {afterNode}
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="compare__img" src={after.src} srcSet={after.srcSet} sizes={sizes} width={after.width} height={after.height} alt={after.alt} draggable={false} />
      )}
      <div className="compare__before" aria-hidden="false">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="compare__img" src={before.src} srcSet={before.srcSet} sizes={sizes} width={before.width} height={before.height} alt={before.alt} draggable={false} />
      </div>
      <span className="compare__tag compare__tag--before">{beforeLabel}</span>
      <span className="compare__tag compare__tag--after">{afterLabel}</span>
      <div className="compare__handle" aria-hidden="true">
        <span className="compare__grip" />
      </div>
      <input
        className="compare__range"
        type="range"
        min={0}
        max={100}
        step={1}
        value={Math.round(pos)}
        aria-label={sliderLabel}
        onChange={(e) => {
          setAnimating(false);
          setPos(Number(e.target.value));
        }}
      />
    </div>
  );
}
