/**
 * MOTOR DE RECOMENDACIONES
 * ---------------------------------------------------------------
 * Traduce la doctrina de la Academia a reglas explicables. Cada regla
 * devuelve un bucket + razones en lenguaje del alumno. Las reglas leen
 * el `rol` de cada plataforma (dato en platforms.ts), no su nombre.
 *
 * Fuentes de criterio:
 *  - Radar P2P (límites, mínimos, planes, recomendaciones de uso).
 *  - Metodología ADA §4-§6, §13.3, §22 y Casos §1, §3.4, §5.2 (estrategia
 *    por fase, preservación de Lemon/MP, billeteras pagas y OTC).
 */
import type { Monto, Platform } from '../data/types';
import { PLATFORMS_VISIBLES } from '../data/platforms';
import { META } from '../data/meta';
import { derive, type Derived, type Profile } from './profile';
import { fmtArs, fmtUsd } from './format';

export type Bucket = 'usar_ahora' | 'preparar' | 'reservar' | 'secundario' | 'no_priorizar';

export const BUCKETS: Record<Bucket, { nombre: string; corto: string; descripcion: string; orden: number }> = {
  usar_ahora: { nombre: 'Usar ahora', corto: 'Ahora', descripcion: 'Tu stack de hoy. Tienen sentido para tu etapa, capital y documentación.', orden: 1 },
  preparar: { nombre: 'Preparar / solicitar', corto: 'Preparar', descripcion: 'Abrí la cuenta, pedí el plan o presentá documentación. Se activan cuando estén listas.', orden: 2 },
  reservar: { nombre: 'Reservar para después', corto: 'Reservar', descripcion: 'Valiosas, pero conviene preservarlas para cuando estés verificado, con CERTI o con más volumen.', orden: 3 },
  secundario: { nombre: 'Uso secundario', corto: 'Secundario', descripcion: 'Para diversificar rutas y volumen. No son tu base.', orden: 4 },
  no_priorizar: { nombre: 'No priorizar ahora', corto: 'No ahora', descripcion: 'Por límites, capital o situación actual no te aportan todavía.', orden: 5 },
};

export type Fit = 'holgada' | 'justa' | 'chica';

export interface Reco {
  platform: Platform;
  bucket: Bucket;
  razones: string[];
  acciones: string[];
  alertas: string[];
  fit: Fit | null;
  capacidadDiariaArs: number | null;
  /** Para OTC / planes con capital mínimo: cuánto falta (USD). 0 = habilitada. */
  faltanteUsd: number | null;
}

const toArs = (m: Monto, usdArs: number) => (m.moneda === 'ARS' ? m.valor : m.valor * usdArs);

/** Capacidad diaria estimada en pesos, según los límites conocidos. */
export function capacidadDiariaArs(p: Platform, usdArs: number): number | null {
  const l = p.limites;
  if (!l) return null;
  const candidatos: number[] = [];
  if (l.diario) candidatos.push(toArs(l.diario, usdArs));
  if (l.mensual) candidatos.push(toArs(l.mensual, usdArs) / META.diasOperativosMes);
  if (l.porMovimiento && l.transferenciasDia) candidatos.push(toArs(l.porMovimiento, usdArs) * l.transferenciasDia);
  if (!candidatos.length) return null;
  return Math.min(...candidatos);
}

export function fitDe(cap: number, necesidad: number): Fit {
  if (cap >= necesidad) return 'holgada';
  if (cap >= necesidad * 0.5) return 'justa';
  return 'chica';
}

/** Mínimo en USD. Si es un rango sin confirmar, se toma el tope (criterio conservador). */
const minimoUsd = (p: { capitalMinimo?: Platform['capitalMinimo'] }, usdArs: number): number | null => {
  const m = p.capitalMinimo;
  if (!m) return null;
  const v = m.hasta ?? m.valor;
  return m.moneda === 'ARS' ? v / usdArs : v;
};

function base(platform: Platform, bucket: Bucket): Reco {
  return { platform, bucket, razones: [], acciones: [], alertas: [], fit: null, capacidadDiariaArs: null, faltanteUsd: null };
}

/* ───────────────────────── reglas por rol ───────────────────────── */

