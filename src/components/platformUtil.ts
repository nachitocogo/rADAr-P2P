import type { Platform } from '../data/types';
import { fmtMonto } from '../engine/format';

/** Métrica principal que se muestra en la card de cada plataforma. */
export function metricaPrincipal(p: Platform): { k: string; v: string } {
  if (p.categoria === 'exchange') {
    if (p.comision?.detalle?.length) return { k: 'Comisión', v: `${p.comision.detalle[0].valor} → ${p.comision.detalle[p.comision.detalle.length - 1].valor}` };
    return { k: 'Comisión', v: p.comision?.resumen ?? '—' };
  }
  if (p.categoria === 'otc') return { k: 'Mínimo', v: p.capitalMinimo ? fmtMonto(p.capitalMinimo) : 'A confirmar' };
  if (p.categoria === 'billetera_arbitraje') {
    if (p.capitalMinimo) return { k: 'Capital mínimo (plan)', v: fmtMonto(p.capitalMinimo) };
    if (p.comision) return { k: 'Comisión', v: p.comision.resumen.replace('Con el plan: ', '') };
    return { k: 'Lógica', v: 'Se opera puertas adentro' };
  }
  if (p.limites?.diario) return { k: 'Límite diario', v: fmtMonto(p.limites.diario) };
  if (p.limites?.mensual) return { k: 'Límite mensual', v: fmtMonto(p.limites.mensual) };
  if (p.usoPersonal) return { k: 'Uso', v: 'Personal' };
  return { k: 'Límite', v: 'Sin dato público' };
}

export function limitesTexto(p: Platform): string[] {
  const l = p.limites;
  if (!l) return [];
  const out: string[] = [];
  if (l.diario) out.push(`Diario: ${fmtMonto(l.diario)}${l.variaPorCuenta ? ' *' : ''}`);
  if (l.mensual) out.push(`Mensual: ${fmtMonto(l.mensual)}`);
  if (l.anual) out.push(`Anual: ${fmtMonto(l.anual)}`);
  if (l.porMovimiento) out.push(`Por movimiento: ${fmtMonto(l.porMovimiento)}`);
  if (l.transferenciasDia) out.push(`Transferencias por día: ${l.transferenciasDia}`);
  if (l.texto) out.push(l.texto);
  if (l.variaPorCuenta) out.push('* Varía según la cuenta de cada uno.');
  return out;
}
