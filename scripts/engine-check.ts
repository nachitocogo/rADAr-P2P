/**
 * Chequeo rápido del motor: corre perfiles representativos y muestra los buckets.
 * Uso: npm run check:engine
 */
import { recommend, agrupar, BUCKETS, type Bucket } from '../src/engine/recommend';
import { PROFILE_DEFAULT, type Profile } from '../src/engine/profile';
import { escaleraOtc } from '../src/engine/otc';
import { analizarDocumentacion } from '../src/engine/documentacion';
import { proximosPasos } from '../src/engine/nextSteps';

const perfiles: Record<string, Partial<Profile>> = {
  'A · Principiante sin nada': { etapa: 'principiante', binance: 'no_empece', capitalUsd: 800, volumenMensualUsd: 3000, docs: [] },
  'B · Construcción con CERTI (ejemplo)': { etapa: 'construccion', binance: 'farmeando', capitalUsd: 8000, volumenMensualUsd: 25000, docs: ['certi', 'extractos'], certiMontoArs: 25_000_000, infra: { binance: 'activa', 'personal-pay': 'activa', 'naranja-x': 'activa', lemon: 'abierta', mercadopago: 'abierta' } },
  'C · Verificado oro + CERTI, volumen alto': { etapa: 'escalado', binance: 'verificado', insignia: 'oro', clientes: true, capitalUsd: 25000, volumenMensualUsd: 120000, docs: ['certi', 'cedular', 'contador'], certiMontoArs: 150_000_000, infra: { binance: 'activa', bybit: 'activa', lemon: 'activa', bitso: 'activa', 'letsbit': 'abierta' } },
  'D · Binance bloqueada, sin CERTI': { etapa: 'construccion', binance: 'rechazado', capitalUsd: 3000, volumenMensualUsd: 12000, docs: [], infra: { binance: 'bloqueada', lemon: 'activa' } },
};

for (const [nombre, patch] of Object.entries(perfiles)) {
  const p: Profile = { ...PROFILE_DEFAULT, ...patch, completado: true };
  const g = agrupar(recommend(p));
  console.log(`\n══ ${nombre} ══`);
  for (const b of Object.keys(BUCKETS) as Bucket[]) {
    console.log(`  ${BUCKETS[b].nombre.padEnd(24)} ${g[b].map((r) => r.platform.nombre + (r.platform.categoria === 'otc' ? '(OTC)' : '')).join(', ')}`);
  }
  const otc = escaleraOtc(p.capitalUsd, p.usdArs);
  console.log(`  OTC habilitadas: ${otc.filter((e) => e.habilitada).map((e) => e.platform.nombre).join(', ') || '—'} · próxima: ${otc.find((e) => !e.habilitada)?.platform.nombre ?? '—'}`);
  const docs = analizarDocumentacion(p);
  console.log(`  Docs listas: ${docs.items.filter((i) => !i.faltante).map((i) => i.platform.nombre).join(', ') || '—'} | avisos: ${docs.avisos.length}`);
  console.log(`  Próximos pasos: ${proximosPasos(p).map((s) => s.titulo).join(' → ')}`);
}