function exchangePrincipal(p: Platform, pr: Profile, d: Derived): Reco {
  const r = base(p, 'usar_ahora');
  switch (pr.binance) {
    case 'no_empece':
      r.razones.push('Es tu plataforma principal: acá se construye el verificado y la reputación.');
      r.acciones.push('Abrí la cuenta, activá 2FA y hacé las primeras 20 operaciones espaciadas (máx. 5 por día).');
      r.alertas.push('Sin verificar pagás 0,20% de comisión. Es normal al principio.');
      break;
    case 'construyendo':
    case 'farmeando':
    case 'presentado':
      r.razones.push('Tu base operativa mientras llegás al verificado.');
      r.acciones.push('Ritmo de referencia: 20-25 operaciones por día de USD 500-700, con montos y contrapartes variados.');
      r.alertas.push('Operaciones muy parejas = riesgo de bloqueo por wash trading (3 meses).');
      break;
    case 'rechazado':
      r.bucket = 'preparar';
      r.razones.push('Está bloqueada o rechazada: hay que apelar con documentación.');
      r.acciones.push('Apelación formal con CERTI, DNI y justificación de fondos. Mientras tanto operá en Bybit / OKX.');
      break;
    case 'verificado': {
      const ins = pr.insignia;
      r.razones.push(`Verificado${ins ? ` ${ins}` : ''}: comisión ${ins === 'oro' ? '0,10%' : ins === 'plata' ? '0,14%' : '0,16%'} y mejor posición en el P2P.`);
      r.acciones.push('Mantené ~60 operaciones por mes para conservar el badge.');
      r.alertas.push('No concentres el 100% acá: un bloqueo te deja sin operativa. Tené Bybit activa.');
      break;
    }
    default:
      r.razones.push('Plataforma principal del stack.');
  }
  if (d.binanceBloqueado && r.bucket === 'usar_ahora') {
    r.bucket = 'preparar';
    r.alertas.push('La marcaste como bloqueada: apelá y operá en Bybit / OKX mientras tanto.');
  }
  return r;
}

function exchangeSecundario(p: Platform, pr: Profile, d: Derived): Reco {
  const r = base(p, 'preparar');
  const infra = pr.infra[p.empresa];
  if (d.binanceBloqueado) {
    r.bucket = 'usar_ahora';
    r.razones.push('Con Binance bloqueada, acá sigue la operativa sin frenar.');
    r.acciones.push(infra === 'no' || !infra ? 'Abrí la cuenta hoy: no esperes a que Binance responda.' : 'Movela: no frenes la operativa.');
    return r;
  }
  if (d.preVerificado) {
    r.razones.push('Se abre ahora pero no se mueve todavía: el foco del volumen va a Binance para llegar al verificado.');
    r.acciones.push(!infra || infra === 'no' ? 'Abrí la cuenta y completá KYC.' : 'Ya tenés la cuenta: dejala lista, sin operar.');
    if (p.id === 'bybit') r.alertas.push('El verificado de Bybit cae como consecuencia del de Binance. No te obsesiones antes.');
    if (p.id === 'okx') r.alertas.push('El super verificado de OKX pide ~800 operaciones: es para más adelante.');
    return r;
  }
  // verificado
  if (p.id === 'bybit') {
    r.bucket = 'usar_ahora';
    r.razones.push('Segunda plataforma: diversifica exchanges y suma liquidez.');
    r.acciones.push('Pedí el verificado de comerciante en Bybit.');
  } else {
    r.bucket = 'secundario';
    r.razones.push('Tercera plataforma: buena liquidez y seguridad para diversificar.');
    r.acciones.push('Sumá operaciones acá cuando Binance y Bybit ya estén rodando.');
  }
  return r;
}

