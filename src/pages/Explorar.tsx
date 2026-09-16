import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PLATFORMS_VISIBLES } from '../data/platforms';
import { CATEGORIAS, type Categoria, type Platform } from '../data/types';
import { PlatformCard } from '../components/PlatformCard';
import { IconSearch } from '../components/Icons';

type Filtro = 'crypto' | 'alto' | 'bajo' | 'amplia' | 'docs' | 'capital' | 'pendiente';
const FILTROS: { id: Filtro; label: string; fn: (p: Platform) => boolean }[] = [
  { id: 'crypto', label: 'Crypto-friendly', fn: (p) => p.cryptoFriendly === 'si' },
  { id: 'alto', label: 'Alto volumen', fn: (p) => p.volumen === 'alto' },
  { id: 'bajo', label: 'Bajo volumen', fn: (p) => p.volumen === 'bajo' },
  { id: 'amplia', label: 'Permite ampliar límites', fn: (p) => p.ampliacion.posible === 'si' },
  { id: 'docs', label: 'Requiere plan / documentación', fn: (p) => !!p.plan?.requerido || !!p.documentacion?.requerida?.length },
  { id: 'capital', label: 'Capital mínimo', fn: (p) => !!p.capitalMinimo || !!p.otc },
  { id: 'pendiente', label: 'Pendiente de confirmar', fn: (p) => p.confianza === 'pendiente' },
];

const CATS: (Categoria | 'todas')[] = ['todas', 'exchange', 'otc', 'billetera_arbitraje', 'billetera', 'banco'];

export function Explorar() {
  const [params, setParams] = useSearchParams();
  const cat = (params.get('cat') as Categoria | null) ?? 'todas';
  const [q, setQ] = useState('');
  const [filtros, setFiltros] = useState<Filtro[]>([]);

  const lista = useMemo(() => {
    const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const nq = norm(q.trim());
    // "Mesas OTC" incluye las plataformas que tienen mesa además de billetera (misma entidad).
    const enCategoria = (p: Platform) => cat === 'todas' || p.categoria === cat || (cat === 'otc' && !!p.otc);
    return PLATFORMS_VISIBLES.filter(enCategoria)
      .filter((p) => !nq || norm(p.nombre).includes(nq) || norm(p.subtipo).includes(nq) || norm(p.descripcion).includes(nq))
      .filter((p) => filtros.every((f) => FILTROS.find((x) => x.id === f)!.fn(p)));
  }, [cat, q, filtros]);

  const porCategoria = useMemo(() => {
    if (cat === 'otc') {
      // Orden por mínimo de la mesa, de menor a mayor (como el Radar).
      const min = (p: Platform) => (p.otc?.capitalMinimo ?? p.capitalMinimo)?.valor ?? Infinity;
      return [['otc', [...lista].sort((a, b) => min(a) - min(b))] as [Categoria, Platform[]]];
    }
    const m = new Map<Categoria, Platform[]>();
    for (const p of lista) m.set(p.categoria, [...(m.get(p.categoria) ?? []), p]);
    return [...m.entries()];
  }, [lista, cat]);

  return (
    <div className="page">
      <div className="container">
        <div className="section-head">
          <div className="eyebrow">Explorar Radar</div>
          <h1 style={{ textTransform: 'uppercase' }}>Todas las plataformas</h1>
          <p>Buscá por nombre o filtrá por lo que necesitás. Cada ficha muestra de dónde sale el dato.</p>
        </div>

        <div className="stack" style={{ gap: 10, marginTop: 16 }}>
          <label className="search">
            <IconSearch />
            <input placeholder="Buscar: Bitso, Lemon, OTC…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar plataforma" />
          </label>
          <div className="filters" role="tablist" aria-label="Categoría">
            {CATS.map((c) => (
              <button key={c} type="button" className={`chip ${cat === c ? 'on' : ''}`} onClick={() => setParams(c === 'todas' ? {} : { cat: c })}>
                {c === 'todas' ? 'Todas' : CATEGORIAS[c].plural}
              </button>
            ))}
          </div>
          <div className="filters" aria-label="Filtros">
            {FILTROS.map((f) => (
              <button key={f.id} type="button" className={`chip ${filtros.includes(f.id) ? 'on-soft' : ''}`} onClick={() => setFiltros((prev) => (prev.includes(f.id) ? prev.filter((x) => x !== f.id) : [...prev, f.id]))}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <p className="faint mono" style={{ fontSize: 'var(--fs-xs)', marginTop: 12 }}>{lista.length} plataformas</p>

        {!lista.length ? (
          <div className="empty" style={{ marginTop: 16 }}><h3>Nada con esos filtros</h3><p>Probá sacando algún filtro o buscando por otro nombre.</p></div>
        ) : porCategoria.map(([c, ps]) => (
          <section key={c} className="section" style={{ marginTop: 22 }}>
            <div className="section-head">
              <h2>{CATEGORIAS[c].plural}</h2>
              <p>{CATEGORIAS[c].descripcion}</p>
            </div>
            <div className="grid grid-3">
              {ps.map((p) => <PlatformCard key={p.id} p={p} />)}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
