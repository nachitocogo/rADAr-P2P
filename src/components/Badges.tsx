import type { Confianza, Fuente, Platform } from '../data/types';
import type { Bucket, Fit } from '../engine/recommend';
import { BUCKETS } from '../engine/recommend';

export function FuenteTag({ fuente, confianza }: { fuente: Fuente; confianza: Confianza }) {
  if (confianza === 'pendiente') return <span className="tag tag-pend" title="Dato que hay que confirmar con el equipo">Pendiente de confirmar</span>;
  if (fuente === 'pdf') return <span className="tag tag-gold" title="Está en el Radar P2P vigente">Radar sept. 2026</span>;
  if (fuente === 'academia') return <span className="tag" title="Criterio de la Academia">Academia</span>;
  return <span className="tag" title="Sugerencia a validar">Sugerencia</span>;
}

export function CryptoTag({ v }: { v: Platform['cryptoFriendly'] }) {
  if (v === 'si') return <span className="tag tag-ok">Crypto-friendly</span>;
  if (v === 'parcial') return <span className="tag tag-neutral">Tolera cripto</span>;
  if (v === 'no') return <span className="tag tag-stop">No crypto-friendly</span>;
  return null;
}

export function BucketTag({ b }: { b: Bucket }) {
  return (
    <span className={`tag tag-${b === 'usar_ahora' ? 'ok' : b === 'preparar' ? 'warn' : b === 'reservar' ? 'info' : b === 'secundario' ? 'neutral' : 'stop'}`}>
      <i className={`dot dot-${b}`} /> {BUCKETS[b].nombre}
    </span>
  );
}

export function FitTag({ f }: { f: Fit | null }) {
  if (!f) return null;
  if (f === 'holgada') return <span className="tag tag-ok">Capacidad holgada</span>;
  if (f === 'justa') return <span className="tag tag-warn">Capacidad justa</span>;
  return <span className="tag tag-stop">Capacidad chica</span>;
}

export function RiesgoTag({ r }: { r: Platform['riesgoBloqueo'] }) {
  if (r === 'nd') return null;
  const cls = r === 'bajo' ? 'ok' : r === 'medio' ? 'warn' : 'stop';
  return <span className={`tag tag-${cls}`}>Riesgo de bloqueo {r}</span>;
}

export function Liquidez({ n }: { n: number }) {
  return (
    <span className="bars" aria-label={`Liquidez ${n} de 5`}>
      {[1, 2, 3, 4, 5].map((i) => <i key={i} className={i <= n ? 'on' : ''} style={{ height: `${4 + i * 2}px` }} />)}
    </span>
  );
}
