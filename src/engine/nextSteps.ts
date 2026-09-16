/**
 * Próximos pasos: árbol de decisión rápida de la Academia (Metodología §22),
 * adaptado al perfil.
 */
import { derive, type Profile } from './profile';
import { fmtUsd } from './format';
import { META } from '../data/meta';

export interface Paso { titulo: string; detalle: string }

export function proximosPasos(pr: Profile): Paso[] {
  const d = derive(pr);
  const pasos: Paso[] = [];

  if (!d.verificado) {
    if (pr.binance === 'rechazado') {
      pasos.push({ titulo: 'Apelar en Binance sin frenar la operativa', detalle: 'Apelación formal con CERTI, DNI y justificación de fondos. Mientras tanto, Bybit y OKX.' });
    } else if (pr.binance === 'no_empece') {
      pasos.push({ titulo: 'Abrir Binance y hacer las primeras 20 operaciones', detalle: 'Espaciadas (máx. 5 por día), montos distintos, contrapartes distintas. Planilla desde la primera.' });
    } else {
      pasos.push({ titulo: 'Farmear el verificado', detalle: '20-25 operaciones por día de USD 500-700 en USDT, con montos y contrapartes variados. Referencia: 15-20 días de ritmo sostenido.' });
    }
  }

  if (!d.tieneCerti) {
    pasos.push({ titulo: 'Abrir la CERTI con un contador', detalle: 'Certificación contable lo más abultada posible: recibos de sueldo (hasta 12 meses), facturación, contratos de mutuo. Es lo que destraba límites y evita bloqueos.' });
  } else if (d.certiVigencia === 'vencida') {
    pasos.push({ titulo: 'Renovar la certificación', detalle: `Tiene más de ${META.certiVigenciaMeses} meses: las plataformas piden una certificación reciente. Actualizala antes de presentarla o pedir ampliaciones.` });
  } else if (d.certiMontoArs > 0 && d.certiMontoArs < d.volumenMensualArs) {
    pasos.push({ titulo: 'Ampliar la CERTI', detalle: 'Tu volumen mensual supera lo certificado. Hablalo con el contador antes de subir más el volumen.' });
  }

  if (!pr.clientes) {
    pasos.push({ titulo: 'Captación desde el día cero', detalle: 'Canal P2P: 30-50 mensajes por día, sobrios ("Pasame tu número si te interesa hacer operaciones de volumen"). Es estadística: 1-2 clientes cada 100-120 contactos.' });
  } else {
    pasos.push({ titulo: 'Planilla al día antes de escalar', detalle: 'No se escala sobre caos. Cada operación registrada: fecha, plataforma, contraparte, montos, comisión, hash.' });
  }

  if (d.banda === 'arranque') {
    pasos.push({ titulo: 'Rotar 3-4 pasarelas free', detalle: 'Ninguna billetera es "la" billetera. Si solo tenés una, cualquier bloqueo te saca del juego.' });
  } else if (d.banda === 'medio') {
    pasos.push({ titulo: 'Sumar una billetera pro de respaldo', detalle: `Entre ${fmtUsd(META.bandasVolumenUsd.arranque)} y ${fmtUsd(META.bandasVolumenUsd.medio)}/mes: 3 pasarelas free + 1 pro (Let's Bit / TelePagos) lista para activar, CERTI renovada.` });
  } else {
    pasos.push({ titulo: 'Primaria pro + OTC para operaciones grandes', detalle: `Más de ${fmtUsd(META.bandasVolumenUsd.medio)}/mes: Copter o Let's Bit como primaria, free solo para tickets chicos, OTC según capital. Pensar en delegación.` });
  }

  return pasos.slice(0, 4);
}
