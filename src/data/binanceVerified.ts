/**
 * BINANCE VERIFIED (badge de comerciante) — doctrina de la Academia.
 * Fuente: Metodología ADA §6 y Casos §1.2 / §2.3. Son referencias
 * operativas, no promesas: Binance cambia requisitos sin aviso.
 */
export type BinanceEstado =
  | 'no_empece'     // todavía no abrí cuenta / no operé
  | 'construyendo'  // opero, sumando operaciones y volumen
  | 'farmeando'     // ritmo activo para llegar al verificado
  | 'presentado'    // presenté documentación / solicitud enviada
  | 'rechazado'     // rechazado o bloqueado
  | 'verificado';   // ya tengo el badge

export type Insignia = 'bronce' | 'plata' | 'oro';

export const BINANCE_ESTADOS: Record<BinanceEstado, { nombre: string; descripcion: string }> = {
  no_empece: { nombre: 'Todavía no empecé', descripcion: 'No tengo cuenta o no hice operaciones P2P.' },
  construyendo: { nombre: 'Construyendo operaciones', descripcion: 'Ya opero, estoy sumando operaciones y volumen.' },
  farmeando: { nombre: 'Buscando el verificado', descripcion: 'Voy con ritmo (20+ ops/día) apuntando al badge.' },
  presentado: { nombre: 'Presenté la solicitud', descripcion: 'Mandé documentación y estoy esperando respuesta.' },
  rechazado: { nombre: 'Rechazado / bloqueado', descripcion: 'Me rechazaron la solicitud o tengo la cuenta bloqueada.' },
  verificado: { nombre: 'Ya estoy verificado', descripcion: 'Tengo el badge de comerciante verificado.' },
};

export const INSIGNIAS: Record<Insignia, { nombre: string; comision: string }> = {
  bronce: { nombre: 'Bronce', comision: '0,16%' },
  plata: { nombre: 'Plata', comision: '0,14%' },
  oro: { nombre: 'Oro', comision: '0,10%' },
};

export const VERIFIED_REQUISITOS = [
  { texto: 'Volumen histórico en P2P equivalente a 1 BTC (se opera USDT; Binance mide el volumen en equivalente BTC)', confianza: 'pendiente' as const },
  { texto: 'Volumen de los últimos 30 días equivalente a 0,5 BTC (métrica rolling)', confianza: 'pendiente' as const },
  { texto: '350-450 operaciones totales', confianza: 'pendiente' as const },
  { texto: 'Cuenta con más de 90 días de antigüedad', confianza: 'pendiente' as const },
  { texto: 'Depósito de 500 USDT retenido mientras mantengas el badge', confianza: 'pendiente' as const },
  { texto: 'Extracto bancario o de billetera con logo y dirección', confianza: 'pendiente' as const },
];

export const VERIFIED_RITMO = {
  opsPorDia: '20-25 operaciones por día',
  ticket: 'USD 500-700 de ticket promedio',
  referencia: '15-20 días desde cero si se sostiene el ritmo. Es una referencia, no una promesa.',
  horario: 'Mayor liquidez entre 11 y 17 hs (ART).',
  mantenimiento: '~60 operaciones por mes para no perder el badge.',
};

export const VERIFIED_ANTI_WASH = [
  'Montos distintos en cada operación (no todas de USD 200 iguales).',
  'Contrapartes distintas.',
  'Operaciones espaciadas: máximo ~5 por día al inicio, no las 20 en una hora.',
  'Se opera siempre USDT: es la moneda base del arbitraje en ADA.',
  'Si Binance detecta wash trading bloquea 3 meses, sin excepción.',
];

export const VERIFIED_SI_NO_LLEGA = [
  'Volumen insuficiente: menos de 20 ops/día o montos muy chicos.',
  'Cuenta con menos de 90 días.',
  'Bloqueo por wash trading al inicio (operaciones muy parejas).',
  'Si llevás +30 días cumpliendo todo, consultá al equipo en Discord: puede haber un flag interno.',
];