function exchangeOportunista(p: Platform, pr: Profile, d: Derived): Reco {
  const r = base(p, 'secundario');
  if (pr.binance === 'no_empece' || d.etapa === 'principiante') {
    r.bucket = 'no_priorizar';
    r.razones.push('Primero Binance. Sumar exchanges antes de tener ritmo dispersa.');
    return r;
  }
  r.razones.push('Oportunidades puntuales de brecha, no tiempo sistemático.');
  if (p.id === 'bingx' && d.preVerificado) {
    r.bucket = 'secundario';
    r.razones.push('Fuente alternativa mientras no tenés verificado (caso documentado: BingX + Binance).');
  }
  if (p.liquidez !== undefined && p.liquidez <= 1) {
    r.bucket = 'no_priorizar';
    r.razones.push('Casi sin contrapartes: no te va a dar volumen.');
  }
  return r;
}

function otc(p: Platform, pr: Profile, d: Derived): Reco {
  const r = base(p, 'no_priorizar');
  const min = minimoUsd(p, pr.usdArs);
  if (min === null) return r;
  const faltante = Math.max(0, min - pr.capitalUsd);
  r.faltanteUsd = faltante;
  const minTxt = fmtUsd(min);
  if (faltante > 0) {
    r.razones.push(`Mínimo ${minTxt}: te faltan ${fmtUsd(faltante)} de capital.`);
    if (pr.clientes) r.alertas.push('El mínimo es por operación: si un cliente te pasa el volumen, podés alcanzarlo sin capital propio.');
    return r;
  }
  // habilitada por capital
  if (d.etapa === 'escalado' || d.banda === 'alto' || pr.clientes) {
    r.bucket = 'preparar';
    r.razones.push(`Habilitada por capital (mínimo ${minTxt}).`);
    r.acciones.push('Pedí el acceso directamente a la plataforma: no se activa solo.');
    r.alertas.push('Las mesas compran al CCL: si CCL y USDT están planchados, no van a dar mejor precio que el P2P.');
  } else {
    r.bucket = 'reservar';
    r.razones.push(`Tenés el capital (mínimo ${minTxt}), pero OTC rinde cuando movés ticket alto y tenés flujo. Hoy conviene priorizar P2P + captación.`);
  }
  if (pr.infra[p.empresa] === 'activa') {
    r.bucket = 'usar_ahora';
    r.razones.push('Ya la tenés operativa.');
  }
  if (p.confianza === 'pendiente') r.alertas.push('Datos pendientes de confirmar con el equipo.');
  return r;
}

function pasarelaRotacion(p: Platform, pr: Profile, d: Derived): Reco {
  const r = base(p, 'usar_ahora');
  const cap = capacidadDiariaArs(p, pr.usdArs);
  r.capacidadDiariaArs = cap;
  const need = d.necesidadPorPasarelaArs;
  if (cap !== null) {
    r.fit = fitDe(cap, need);
    const capTxt = fmtArs(cap);
    if (r.fit === 'holgada') r.razones.push(`Capacidad ~${capTxt}/día: cubre con margen lo que necesita cada pasarela de tu rotación (~${fmtArs(need)}/día).`);
    if (r.fit === 'justa') {
      r.razones.push(`Capacidad ~${capTxt}/día: justa para tu volumen. Sirve rotándola con otras.`);
    }
    if (r.fit === 'chica') {
      r.bucket = d.banda === 'arranque' ? 'secundario' : 'no_priorizar';
      r.razones.push(`Capacidad ~${capTxt}/día: queda chica para tu volumen (~${fmtArs(need)}/día por pasarela).`);
      if (p.ampliacion.posible === 'si' && d.tieneCerti) {
        r.bucket = 'preparar';
        r.acciones.push(`Presentá tu CERTI para extender el límite: ${p.ampliacion.como}`);
      }
    }
  } else {
    // sin número conocido: el Radar la recomienda para volumen bajo
    if (d.banda === 'arranque') r.razones.push('Sin límite publicado; el Radar la recomienda para bajo volumen. Sirve dentro de la rotación.');
    else {
      r.bucket = d.banda === 'medio' ? 'secundario' : 'no_priorizar';
      r.razones.push('Sin límite publicado y pensada para bajo volumen: con tu volumen no puede ser base.');
    }
  }
  if (p.volumen === 'alto') r.razones.push('Una de las pasarelas free con más capacidad del Radar.');
  if (p.ampliacion.posible === 'si' && r.bucket === 'usar_ahora') {
    r.acciones.push(d.tieneCerti ? 'Con tu CERTI podés pedir la ampliación de límites.' : 'Cuando tengas CERTI, podés pedir ampliación de límites.');
  }
  if (d.preVerificado && !d.tieneCerti && r.bucket === 'usar_ahora') r.alertas.push('Sin CERTI, subí el volumen de a poco y no la uses para nada personal.');
  // Tope por movimiento vs. ticket de referencia (USD 500-700 en construcción)
  if (p.limites?.porMovimiento) {
    const tope = toArs(p.limites.porMovimiento, pr.usdArs);
    if (tope < 700 * pr.usdArs * 1.5) r.alertas.push(`Tope de ${fmtArs(tope)} por movimiento: los tickets grandes no entran, usala para operaciones chicas.`);
  }
  if (p.confianza === 'pendiente') {
    if (r.bucket === 'usar_ahora') r.bucket = 'secundario';
    r.alertas.push('No está en el Radar vigente: datos pendientes de confirmar. No la conviertas en base hasta confirmarla.');
  }
  return r;
}

