import { Link } from 'react-router-dom';
import { PLATFORMS_VISIBLES } from '../data/platforms';
import { CATEGORIAS, type Categoria } from '../data/types';
import { META } from '../data/meta';
import { RadarGraphic } from '../components/RadarGraphic';
import { useProfile } from '../context/ProfileContext';
import { ETAPAS } from '../data/types';
import { IconArrow } from '../components/Icons';
import { Brand } from '../components/Brand';

const grupos: { cat: Categoria[]; label: string; to: string }[] = [
  { cat: ['exchange'], label: 'Exchanges P2P', to: '/explorar?cat=exchange' },
  { cat: ['otc'], label: 'Mesas OTC', to: '/otc' },
  { cat: ['billetera_arbitraje'], label: 'Billeteras arbitraje', to: '/explorar?cat=billetera_arbitraje' },
  { cat: ['billetera', 'banco'], label: 'Bancos y billeteras', to: '/explorar?cat=billetera' },
];

export function Home() {
  const { profile } = useProfile();
  const pendientes = PLATFORMS_VISIBLES.filter((p) => p.confianza === 'pendiente').length;
  return (
    <div className="page">
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <div className="eyebrow fade-up">Recurso del curso · Arbitraje P2P</div>
            <h1 className="fade-up d1" style={{ marginTop: 14 }}>
              <span className="thin"><b>A</b>cademia <b>D</b>e <b>A</b>rbitraje</span>
              <Brand size="hero" />
            </h1>
            <p className="hero-sub fade-up d2">
              Encontrá qué bancos, billeteras, exchanges y mesas OTC tienen más sentido para <strong>tu etapa operativa</strong> — con tu capital, tu documentación y tu estado en Binance.
            </p>
            <div className="hero-cta fade-up d3">
              <Link to={profile.completado ? '/mapa' : '/diagnostico'} className="btn btn-gold btn-lg">
                {profile.completado ? 'Ver mi mapa operativo' : 'Analizar mi situación'} <IconArrow />
              </Link>
              <Link to="/explorar" className="btn btn-ghost btn-lg">Explorar plataformas</Link>
            </div>
          </div>
          <div className="fade-up d2"><RadarGraphic /></div>
        </div>
      </section>

      <div className="container">
        {profile.completado ? (
          <div className="resume fade-up d3">
            <div>
              <div className="eyebrow">Tu perfil guardado</div>
              <p style={{ marginTop: 4 }}>
                <strong>{profile.etapa ? ETAPAS[profile.etapa].nombre : '—'}</strong> · capital <span className="mono gold">USD {profile.capitalUsd.toLocaleString('es-AR')}</span> · {profile.docs.includes('certi') ? 'con CERTI' : 'sin CERTI'} · {profile.binance === 'verificado' ? 'Binance verificado' : 'sin verificado'}
              </p>
            </div>
            <div className="row">
              <Link to="/mapa" className="btn btn-gold btn-sm">Retomar mi mapa</Link>
              <Link to="/diagnostico" className="btn btn-soft btn-sm">Editar diagnóstico</Link>
            </div>
          </div>
        ) : null}

        <section className="section">
          <div className="statgrid fade-up d3">
            {grupos.map((g) => {
              const n = PLATFORMS_VISIBLES.filter((p) => g.cat.includes(p.categoria) || (g.cat.includes('otc') && !!p.otc)).length;
              return (
                <Link key={g.label} to={g.to} className="stat">
                  <span className="n">{String(n).padStart(2, '0')}</span>
                  <span className="l">{g.label}</span>
                  <span className="d">{CATEGORIAS[g.cat[0]].descripcion}</span>
                </Link>
              );
            })}
          </div>
          <p className="faint" style={{ fontSize: 'var(--fs-xs)', marginTop: 10, fontFamily: 'var(--font-mono)' }}>
            Última revisión del recurso: {META.ultimaRevision}. {pendientes} plataformas con datos marcados como pendientes de confirmar.
          </p>
        </section>

        <section className="section">
          <div className="section-head">
            <h2>No es una biblioteca: es un recomendador</h2>
            <p>rADAr-P2P cruza los datos reales de cada plataforma con tu situación y te devuelve un mapa: qué usar ahora, qué preparar y qué reservar para cuando escales.</p>
          </div>
          <div className="steps">
            <div className="step">
              <h3>Contá tu situación</h3>
              <p>Etapa, estado en Binance, capital, volumen, documentación y qué cuentas ya tenés. Dos minutos desde el celular.</p>
            </div>
            <div className="step">
              <h3>Recibí tu mapa operativo</h3>
              <p>Plataformas agrupadas en usar ahora, preparar, reservar, secundarias y no priorizar — con el porqué de cada una.</p>
            </div>
            <div className="step">
              <h3>Ajustá a medida que crecés</h3>
              <p>Llegaste al verificado, sumaste CERTI o capital: actualizá el diagnóstico y el mapa cambia con vos.</p>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-head">
            <h2>La lógica detrás</h2>
          </div>
          <div className="grid grid-3">
            <div className="card stack">
              <div className="eyebrow">Etapa antes que límite</div>
              <p className="muted" style={{ fontSize: 'var(--fs-sm)' }}>La plataforma con más límite no siempre es la que te conviene hoy. Las mejores pasarelas se preservan hasta tener verificado y certificación; antes se construye con cuentas de rotación.</p>
            </div>
            <div className="card stack">
              <div className="eyebrow">Documentación como palanca</div>
              <p className="muted" style={{ fontSize: 'var(--fs-sm)' }}>Con una certificación de ingresos, varias plataformas extienden límites o habilitan planes. El Radar te dice dónde presentarla y qué es posibilidad vs. requisito.</p>
            </div>
            <div className="card stack">
              <div className="eyebrow">OTC por capital</div>
              <p className="muted" style={{ fontSize: 'var(--fs-sm)' }}>Cada mesa tiene un mínimo. Con tu capital declarado ves cuáles se habilitan, cuál es la próxima y cuánto te falta.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
