/**
 * Escalera OTC: cruza el capital declarado con los mínimos de cada mesa.
 */
import type { Platform } from '../data/types';
import { PLATFORMS_VISIBLES } from '../data/platforms';

export interface EscalonOtc {
  platform: Platform;
  minimoUsd: number;
  /** Mínimo alternativo (rango). */
  minimoHastaUsd: number | null;
  habilitada: boolean;
  faltanteUsd: number;
  pendiente: boolean;
}

/** Mesas OTC: plataformas de categoría OTC + plataformas con modalidad OTC (misma entidad). */
export const MESAS_OTC = PLATFORMS_VISIBLES.filter((p) => (p.categoria === 'otc' && p.capitalMinimo) || p.otc);

export function escaleraOtc(capitalUsd: number, usdArs: number): EscalonOtc[] {
  return MESAS_OTC
    .map((p) => {
      const m = (p.otc?.capitalMinimo ?? p.capitalMinimo)!;
      const minimoUsd = m.moneda === 'ARS' ? m.valor / usdArs : m.valor;
      const minimoHastaUsd = m.hasta ? (m.moneda === 'ARS' ? m.hasta / usdArs : m.hasta) : null;
      // Si el mínimo es un rango sin confirmar, se toma el tope (criterio conservador).
      const umbral = minimoHastaUsd ?? minimoUsd;
      return {
        platform: p,
        minimoUsd,
        minimoHastaUsd,
        habilitada: capitalUsd >= umbral,
        faltanteUsd: Math.max(0, umbral - capitalUsd),
        pendiente: (p.otc?.capitalMinimo ?? p.capitalMinimo)!.confianza === 'pendiente',
      };
    })
    .sort((a, b) => a.minimoUsd - b.minimoUsd);
}

/** Notas de criterio para la sección OTC (Academia). */
export const OTC_NOTAS = [
  { texto: 'El acceso se solicita directamente a cada plataforma: no se activa solo.', fuente: 'pdf' as const },
  { texto: 'El mínimo es por operación. Si un cliente te pasa el volumen, podés alcanzarlo sin capital propio.', fuente: 'academia' as const },
  { texto: 'Las mesas compran al CCL: si no hay diferencia entre CCL y USDT, no van a dar mejor precio que el P2P.', fuente: 'academia' as const },
  { texto: 'Conviene cuando el volumen hace que la comisión del P2P supere la diferencia con la mesa.', fuente: 'academia' as const },
];
