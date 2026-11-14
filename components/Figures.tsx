/** A row of measured results: big number, short label, and where the numbers come from. */
export function Figures({ items, note }: { items: { value: string; label: string }[]; note?: string }) {
  if (!items.length) return null;
  return (
    <div className="figures" data-reveal>
      <dl className="figures__list">
        {items.map((f) => (
          <div key={f.label} className="figure">
            <dt className="figure__value">{f.value}</dt>
            <dd className="figure__label">{f.label}</dd>
          </div>
        ))}
      </dl>
      {note ? <p className="figures__note">{note}</p> : null}
    </div>
  );
}
