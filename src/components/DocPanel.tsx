import { Link } from 'react-router-dom';
import { analizarDocumentacion, ETIQUETAS } from '../engine/documentacion';
import type { Profile } from '../engine/profile';
import { IconInfo } from './Icons';

export function DocPanel({ profile }: { profile: Profile }) {
  const { items, avisos } = analizarDocumentacion(profile);
  const listos = items.filter((i) => !i.faltante);
  const faltan = items.filter((i) => i.faltante);
  return (
    <div className="stack" style={{ gap: 16 }}>
      {avisos.map((a) => (
        <div key={a} className="notice notice-gold"><IconInfo /><span>{a}</span></div>
      ))}

      <div className="stack" style={{ gap: 6 }}>
        <div className="eyebrow">Leé cada línea con su etiqueta</div>
        <p className="muted" style={{ fontSize: 'var(--fs-sm)' }}>
          <b style={{ color: 'var(--ok)' }}>Límite conocido</b> es un número del Radar. <b style={{ color: 'var(--info)' }}>Posibilidad de ampliar</b> significa que la plataforma acepta documentación, no que te aprueben X. <b style={{ color: 'var(--gold-hi)' }}>Requisito</b> es lo que piden. <b style={{ color: 'var(--neutral)' }}>Estimación</b> y <b style={{ color: 'var(--warn)' }}>No confirmado</b> son referencias, no promesas.
        </p>
      </div>

      {listos.length ? (
        <div className="stack">
          <h3>Podrías evaluar presentar documentación en</h3>
          <div className="grid grid-2">
            {listos.map((it) => <DocItem key={`${it.platform.id}-${it.tipo}`} it={it} />)}
          </div>
        </div>
      ) : null}

      {faltan.length ? (
        <div className="stack">
          <h3>Todavía falta algo</h3>
          <div className="grid grid-2">
            {faltan.map((it) => <DocItem key={`${it.platform.id}-${it.tipo}`} it={it} />)}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DocItem({ it }: { it: ReturnType<typeof analizarDocumentacion>['items'][number] }) {
  return (
    <div className="doc-item">
      <div className="row between">
        <h4><Link to={`/plataforma/${it.platform.id}`} style={{ color: 'inherit' }}>{it.titulo}</Link></h4>
        <span className="tag">{it.tipo === 'ampliacion' ? 'Ampliación' : it.tipo === 'plan' ? 'Plan' : it.tipo === 'acceso' ? 'Acceso OTC' : 'Verificado'}</span>
      </div>
      <p className="muted" style={{ fontSize: 'var(--fs-sm)' }}>{it.porQue}</p>
      <div className="doc-lines">
        {it.lineas.map((l, i) => (
          <div key={i} className="doc-line">
            <span className={`lbl lbl-${l.etiqueta}`}>{ETIQUETAS[l.etiqueta]}</span>
            <span>{l.texto}</span>
          </div>
        ))}
      </div>
      {it.faltante ? <p className="doc-falta"><b>Falta:</b> {it.faltante}</p> : null}
    </div>
  );
}
