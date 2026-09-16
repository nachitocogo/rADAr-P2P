import { Link } from 'react-router-dom';
import type { Platform } from '../data/types';
import { CryptoTag, FuenteTag, Liquidez } from './Badges';
import { metricaPrincipal } from './platformUtil';
import { fmtMonto } from '../engine/format';
import { useProfile } from '../context/ProfileContext';
import { IconCheck, IconPlus } from './Icons';

export function PlatformCard({ p }: { p: Platform }) {
  const { compare, toggleCompare } = useProfile();
  const on = compare.includes(p.id);
  const m = metricaPrincipal(p);
  return (
    <div className="card pcard">
      <Link to={`/plataforma/${p.id}`} className="pcard-head" style={{ color: 'inherit' }}>
        <div>
          <div className="pcard-name">{p.nombre}</div>
          <div className="pcard-sub">{p.subtipo}</div>
        </div>
        {p.liquidez ? <Liquidez n={p.liquidez} /> : null}
      </Link>
      <div className="row" style={{ gap: 18, alignItems: 'flex-start' }}>
        <div className="pcard-metric">
          <span className="k">{m.k}</span>
          <span className="v">{m.v}</span>
        </div>
        {p.otc ? (
          <div className="pcard-metric">
            <span className="k">Mínimo OTC</span>
            <span className="v">{fmtMonto(p.otc.capitalMinimo)}</span>
          </div>
        ) : null}
      </div>
      {p.tagline ? <p className="pcard-desc gold" style={{ fontWeight: 600 }}>{p.tagline}</p> : <p className="pcard-desc">{p.descripcion}</p>}
      <div className="pcard-tags">
        {p.otc ? <span className="tag tag-gold">Billetera + OTC</span> : null}
        <CryptoTag v={p.cryptoFriendly} />
        {p.ampliacion.posible === 'si' && p.categoria !== 'exchange' ? <span className="tag tag-info">Amplía límites</span> : null}
        {p.plan?.requerido ? <span className="tag">Plan requerido</span> : null}
        {p.usoPersonal ? <span className="tag tag-stop">Uso personal</span> : null}
        <FuenteTag fuente={p.fuente} confianza={p.confianza} />
      </div>
      <div className="pcard-foot">
        <Link to={`/plataforma/${p.id}`} className="btn btn-ghost btn-sm">Ver ficha</Link>
        <button type="button" className={`cmp-toggle ${on ? 'on' : ''}`} onClick={() => toggleCompare(p.id)} aria-pressed={on}>
          {on ? <IconCheck /> : <IconPlus />} {on ? 'En comparador' : 'Comparar'}
        </button>
      </div>
    </div>
  );
}
