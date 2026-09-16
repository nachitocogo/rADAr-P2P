/**
 * MODELO DE DATOS — Radar P2P
 * ---------------------------------------------------------------
 * Toda la información de plataformas vive en `platforms.ts` usando
 * estos tipos. Para actualizar un límite, comisión o nota se edita
 * SOLO ese archivo: la UI y el motor de recomendaciones leen de acá.
 *
 * Trazabilidad de cada dato:
 *   fuente     → 'pdf' (Radar P2P, sept 2026) | 'academia' (docs/llamadas ADA) | 'sugerencia' (propuesta a validar)
 *   confianza  → 'confirmado' (está en el PDF vigente) | 'pendiente' (hay que confirmarlo con el equipo)
 */

export type Fuente = 'pdf' | 'academia' | 'sugerencia';
export type Confianza = 'confirmado' | 'pendiente';

export type Categoria = 'exchange' | 'otc' | 'billetera_arbitraje' | 'billetera' | 'banco';

/** Las 4 fases del alumno ADA (Metodología §7). */
export type Etapa = 'principiante' | 'construccion' | 'optimizacion' | 'escalado';

export type Moneda = 'ARS' | 'USD' | 'USDT';

/**
 * Rol operativo que usa el motor de recomendaciones. Es un dato, no código:
 * si el equipo decide que una plataforma cambia de rol, se cambia acá.
 */
export type Rol =
  | 'exchange_principal'   // Binance: donde se construye el verificado
  | 'exchange_secundario'  // Bybit / OKX: se abren temprano, se mueven después
  | 'exchange_oportunista' // MEXC / Bitget / BingX / KuCoin: oportunidades puntuales
  | 'otc'                  // mesa OTC: acceso por capital mínimo
  | 'pasarela_rotacion'    // billetera gratuita para mover pesos (rotar 3-4)
  | 'pasarela_premium'     // Lemon: la mejor pasarela, se preserva hasta tener CERTI
  | 'pasarela_vigilada'    // Mercado Pago: la más vigilada, de a poco y con CERTI
  | 'billetera_pro'        // billeteras pagas: se justifican con volumen (Let's Bit plan, Copter, TelePagos)
  | 'billetera_plan'       // plan de arbitraje gatillado por capital (Belo)
  | 'otc_wallet'           // Fiwind: lógica OTC, no pasarela retail
  | 'banco'                // cuenta bancaria tradicional
  | 'personal';            // reservada para uso personal (Cuenta DNI, Brubank)

export interface Monto {
  valor: number;
  moneda: Moneda;
  /** Si el dato es un rango (ej. $30–35M), `hasta` es el tope. */
  hasta?: number;
  aprox?: boolean;
}

export interface Comision {
  resumen: string;
  detalle?: { nivel: string; valor: string }[];
  fuente: Fuente;
  confianza: Confianza;
}

export interface Limites {
  diario?: Monto;
  mensual?: Monto;
  anual?: Monto;
  porMovimiento?: Monto;
  transferenciasDia?: number;
  /** Texto libre cuando no hay número (ej. "Sin monto específico, sirve para montos bajos"). */
  texto?: string;
  /** El PDF marca con * los límites que varían según la cuenta de cada uno. */
  variaPorCuenta?: boolean;
  fuente: Fuente;
  confianza: Confianza;
}

export interface Plan {
  requerido: boolean;
  nombre: string;
  niveles?: { nombre: string; limite: string; costo: string; nota?: string }[];
  comoSeAccede?: string;
  fuente: Fuente;
  confianza: Confianza;
}

export interface Ampliacion {
  posible: 'si' | 'no' | 'desconocido';
  /** Cómo se amplía / qué habilita. */
  como?: string;
  fuente: Fuente;
  confianza: Confianza;
}

export interface DocumentacionInfo {
  /** Documentación que la plataforma pide o exige. */
  requerida?: string[];
  /** Documentación que sirve para ampliar / acceder. */
  sirve?: string[];
  nota?: string;
  fuente: Fuente;
  confianza: Confianza;
}

export interface NotaAcademia {
  texto: string;
  confianza: Confianza;
}

/**
 * Modalidad OTC de una plataforma que además opera como billetera/plan
 * (Belo, Let's Bit, Fiwind). Es la MISMA empresa y la misma cuenta: acá
 * van solo las condiciones de la mesa.
 */
export interface OtcModalidad {
  capitalMinimo: Monto & { fuente: Fuente; confianza: Confianza; nota?: string };
  descripcion?: string;
  documentacion?: DocumentacionInfo;
  cuandoUsar?: string[];
  notasAcademia?: NotaAcademia[];
  pendientes?: string[];
}

