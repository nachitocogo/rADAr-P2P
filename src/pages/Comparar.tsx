import { Link } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { byId, PLATFORMS_VISIBLES } from '../data/platforms';
import { CATEGORIAS, ETAPAS, type Platform } from '../data/types';
import { limitesTexto } from '../components/platformUtil';
import { fmtMonto } from '../engine/format';
import { recommendOne, BUCKETS } from '../engine/recommend';
import { BucketTag } from '../components/Badges';

const PRESETS: { label: string; ids: string[] }[] = [
  { label: 'Bitso vs Nexo vs Mercado Pago', ids: ['bitso', 'nexo', 'mercadopago'] },
  { label: 'Ripio vs Belo vs Let\'s Bit (OTC)', ids: ['ripio-otc', 'belo', 'letsbit'] },
  { label: 'Lemon vs Let\'s Bit vs Copter', ids: ['lemon', 'letsbit', 'copter'] },
  { label: 'Binance vs Bybit vs OKX', ids: ['binance', 'bybit', 'okx'] },
  { label: 'Supervielle vs Santander vs Galicia', ids: ['supervielle', 'santander', 'galicia'] },
];

const si = (v: string) => (v === 'si' ? 'Sí' : v === 'no' ? 'No' : v === 'parcial' ? 'Parcial' : v === 'desconocido' ? 'Sin dato' : '—');

export function Comparar() {
  const { compare, setCompare, toggleCompare, profile } = useProfile();
  const items = compare.map(byId).filter((p): p is Platform => !!p);

  const filas: { k: string; v: (p: Platform) => React.ReactNode }[] = [
    { k: 'Categoría', v: (p) => `${CATEGORIAS[p.categoria].nombre} · ${p.subtipo}` },
    { k: 'Modalidades', v: (p) => (p.otc ? 'Billetera / plan + mesa OTC (misma cuenta)' : p.categoria === 'otc' ? 'Mesa OTC' : CATEGORIAS[p.categoria].nombre) },
    { k: 'Límites', v: (p) => (limitesTexto(p).length ? <span className="mono">{limitesTexto(p).join(' · ')}</span> : p.limites?.texto ?? '—') },
    { k: 'Capital mínimo', v: (p) => (p.capitalMinimo ? <span className="mono">{fmtMonto(p.capitalMinimo)}{p.plan ? ' (plan)' : ''}</span> : '—') },
    { k: 'Mínimo OTC', v: (p) => (p.otc ? <span className="mono">{fmtMonto(p.otc.capitalMinimo)}</span> : p.categoria === 'otc' && p.capitalMinimo ? <span className="mono">{fmtMonto(p.capitalMinimo)}</span> : '—') },
    { k: 'Comisión', v: (p) => (p.comision ? <span className="mono">{p.comision.resumen}</span> : '—') },
    { k: 'Plan', v: (p) => (p.plan ? `${p.plan.nombre}${p.plan.niveles ? ` (${p.plan.niveles.map((n) => `${n.nombre} ${n.costo}`).join(', ')})` : ''}` : 'No requiere') },
    { k: 'Permite ampliar', v: (p) => `${si(p.ampliacion.posible)}${p.ampliacion.como ? ` — ${p.ampliacion.como}` : ''}` },
    { k: 'Documentación', v: (p) => [...(p.documentacion?.requerida ?? []), ...(p.documentacion?.sirve ?? [])].join(', ') || '—' },
    { k: 'Crypto-friendly', v: (p) => si(p.cryptoFriendly) },
    { k: 'Volumen recomendado', v: (p) => p.volumen },
    { k: 'Etapa sugerida', v: (p) => (p.etapas.length ? p.etapas.map((e) => ETAPAS[e].corto).join(', ') : 'Uso personal') },
    { k: 'Riesgo de bloqueo', v: (p) => (p.riesgoBloqueo === 'nd' ? 'Sin dato' : p.riesgoBloqueo) },
    { k: 'Inconvenientes', v: (p) => p.inconvenientes?.join(' · ') ?? '—' },
    { k: 'Recomendación', v: (p) => p.recomendacion ?? p.cuandoUsar?.join(' · ') ?? '—' },
    { k: 'Fuente', v: (p) => `${p.fuente === 'pdf' ? 'Radar P2P' : p.fuente === 'academia' ? 'Academia' : 'Sugerencia'} · ${p.confianza === 'pendiente' ? 'pendiente de confirmar' : 'confirmado'} · ${p.actualizado}` },
  ];
  if (profile.completado) {
    filas.unshift({ k: 'Para tu perfil', v: (p) => { const r = recommendOne(p, profile); return <><BucketTag b={r.bucket} /><br /><span style={{ fontSize: 'var(--fs-xs)' }}>{r.razones[0]}</span></>; } });
  }

  return (
    <div className="page">
      <div className="container">
        <div className="section-head">
          <div className="eyebrow">Comparador</div>
          <h1 style={{ textTransform: 'uppercase' }}>Lado a lado</h1>
          <p>Elegí hasta 4 plataformas desde Explorar o con estos atajos. {profile.completado ? 'Como ya hiciste el diagnóstico, también ves qué bucket le toca a cada una en tu mapa.' : ''}</p>
        </div>

        <div className="chips" style={{ marginTop: 14 }}>
          {PRESETS.map((pr) => <button key={pr.label} type="button" className="chip" onClick={() => setCompare(pr.ids)}>{pr.label}</button>)}
        </div>

        {items.length ? (
          <>
            <div className="row" style={{ marginTop: 14 }}>
              {items.map((p) => <button key={p.id} type="button" className="chip on" onClick={() => toggleCompare(p.id)} title="Quitar">{p.nombre} ✕</button>)}
              <button type="button" className="btn btn-soft btn-sm" onClick={() => setCompare([])}>Limpiar</button>
              <Link to="/explorar" className="btn btn-ghost btn-sm">Agregar más</Link>
            </div>
            <div className="scroll-x card" style={{ padding: 0, marginTop: 16 }}>
              <table className="cmp-table">
                <thead>
                  <tr>
                    <th>Criterio</th>
                    {items.map((p) => <th key={p.id}><Link to={`/plataforma/${p.id}`} style={{ color: 'inherit' }}>{p.nombre}</Link><div className="faint" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-xs)', fontWeight: 400, letterSpacing: 0 }}>{p.subtipo}</div></th>)}
                  </tr>
                </thead>
                <tbody>
                  {filas.map((f) => (
                    <tr key={f.k}>
                      <td>{f.k}</td>
                      {items.map((p) => <td key={p.id}>{f.v(p)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {profile.completado ? <p className="faint" style={{ fontSize: 'var(--fs-xs)', marginTop: 8 }}>Buckets: {Object.values(BUCKETS).map((b) => b.nombre).join(' · ')}.</p> : null}
          </>
        ) : (
          <div className="empty" style={{ marginTop: 20 }}>
            <h3>Todavía no elegiste plataformas</h3>
            <p>Tocá un atajo de arriba o marcá "Comparar" en las fichas de <Link to="/explorar">Explorar</Link>.</p>
            <p className="faint" style={{ marginTop: 10, fontSize: 'var(--fs-xs)' }}>{PLATFORMS_VISIBLES.length} plataformas disponibles.</p>
          </div>
        )}
      </div>
    </div>
  );
}
