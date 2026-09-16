import { Link } from 'react-router-dom';
import type { Reco } from '../engine/recommend';
import { CATEGORIAS } from '../data/types';
import { FitTag } from './Badges';

export function RecoCard({ r, compact = false }: { r: Reco; compact?: boolean }) {
  const p = r.platform;
  return (
    <Link to={`/plataforma/${p.id}`} className="reco">
      <div className="reco-head">
        <span className="reco-name">{p.nombre}</span>
        <span className="reco-cat">{CATEGORIAS[p.categoria].corto}</span>
      </div>
      <ul className="reco-list">
        {r.razones.slice(0, compact ? 1 : 2).map((t, i) => <li key={`r${i}`}>{t}</li>)}
        {!compact && r.acciones.slice(0, 2).map((t, i) => <li key={`a${i}`} className="accion">{t}</li>)}
        {!compact && r.alertas.slice(0, 1).map((t, i) => <li key={`w${i}`} className="alerta">{t}</li>)}
      </ul>
      {r.fit ? <div className="row"><FitTag f={r.fit} /></div> : null}
      {p.confianza === 'pendiente' ? <div className="row"><span className="tag tag-pend">Pendiente de confirmar</span></div> : null}
    </Link>
  );
}
