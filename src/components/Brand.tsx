/**
 * Marca textual: rADAr-P2P. "ADA" (Academia De Arbitraje) va destacado
 * dentro de "rADAr" — es una decisión de marca, no un error tipográfico.
 * `size` solo cambia el tamaño; el tratamiento (oro + brillo) es el mismo.
 */
export function Brand({ size = 'md', sub = false }: { size?: 'sm' | 'md' | 'hero'; sub?: boolean }) {
  return (
    <span className={`brand-word brand-word-${size}`} aria-label="rADAr-P2P">
      <span className="r">r</span>
      <span className="ada">ADA</span>
      <span className="r">r</span>
      <span className="dash">-</span>
      <span className="p2p">P2P</span>
      {sub ? (
        <span className="brand-acronym" aria-hidden="true">
          <b>A</b>cademia <b>D</b>e <b>A</b>rbitraje
        </span>
      ) : null}
    </span>
  );
}
