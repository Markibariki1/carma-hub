'use client';

import { useEffect, useRef } from 'react';

/** Shows a fixed-size design (e.g. 1440 × 900) scaled down to whatever width it is given. */
export function ScaledFrame({ width, height, children }: { width: number; height: number; children: React.ReactNode }) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const o = outer.current;
    const i = inner.current;
    if (!o || !i) return;
    const fit = () => (i.style.transform = `scale(${o.clientWidth / width})`);
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(o);
    return () => ro.disconnect();
  }, [width]);
  return (
    <div ref={outer} className="scaled" style={{ aspectRatio: `${width} / ${height}` }}>
      <div ref={inner} className="scaled__inner" style={{ width, height }}>
        {children}
      </div>
    </div>
  );
}
