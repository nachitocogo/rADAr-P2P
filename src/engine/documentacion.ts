/**
 * Análisis documental: dónde tiene sentido presentar documentación,
 * qué habilitaría y qué falta. Diferencia siempre entre límite conocido,
 * posibilidad de ampliar, requisito, estimación y dato no confirmado.
 */
import type { Platform } from '../data/types';
import { PLATFORMS_VISIBLES } from '../data/platforms';
import { derive, type Profile } from './profile';
import { fmtArs, fmtMonto, fmtUsd } from './format';
import { META } from '../data/meta';

export type TipoDoc = 'ampliacion' | 'plan' | 'acceso' | 'verificado';
export type Etiqueta = 'limite_conocido' | 'posibilidad' | 'requisito' | 'estimacion' | 'no_confirmado';

export const ETIQUETAS: Record<Etiqueta, string> = {
  limite_conocido: 'Límite conocido',
  posibilidad: 'Posibilidad de ampliar',
  requisito: 'Requisito',
  estimacion: 'Estimación',
  no_confirmado: 'No confirmado',
};

export interface LineaDoc { etiqueta: Etiqueta; texto: string }

export interface ItemDoc {
  platform: Platform;
  tipo: TipoDoc;
  titulo: string;
  porQue: string;
  lineas: LineaDoc[];
  faltante: string | null;
  prioridad: number;
}