function pasarelaPremium(p: Platform, pr: Profile, d: Derived): Reco {
  const r = base(p, 'reservar');
  const infra = pr.infra[p.empresa];
  const nivel = planLemon(d.volumenMensualArs);
  if (!d.tieneCerti) {
    r.bucket = 'reservar';
    r.razones.push(p.preservar?.motivo ?? 'Se preserva para más adelante.');
    r.acciones.push('Primero armá la CERTI con el contador. Mientras tanto construí con las pasarelas de rotación.');
    if (infra === 'activa') r.alertas.push('La estás usando sin CERTI: riesgo alto de bloqueo. Bajá el volumen acá y armá la certificación.');
    return r;
  }
  if (d.verificado) {
    r.bucket = 'usar_ahora';
    r.razones.push('Verificado + CERTI: es la pasarela para centralizar, con 2-3 free en rotación de respaldo.');
  } else {
    r.bucket = 'preparar';
    r.razones.push('Tenés CERTI: podés pedir el plan y arrancar de a poco, sin volcar toda la operativa todavía.');
  }
  r.acciones.push(`Plan sugerido por tu volumen (~${fmtArs(d.volumenMensualArs)}/mes): ${nivel.nombre} (${nivel.costo}, ${nivel.limite}).`);
  r.acciones.push('Presentá la CERTI apenas la pidan: suele reabrir en días.');
  r.alertas.push('Baja cuentas sin aviso: nunca pongas el 100% de la operativa acá.');
  if (infra === 'activa') r.bucket = 'usar_ahora';
  return r;
}

export function planLemon(volumenMensualArs: number): { nombre: string; costo: string; limite: string } {
  if (volumenMensualArs <= 20_000_000) return { nombre: 'Bronce', costo: 'USD 10/mes', limite: '$20M/mes' };
  if (volumenMensualArs <= 100_000_000) return { nombre: 'Plata', costo: 'USD 50/mes', limite: '$100M/mes' };
  return { nombre: 'Oro', costo: 'USD 100/mes', limite: 'sin límite' };
}

function pasarelaVigilada(p: Platform, pr: Profile, d: Derived): Reco {
  const r = base(p, 'reservar');
  const infra = pr.infra[p.empresa];
  if (!d.tieneCerti) {
    r.razones.push(p.preservar?.motivo ?? 'Se preserva hasta tener CERTI.');
    r.acciones.push('No la uses para la operativa hasta tener CERTI. Si la usás para gastos personales, mantenela separada.');
    if (infra === 'activa') r.alertas.push('La estás usando sin CERTI: la Academia la considera bloqueo casi seguro. Bajá el volumen.');
    return r;
  }
  r.bucket = 'secundario';
  r.razones.push('Con CERTI sirve para clientes que pagan por MP (MP a MP es ilimitado), trabajándola de a poco.');
  r.acciones.push('Subí el volumen de forma paulatina y respondé rápido si pide verificación de seguridad (hasta 24 hs).');
  r.alertas.push('La más vigilada del país: no la conviertas en tu base.');
  return r;
}