/** Guía por estado: qué hacer ahora con Binance y con el resto del stack. */
export const VERIFIED_GUIA: Record<BinanceEstado, { titulo: string; pasos: string[]; stack: string }> = {
  no_empece: {
    titulo: 'Abrí Binance y hacé las primeras 20 operaciones',
    pasos: [
      'Creá la cuenta, completá KYC y activá 2FA con Google Authenticator (no SMS).',
      'Hacé las primeras 20 operaciones espaciadas: máximo 5 por día, montos distintos, contrapartes distintas.',
      'Abrí Bybit y OKX en paralelo, pero no las muevas todavía.',
      'Empezá a registrar cada operación en la planilla desde la primera.',
    ],
    stack: 'Cuentas para construir operativa: Binance + 3-4 pasarelas de rotación free. Lemon y Mercado Pago se preservan.',
  },
  construyendo: {
    titulo: 'Sumá ritmo hacia el verificado',
    pasos: [
      'Subí a 20-25 operaciones por día con ticket USD 500-700.',
      'Antes de vender, tené definido dónde recomprás (P2P, cliente o proveedor) para no quedar descalzado. Binance Spot solo si su precio es realmente mejor que tus alternativas: es una oportunidad puntual, no la regla.',
      'Empezá la captación en paralelo: el primer cliente suele aparecer antes del verificado.',
      'Hablá con el contador para armar la CERTI: la vas a necesitar el día que estés verificado.',
    ],
    stack: 'Cuentas para construir operativa: Binance + pasarelas de rotación. Lemon y Mercado Pago todavía no.',
  },
  farmeando: {
    titulo: 'Sostené el ritmo y controlá las 4 causas de demora',
    pasos: [
      'Verificá: ops/día, antigüedad de cuenta (+90 días), montos variados y volumen acumulado.',
      'Preparalo con tiempo: extracto con logo y dirección para cuando lo pidan.',
      'No frenes la captación: 30-50 mensajes por día.',
      'Si pasaste los 30 días cumpliendo todo, consultá al equipo.',
    ],
    stack: 'Seguís con las cuentas de construcción. Si ya tenés CERTI, podés pedir el plan de Lemon y arrancar de a poco.',
  },
  presentado: {
    titulo: 'Seguí operando mientras esperás',
    pasos: [
      'Mantené el ritmo: las métricas son rolling, no se congelan cuando presentás.',
      'Tené a mano el extracto correcto por si piden más documentación.',
      'Armá el stack post-verificado: CERTI lista + plan de Lemon solicitado.',
    ],
    stack: 'Transición: preparás las cuentas principales para escalar sin activarlas todavía.',
  },
  rechazado: {
    titulo: 'Apelá con documentación y no frenes la operativa',
    pasos: [
      'Apelación formal + documentación: CERTI, DNI, justificación de fondos.',
      'Si fue por wash trading, los 3 meses no se negocian: operá en Bybit/OKX mientras tanto.',
      'Revisá qué falló (montos parejos, contrapartes repetidas, cuenta nueva) para no repetirlo.',
      'Si te llegó una transferencia de tercero: no liberar, devolver, apelar.',
    ],
    stack: 'Bybit y OKX pasan a ser tus exchanges activos mientras Binance está bloqueado.',
  },
  verificado: {
    titulo: 'Cambiá la estrategia de cuentas: ahora se escala',
    pasos: [
      'Mantené ~60 operaciones por mes para conservar el badge.',
      'Pedí el verificado de Bybit: cae como consecuencia del de Binance.',
      'Con CERTI, centralizá en Lemon y mantené 2-3 pasarelas free en rotación.',
      'Si el volumen supera USD 80K/mes, sumá una billetera pro (Let\'s Bit / Copter) y mirá OTC.',
    ],
    stack: 'Cuentas principales para escalar volumen: Lemon + Bitso/Nexo + billetera pro según volumen + OTC por capital.',
  },
};
