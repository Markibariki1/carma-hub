import { Fragment, type ElementType } from 'react';

/**
 * Heading whose words rise into place when scrolled into view.
 * Screen readers get the plain text from a visually hidden copy; the split spans are hidden from them.
 * Spaces sit between the masks (not inside them) so inline-block can't swallow them.
 */
export function RiseText({ as: Tag = 'h2', text, className, id }: { as?: ElementType; text: string; className?: string; id?: string }) {
  const words = text.split(' ');
  return (
    <Tag className={`rise ${className ?? ''}`} id={id} data-reveal>
      <span className="visually-hidden">{text}</span>
      {words.map((w, i) => (
        <Fragment key={i}>
          <span className="rise__mask" aria-hidden="true">
            <span className="rise__word" style={{ transitionDelay: `${i * 45}ms` }}>
              {w}
            </span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </Tag>
  );
}