/**
 * Orden en que la Academia suma billeteras pagas: Let's Bit primero (está en el Radar,
 * sin mínimo), Copter para volumen muy alto, después TelePagos.
 * Con volumen medio se prepara UNA de respaldo; con volumen alto, la primaria + una segunda.
 */
const PRO_PRIORIDAD: Record<string, number> = { letsbit: 1, copter: 2, telepagos: 3 };

function billeteraPro(p: Platform, pr: Profile, d: Derived): Reco {
  const r = base(p, 'reservar');
  const infra = pr.infra[p.empresa];
  const com = p.comision?.resumen ?? 'comisión por operación';
  const prio = PRO_PRIORIDAD[p.id] ?? 9;
  if (d.banda === 'alto') {
    if (prio <= 2) {
      r.bucket = 'usar_ahora';
      r.razones.push(`Con más de ${fmtUsd(META.bandasVolumenUsd.medio)}/mes la ${com.toLowerCase()} se paga sola y te saca del drama retail.`);
      r.acciones.push(infra === 'activa' ? 'Ya la tenés operativa: consolidá volumen acá.' : 'Solicitá el plan directamente a la plataforma y presentá la CERTI.');
    } else {
      r.bucket = 'preparar';
      r.razones.push('Segunda billetera pro: la dejás lista para no depender de una sola cuando escalás.');
      r.acciones.push('Solicitá el plan a la plataforma (no se activa solo).');
    }
  } else if (d.banda === 'medio' || pr.clientes) {
    if (prio === 1) {
      r.bucket = 'preparar';
      r.razones.push('Volumen medio: abrila y pedí el plan como respaldo. Activala cuando un cliente grande justifique la comisión.');
      r.acciones.push('Solicitá el plan a la plataforma (no se activa solo).');
    } else {
      r.razones.push('Con volumen medio alcanza con una billetera pro de respaldo. Esta queda para cuando superes los USD 80K/mes.');
    }
  } else {
    r.razones.push('Las billeteras pagas se justifican con volumen de cliente, no con voluntad de escalar. Sin volumen, la comisión te come el spread.');
  }
  if (infra === 'activa' && r.bucket !== 'usar_ahora') {
    r.bucket = 'usar_ahora';
    r.razones.push('Ya la tenés operativa.');
  }
  if (p.id === 'copter' && pr.volumenMensualUsd >= META.bandasVolumenUsd.copterPrimaria) r.razones.push('USD 100K+/mes: la Academia la marca como primaria.');
  if (!d.tieneCerti && r.bucket !== 'reservar') r.alertas.push('Te van a pedir certificación al activarla: armá la CERTI.');
  if (p.confianza === 'pendiente') r.alertas.push('No está en el Radar vigente: datos pendientes de confirmar.');
  return r;
}

function billeteraPlan(p: Platform, pr: Profile, d: Derived): Reco {
  const r = base(p, 'no_priorizar');
  const min = minimoUsd(p, pr.usdArs);
  const infra = pr.infra[p.empresa];
  if (min !== null) {
    const faltante = Math.max(0, min - pr.capitalUsd);
    r.faltanteUsd = faltante;
    if (faltante > 0) {
      r.razones.push(`El plan de arbitraje arranca desde ${fmtUsd(min)} de capital: te faltan ${fmtUsd(faltante)}.`);
      return r;
    }
    r.bucket = d.banda === 'arranque' ? 'preparar' : infra === 'activa' ? 'usar_ahora' : 'preparar';
    r.razones.push(`Tu capital habilita el plan (desde ${fmtUsd(min)}). Según la Academia es la más estable del grupo.`);
    r.acciones.push('Solicitá el plan de arbitraje directamente a la plataforma.');
  }
  return r;
}

