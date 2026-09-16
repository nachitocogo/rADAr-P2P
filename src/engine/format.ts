import type { Monto } from '../data/types';

const nfArs = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

/** $45M ARS · $30–35M ARS · USD 5.000 · 1.000-5.000 USDT */
export function fmtMonto(m: Monto): string {
  const compact = (v: number) => {
    if (m.moneda === 'ARS') {
      if (v >= 1_000_000) {
        const mm = v / 1_000_000;
        return `$${Number.isInteger(mm) ? mm : mm.toFixed(1)}M`;
      }
      return `$${nfArs.format(v)}`;
    }
    return nfArs.format(v);
  };
  const rango = m.hasta ? `${compact(m.valor)}–${compact(m.hasta)}` : compact(m.valor);
  const pre = m.aprox ? '~' : '';
  if (m.moneda === 'ARS') return `${pre}${rango} ARS`;
  return `${pre}${m.moneda} ${rango}`;
}

export function fmtArs(v: number): string {
  if (v >= 1_000_000) {
    const mm = v / 1_000_000;
    return `$${mm >= 100 ? Math.round(mm) : mm.toFixed(1).replace('.0', '')}M`;
  }
  return `$${nfArs.format(Math.round(v))}`;
}

export function fmtUsd(v: number): string {
  return `USD ${nfArs.format(Math.round(v))}`;
}

export function fmtNumero(v: number): string {
  return nfArs.format(Math.round(v));
}

export function parseNumero(s: string): number {
  const clean = s.replace(/[^\d]/g, '');
  return clean ? parseInt(clean, 10) : 0;
}