export interface Platform {
  /** Identificador único, estable (se usa en URLs y en el perfil guardado). */
  id: string;
  /** Agrupa productos de una misma empresa (ej. Let's Bit OTC + Let's Bit billetera). */
  empresa: string;
  nombre: string;
  categoria: Categoria;
  /** Etiqueta corta que ve el alumno ("Exchange P2P", "Mesa OTC", "Billetera paga"…). */
  subtipo: string;
  rol: Rol;
  /** Orden dentro de la categoría (el del PDF). */
  orden: number;
  /** Etiqueta del PDF ("Mayor liquidez, lejos", "Buena opción para arbitraje"…). */
  tagline?: string;
  descripcion: string;

  /** Solo exchanges: 1 (mínima) → 5 (máxima), según el orden del PDF. */
  liquidez?: 1 | 2 | 3 | 4 | 5;
  comision?: Comision;
  limites?: Limites;
  /** OTC y planes: capital / monto mínimo para operar. */
  capitalMinimo?: Monto & { fuente: Fuente; confianza: Confianza; nota?: string };
  plan?: Plan;
  ampliacion: Ampliacion;
  documentacion?: DocumentacionInfo;
  /** Si la plataforma también tiene mesa OTC, sus condiciones viven acá (misma entidad). */
  otc?: OtcModalidad;

  cryptoFriendly: 'si' | 'parcial' | 'no' | 'nd';
  /** Volumen para el que la recomienda el Radar. */
  volumen: 'bajo' | 'medio' | 'alto' | 'cualquiera' | 'personal';
  /** Etapas del alumno donde tiene más sentido. */
  etapas: Etapa[];
  riesgoBloqueo: 'bajo' | 'medio' | 'alto' | 'nd';
  /** Si está, el motor la preserva hasta que el alumno tenga verificado + CERTI. */
  preservar?: { motivo: string };
  usoPersonal?: boolean;

  /** "Recomendación:" textual del PDF. */
  recomendacion?: string;
  inconvenientes?: string[];
  ventajas?: string[];
  cuandoUsar?: string[];
  cuandoEvitar?: string[];
  /** Criterio operativo que viene de la doctrina de la Academia (no del PDF). */
  notasAcademia?: NotaAcademia[];
  /** Datos que hay que confirmar con el equipo antes de darlos por ciertos. */
  pendientes?: string[];

  fuente: Fuente;
  confianza: Confianza;
  /** Última revisión del dato, formato YYYY-MM. */
  actualizado: string;
  /** false → no aparece en la app (útil para ocultar sin borrar). */
  visible?: boolean;
}

export const CATEGORIAS: Record<Categoria, { nombre: string; plural: string; corto: string; descripcion: string }> = {
  exchange: {
    nombre: 'Exchange P2P',
    plural: 'Exchanges P2P',
    corto: 'Exchange',
    descripcion: 'Donde se compra y vende USDT contra pesos. Ordenados de mayor a menor liquidez.',
  },
  otc: {
    nombre: 'Mesa OTC',
    plural: 'Mesas OTC',
    corto: 'OTC',
    descripcion: 'Operaciones grandes en bloque, fuera del P2P público. Cada mesa tiene un monto mínimo.',
  },
  billetera_arbitraje: {
    nombre: 'Billetera para arbitrar',
    plural: 'Billeteras para arbitrar',
    corto: 'Arbitraje',
    descripcion: 'Plataformas con plan o lógica pensada para arbitrajistas: mueven la parte en pesos o cripto de la operación.',
  },
  billetera: {
    nombre: 'Billetera',
    plural: 'Billeteras para mover pesos',
    corto: 'Billetera',
    descripcion: 'Pasarelas para recibir y enviar pesos. Ordenadas por capacidad operativa.',
  },
  banco: {
    nombre: 'Banco',
    plural: 'Bancos',
    corto: 'Banco',
    descripcion: 'Cuentas bancarias tradicionales. Límites diarios altos, pero más sensibles a la actividad que ven.',
  },
};

export const ETAPAS: Record<Etapa, { nombre: string; corto: string; descripcion: string }> = {
  principiante: {
    nombre: 'Recién arranco',
    corto: 'Principiante',
    descripcion: 'Todavía no operé o hice mis primeras operaciones. Estoy abriendo cuentas.',
  },
  construccion: {
    nombre: 'Estoy construyendo',
    corto: 'Construcción',
    descripcion: 'Opero en P2P, sumo volumen para el verificado, todavía sin clientes propios.',
  },
  optimizacion: {
    nombre: 'Ya opero con criterio',
    corto: 'Optimización',
    descripcion: 'Verificado o cerca, capital en movimiento, buscando clientes y afinando métricas.',
  },
  escalado: {
    nombre: 'Estoy escalando',
    corto: 'Escalado',
    descripcion: 'Clientes recurrentes, volumen alto, mirando OTC y billeteras pro.',
  },
};