export function analizarDocumentacion(pr: Profile): { items: ItemDoc[]; avisos: string[] } {
  const d = derive(pr);
  const items: ItemDoc[] = [];
  const avisos: string[] = [];

  if (!d.tieneCerti) {
    avisos.push('Sin CERTI, casi ninguna ampliación avanza. Es el paso que más límites destraba: hablalo con tu contador o con el contador vigente de la Academia (dato en Discord).');
  } else if (d.certiMontoArs > 0 && d.certiMontoArs < d.volumenMensualArs) {
    avisos.push(`Tu volumen mensual estimado (~${fmtArs(d.volumenMensualArs)}) supera el monto certificado (${fmtArs(d.certiMontoArs)}). La Academia recomienda la certificación lo más abultada posible: conviene ampliarla.`);
  }
  if (d.tieneCerti) {
    if (d.certiVigencia === 'vencida') avisos.push(`Tu certificación tiene más de ${META.certiVigenciaMeses} meses: actualizala con el contador antes de presentarla en cualquier plataforma.`);
    else if (d.certiVigencia === 'por_vencer') avisos.push(`Tu certificación está por cumplir ${META.certiVigenciaMeses} meses. Si vas a presentarla en varias plataformas, evaluá renovarla primero.`);
    else avisos.push(`Para presentar una certificación contable conviene que tenga menos de ${META.certiVigenciaMeses} meses de antigüedad. Si está próxima a vencer, actualizala antes de enviarla a distintas plataformas.`);
  }

  for (const p of PLATFORMS_VISIBLES) {
    if (p.usoPersonal) continue;
    const infra = pr.infra[p.empresa];
    if (infra === 'bloqueada') continue;

    // 1) ampliación de límites con documentación
    if (p.ampliacion.posible === 'si' && (p.rol === 'pasarela_rotacion' || p.rol === 'pasarela_vigilada')) {
      const lineas: LineaDoc[] = [];
      if (p.limites?.diario) lineas.push({ etiqueta: 'limite_conocido', texto: `${fmtMonto(p.limites.diario)} por día${p.limites.variaPorCuenta ? ' (varía por cuenta)' : ''}.` });
      if (p.limites?.mensual) lineas.push({ etiqueta: 'limite_conocido', texto: `${fmtMonto(p.limites.mensual)} por mes.` });
      lineas.push({ etiqueta: p.ampliacion.confianza === 'confirmado' ? 'posibilidad' : 'no_confirmado', texto: p.ampliacion.como ?? 'Permite presentar documentación.' });
      if (d.tieneCerti && d.certiMontoArs > 0) {
        lineas.push({ etiqueta: 'estimacion', texto: `Tu CERTI respalda ${fmtArs(d.certiMontoArs)}. Cuánto extienden lo define la plataforma: no hay un número garantizado.` });
      }
      items.push({
        platform: p,
        tipo: 'ampliacion',
        titulo: `Ampliar límites en ${p.nombre}`,
        porQue: d.tieneCerti
          ? 'Ya tenés la documentación que piden. Presentarla sube el techo antes de que importe.'
          : 'Cuando tengas la CERTI, es de las primeras donde presentarla.',
        lineas,
        faltante: d.tieneCerti ? null : 'Certificación de ingresos (CERTI)',
        prioridad: d.tieneCerti ? (p.volumen === 'alto' ? 1 : 2) : 4,
      });
    }

    // 2) planes que requieren solicitud + documentación
    if (p.plan?.requerido) {
      const lineas: LineaDoc[] = [];
      lineas.push({ etiqueta: 'requisito', texto: `${p.plan.nombre}: ${p.plan.comoSeAccede ?? 'se solicita a la plataforma.'}` });
      if (p.plan.niveles) lineas.push({ etiqueta: 'limite_conocido', texto: p.plan.niveles.map((n) => `${n.nombre} ${n.limite} (${n.costo})`).join(' · ') });
      if (p.comision) lineas.push({ etiqueta: 'limite_conocido', texto: `Comisión: ${p.comision.resumen}.` });
      let faltante: string | null = null;
      if (p.capitalMinimo) {
        const min = p.capitalMinimo.moneda === 'ARS' ? p.capitalMinimo.valor / pr.usdArs : p.capitalMinimo.valor;
        lineas.push({ etiqueta: 'requisito', texto: `Capital mínimo ${fmtUsd(min)}.` });
        if (pr.capitalUsd < min) faltante = `${fmtUsd(min - pr.capitalUsd)} de capital para llegar al mínimo`;
      }
      if (p.rol === 'pasarela_premium' && !d.tieneCerti) faltante = 'CERTI antes de activar el plan (la Academia no la recomienda sin certificación)';
      if (p.rol === 'billetera_pro' && d.banda === 'arranque' && !pr.clientes) faltante = 'Volumen que justifique la comisión (la Academia la suma a partir de ~USD 20K/mes o con un cliente grande)';
      if (p.documentacion?.sirve?.length) lineas.push({ etiqueta: p.documentacion.confianza === 'confirmado' ? 'requisito' : 'no_confirmado', texto: `Sirve presentar: ${p.documentacion.sirve.join(', ')}.` });
      items.push({
        platform: p,
        tipo: 'plan',
        titulo: `Solicitar el plan de ${p.nombre}`,
        porQue: p.rol === 'pasarela_premium'
          ? 'Es la pasarela para centralizar cuando estás verificado y con CERTI.'
          : p.rol === 'billetera_plan'
            ? 'Plan estable gatillado por capital: si llegás al mínimo, conviene pedirlo.'
            : 'Se justifica con volumen real: pedilo cuando un cliente grande lo amerite.',
        lineas,
        faltante,
        prioridad: faltante ? 5 : p.rol === 'pasarela_premium' ? 1 : d.banda === 'alto' ? 2 : 4,
      });
    }

    // 3) acceso OTC (los mínimos ya se ven en la escalera; acá solo las mesas que piden documentación)
    const otcDoc = p.otc?.documentacion ?? (p.categoria === 'otc' ? p.documentacion : undefined);
    const otcMin = p.otc?.capitalMinimo ?? (p.categoria === 'otc' ? p.capitalMinimo : undefined);
    if (otcDoc?.sirve?.length) {
      const min = otcMin ? (otcMin.moneda === 'ARS' ? otcMin.valor / pr.usdArs : otcMin.valor) : null;
      items.push({
        platform: p,
        tipo: 'acceso',
        titulo: `Acceso OTC en ${p.nombre}`,
        porQue: 'Mesa que, según la Academia, pide respaldo documental además del capital mínimo.',
        lineas: [
          ...(min ? [{ etiqueta: 'requisito' as Etiqueta, texto: `Mínimo ${fmtUsd(min)} por operación.` }] : []),
          { etiqueta: otcDoc.confianza === 'confirmado' ? 'requisito' : 'no_confirmado', texto: `Sirve presentar: ${otcDoc.sirve.join(', ')}.` },
        ],
        faltante: min && pr.capitalUsd < min ? `${fmtUsd(min - pr.capitalUsd)} de capital` : !d.tieneCerti ? 'CERTI que respalde el monto' : null,
        prioridad: min && pr.capitalUsd >= min ? 3 : 6,
      });
    }
  }

  // 4) verificado de Binance: documentación que pide
  if (pr.binance && pr.binance !== 'verificado') {
    const b = PLATFORMS_VISIBLES.find((p) => p.id === 'binance')!;
    items.push({
      platform: b,
      tipo: 'verificado',
      titulo: 'Verificado de Binance',
      porQue: 'Es el hito que cambia tu estrategia de cuentas. Tené el extracto listo antes de que lo pidan.',
      lineas: [
        { etiqueta: 'requisito', texto: 'Extracto bancario o de billetera con logo y dirección, con movimientos que coincidan con las operaciones.' },
        { etiqueta: 'no_confirmado', texto: 'Métricas de referencia: volumen equivalente a 1 BTC histórico y 0,5 BTC en 30 días (operando USDT), 350-450 ops, +90 días de cuenta, 500 USDT retenidos.' },
      ],
      faltante: pr.docs.includes('extractos') ? null : 'Extracto con logo y dirección (los resúmenes "rasos" no sirven)',
      prioridad: 0,
    });
  }

  items.sort((a, b) => a.prioridad - b.prioridad || a.platform.orden - b.platform.orden);
  return { items, avisos };
}