function otcWallet(p: Platform, pr: Profile, d: Derived): Reco {
  const r = base(p, 'reservar');
  const otcMin = p.otc ? minimoUsd(p.otc, pr.usdArs) ?? Infinity : Infinity; // la billetera se usa con la lógica de su mesa
  if (pr.capitalUsd >= otcMin && (d.banda !== 'arranque' || pr.clientes)) {
    r.bucket = 'preparar';
    r.razones.push('Con tu capital tiene sentido vía OTC: operás puertas adentro y después sacás los pesos.');
    r.acciones.push('Coordiná con la mesa OTC de Fiwind antes de mover fondos.');
  } else if (d.etapa === 'principiante') {
    r.bucket = 'no_priorizar';
    r.razones.push('Mecánica particular (primero vendés adentro, después transferís). No es una pasarela para arrancar.');
  } else {
    r.razones.push('No es pasarela retail: tiene sentido con ticket alto vía OTC. Reservala.');
  }
  if (pr.infra[p.empresa] === 'activa') r.bucket = 'usar_ahora';
  return r;
}

function banco(p: Platform, pr: Profile, d: Derived): Reco {
  const r = base(p, 'reservar');
  const cap = capacidadDiariaArs(p, pr.usdArs);
  r.capacidadDiariaArs = cap;
  const infra = pr.infra[p.empresa];
  if (!d.tieneCerti) {
    r.razones.push('Al principio la Academia recomienda billeteras virtuales, no cuentas bancarias: el banco para fondear y retirar, no para el flujo P2P.');
    if (infra === 'activa') r.alertas.push('La estás usando para operar sin CERTI: es donde más se nota un patrón. Bajá el volumen.');
    return r;
  }
  if (d.etapa === 'principiante' || (d.banda === 'arranque' && !pr.clientes)) {
    r.razones.push('Con CERTI ya podés sumarla, pero con tu volumen las billeteras alcanzan. Reservala para tickets grandes.');
    return r;
  }
  r.bucket = 'secundario';
  r.razones.push(`Con CERTI y volumen suma capacidad${cap ? ` (~${fmtArs(cap)}/día${p.limites?.variaPorCuenta ? ', varía por cuenta' : ''})` : ''} para tickets grandes y liquidaciones con clientes.`);
  r.alertas.push('Si el banco pregunta: "compraventa de activos digitales", nunca "arbitraje" ni "cripto". Respaldá con CERTI + cedular.');
  if (infra === 'activa') r.razones.push('Ya la tenés operativa.');
  return r;
}

function personal(p: Platform): Reco {
  const r = base(p, 'no_priorizar');
  r.razones.push('El Radar la reserva para uso personal. Separá tus finanzas personales de la operativa.');
  return r;
}

/* ───────────────────────── orquestación ───────────────────────── */

export function recommendOne(p: Platform, pr: Profile, d: Derived = derive(pr)): Reco {
  let r: Reco;
  switch (p.rol) {
    case 'exchange_principal': r = exchangePrincipal(p, pr, d); break;
    case 'exchange_secundario': r = exchangeSecundario(p, pr, d); break;
    case 'exchange_oportunista': r = exchangeOportunista(p, pr, d); break;
    case 'otc': r = otc(p, pr, d); break;
    case 'pasarela_rotacion': r = pasarelaRotacion(p, pr, d); break;
    case 'pasarela_premium': r = pasarelaPremium(p, pr, d); break;
    case 'pasarela_vigilada': r = pasarelaVigilada(p, pr, d); break;
    case 'billetera_pro': r = billeteraPro(p, pr, d); break;
    case 'billetera_plan': r = billeteraPlan(p, pr, d); break;
    case 'otc_wallet': r = otcWallet(p, pr, d); break;
    case 'banco': r = banco(p, pr, d); break;
    case 'personal': r = personal(p); break;
  }
  // Modalidad OTC de la misma plataforma (Belo, Let's Bit, Fiwind): se evalúa aparte
  // y, si la mesa queda habilitada y tiene sentido, puede subir el bucket.
  if (p.otc) {
    const min = minimoUsd(p.otc, pr.usdArs);
    if (min !== null) {
      const faltante = Math.max(0, min - pr.capitalUsd);
      r.faltanteUsd = faltante;
      if (faltante > 0) {
        r.razones.push(`Mesa OTC: mínimo ${fmtUsd(min)} por operación, te faltan ${fmtUsd(faltante)}${pr.clientes ? ' (o el volumen de un cliente)' : ''}.`);
      } else if (d.etapa === 'escalado' || d.banda === 'alto' || pr.clientes) {
        r.razones.push(`Mesa OTC habilitada por capital (mínimo ${fmtUsd(min)}).`);
        r.acciones.push('Pedí el acceso OTC directamente a la plataforma: no se activa solo.');
        if (BUCKETS[r.bucket].orden > BUCKETS.preparar.orden) r.bucket = 'preparar';
      } else {
        r.razones.push(`Mesa OTC: tenés el mínimo (${fmtUsd(min)}), pero rinde cuando movés ticket alto y tenés flujo.`);
      }
      if (p.otc.documentacion?.sirve?.length && !d.tieneCerti) r.alertas.push(`Para la mesa OTC sirve presentar: ${p.otc.documentacion.sirve.join(', ')}.`);
    }
  }

  const infra = pr.infra[p.empresa];
  if (infra === 'bloqueada' && p.rol !== 'exchange_principal') {
    r.bucket = 'no_priorizar';
    r.razones.unshift('La marcaste como bloqueada.');
    r.acciones.unshift('Mandá la documentación que pidan sin pelear e insistí por mail/soporte: la mayoría se reabre. Mientras tanto, migrá el flujo.');
  } else if (infra === 'abierta' && r.bucket === 'preparar' && !r.acciones.length) {
    r.acciones.push('Ya tenés la cuenta: falta activarla o solicitar el plan.');
  } else if ((!infra || infra === 'no') && r.bucket === 'usar_ahora' && p.rol !== 'exchange_principal') {
    r.acciones.unshift('Abrí la cuenta.');
  }
  return r;
}

