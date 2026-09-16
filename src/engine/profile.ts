import type { Etapa } from '../data/types';
import type { BinanceEstado, Insignia } from '../data/binanceVerified';
import type { DocId } from '../data/documentacion';
import { META } from '../data/meta';

export type InfraEstado = 'no' | 'abierta' | 'activa' | 'bloqueada';

export const INFRA_ESTADOS: Record<InfraEstado, { nombre: string; corto: string }> = {
  no: { nombre: 'No tengo', corto: 'No' },
  abierta: { nombre: 'Abierta', corto: 'Abierta' },
  activa: { nombre: 'La uso', corto: 'Uso' },
  bloqueada: { nombre: 'Bloqueada', corto: 'Bloq.' },
};

export interface Profile {
  version: 1;
  etapa: Etapa | null;
  binance: BinanceEstado | null;
  insignia: Insignia | null;
  clientes: boolean;
  capitalUsd: number;
  volumenMensualUsd: number;
  usdArs: number;
  docs: DocId[];
  certiMontoArs: number | null;
  /** Mes de emisión de la certificación (YYYY-MM), para controlar la vigencia de 3 meses. */
  certiEmision: string | null;
  /** empresaId → estado */
  infra: Record<string, InfraEstado>;
  completado: boolean;
  actualizado: string | null;
}

export const PROFILE_DEFAULT: Profile = {
  version: 1,
  etapa: null,
  binance: null,
  insignia: null,
  clientes: false,
  capitalUsd: 2000,
  volumenMensualUsd: 10000,
  usdArs: META.usdArsReferencia,
  docs: [],
  certiMontoArs: null,
  certiEmision: null,
  infra: {},
  completado: false,
  actualizado: null,
};

const KEY = 'radar-p2p:profile:v1';

export function loadProfile(): Profile {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return PROFILE_DEFAULT;
    const parsed = JSON.parse(raw) as Partial<Profile>;
    if (parsed.version !== 1) return PROFILE_DEFAULT;
    return { ...PROFILE_DEFAULT, ...parsed, infra: parsed.infra ?? {}, docs: parsed.docs ?? [] };
  } catch {
    return PROFILE_DEFAULT;
  }
}

export function saveProfile(p: Profile): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* almacenamiento no disponible: la sesión sigue funcionando en memoria */
  }
}

export function clearProfile(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
}

/** Perfil de ejemplo para mostrar la app "en uso" sin haber completado el diagnóstico. */
export const PROFILE_EJEMPLO: Profile = {
  ...PROFILE_DEFAULT,
  etapa: 'construccion',
  binance: 'farmeando',
  clientes: false,
  capitalUsd: 8000,
  volumenMensualUsd: 25000,
  docs: ['certi', 'extractos', 'contador'],
  certiMontoArs: 25_000_000,
  certiEmision: '2026-07',
  infra: { binance: 'activa', 'personal-pay': 'activa', 'naranja-x': 'activa', uala: 'abierta', lemon: 'abierta', mercadopago: 'abierta' },
  completado: true,
  actualizado: '2026-09-16',
};

/* ───────────── derivados ───────────── */

export type BandaVolumen = 'arranque' | 'medio' | 'alto';

export type CertiVigencia = 'vigente' | 'por_vencer' | 'vencida' | 'sin_fecha';

/** Meses transcurridos desde un YYYY-MM hasta hoy (aprox., por mes calendario). */
export function mesesDesde(yyyymm: string, hoy = new Date()): number {
  const [y, m] = yyyymm.split('-').map((x) => parseInt(x, 10));
  if (!y || !m) return 0;
  return (hoy.getFullYear() - y) * 12 + (hoy.getMonth() + 1 - m);
}

export function vigenciaCerti(certiEmision: string | null): CertiVigencia {
  if (!certiEmision) return 'sin_fecha';
  const meses = mesesDesde(certiEmision);
  if (meses >= META.certiVigenciaMeses) return 'vencida';
  if (meses >= META.certiVigenciaMeses - 1) return 'por_vencer';
  return 'vigente';
}

export interface Derived {
  verificado: boolean;
  preVerificado: boolean;
  binanceBloqueado: boolean;
  tieneCerti: boolean;
  certiMontoArs: number;
  certiVigencia: CertiVigencia;
  banda: BandaVolumen;
  volumenMensualArs: number;
  volumenDiarioArs: number;
  /** Lo que tiene que absorber cada pasarela si rotás entre 3. */
  necesidadPorPasarelaArs: number;
  capitalArs: number;
  etapa: Etapa;
}

export function derive(p: Profile): Derived {
  const verificado = p.binance === 'verificado';
  const tieneCerti = p.docs.includes('certi');
  const volumenMensualArs = p.volumenMensualUsd * p.usdArs;
  const volumenDiarioArs = volumenMensualArs / META.diasOperativosMes;
  const banda: BandaVolumen =
    p.volumenMensualUsd < META.bandasVolumenUsd.arranque ? 'arranque' : p.volumenMensualUsd <= META.bandasVolumenUsd.medio ? 'medio' : 'alto';
  return {
    verificado,
    preVerificado: !verificado,
    binanceBloqueado: p.binance === 'rechazado' || p.infra['binance'] === 'bloqueada',
    tieneCerti,
    certiMontoArs: tieneCerti ? p.certiMontoArs ?? 0 : 0,
    certiVigencia: tieneCerti ? vigenciaCerti(p.certiEmision) : 'sin_fecha',
    banda,
    volumenMensualArs,
    volumenDiarioArs,
    necesidadPorPasarelaArs: volumenDiarioArs / META.rotacionPasarelas.min,
    capitalArs: p.capitalUsd * p.usdArs,
    etapa: p.etapa ?? 'principiante',
  };
}