/**
 * Recomendación completa + regla de rotación: la Academia pide 3-4 pasarelas
 * free activas en simultáneo. Si quedan menos de 3 en "usar ahora", se
 * promueven las mejores "secundarias" por capacidad; si hay más de 5, se
 * bajan las más chicas.
 */
export function recommend(pr: Profile): Reco[] {
  const d = derive(pr);
  const recos = PLATFORMS_VISIBLES.map((p) => recommendOne(p, pr, d));

  const esPasarela = (r: Reco) => r.platform.rol === 'pasarela_rotacion';
  // Prioridad dentro de la rotación: lo que ya usás > lo que ya abriste > lo que falta abrir;
  // después el orden del Radar (de mayor a menor capacidad operativa, según el PDF).
  const infraRank = (r: Reco) => ({ activa: 3, abierta: 2, bloqueada: 0, no: 1 } as const)[pr.infra[r.platform.empresa] ?? 'no'];
  const prioridad = (a: Reco, b: Reco) => infraRank(b) - infraRank(a) || a.platform.orden - b.platform.orden;

  const activas = recos.filter((r) => esPasarela(r) && r.bucket === 'usar_ahora').sort(prioridad);
  if (activas.length < META.rotacionPasarelas.min) {
    const candidatas = recos
      .filter((r) => esPasarela(r) && r.bucket === 'secundario' && r.platform.confianza === 'confirmado')
      .sort(prioridad);
    for (const c of candidatas.slice(0, META.rotacionPasarelas.min - activas.length)) {
      c.bucket = 'usar_ahora';
      c.razones.push('Sumada para completar la rotación de 3-4 pasarelas que recomienda la Academia.');
    }
  } else if (activas.length > META.rotacionPasarelas.max) {
    for (const s of activas.slice(META.rotacionPasarelas.max)) {
      s.bucket = 'secundario';
      s.razones.unshift('Con 3-4 pasarelas base alcanza: esta queda como respaldo para diversificar o reemplazar una bloqueada.');
    }
  }
  return recos;
}

export function agrupar(recos: Reco[]): Record<Bucket, Reco[]> {
  const g: Record<Bucket, Reco[]> = { usar_ahora: [], preparar: [], reservar: [], secundario: [], no_priorizar: [] };
  for (const r of recos) g[r.bucket].push(r);
  const catOrden = { exchange: 0, billetera: 1, billetera_arbitraje: 2, otc: 3, banco: 4 } as const;
  for (const k of Object.keys(g) as Bucket[]) {
    g[k].sort((a, b) => catOrden[a.platform.categoria] - catOrden[b.platform.categoria] || a.platform.orden - b.platform.orden);
  }
  return g;
}
