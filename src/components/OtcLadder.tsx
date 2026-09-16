import { Link } from 'react-router-dom';
import { escaleraOtc, OTC_NOTAS } from '../engine/otc';
import { fmtUsd } from '../engine/format';

export function OtcLadder({ capitalUsd, usdArs }: { capitalUsd: number; usdArs: number }) {
  const escalones = escaleraOtc(capitalUsd, usdArs);
  const confirmadas = escalones.filter((e) => !e.pendiente);
  const maxRef = Math.max(...confirmadas.map((e) => e.minimoUsd), 30000) * 1.15;
  const pos = (v: number) => `${Math.min(100, (v / maxRef) * 100)}%`;
  const habilitadas = escalones.filter((e) => e.habilitada);
  const proximas = escalones.filter((e) => !e.habilitada);
  const siguiente = proximas.find((e) => !e.pendiente) ?? proximas[0];

  return (
    <div className="stack" style={{ gap: 18 }}>
      <div className="row between">
        <div>
          <div className="eyebrow">Capital actual</div>
          <div className="big-value">{fmtUsd(capitalUsd)}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="eyebrow">Mesas habilitadas</div>
          <div className="big-value">{habilitadas.length}<small>/ {escalones.length}</small></div>
        </div>
      </div>

      <div className="otc-wrap">
        <div className="altimeter" aria-hidden="true">
          <div className="rail" />
          <div className="fill" style={{ height: pos(capitalUsd) }} />
          {confirmadas.map((e) => <div key={e.platform.id} className={`mark ${e.habilitada ? 'on' : ''}`} style={{ bottom: pos(e.minimoUsd) }} title={`${e.platform.nombre} · ${fmtUsd(e.minimoUsd)}`} />)}
          <div className="cap" style={{ bottom: pos(capitalUsd) }} />
        </div>

        <div className="stack">
          {escalones.map((e) => {
            const pct = Math.min(100, (capitalUsd / e.minimoUsd) * 100);
            const isNext = siguiente?.platform.id === e.platform.id;
            return (
              <Link key={e.platform.id} to={`/plataforma/${e.platform.id}`} className={`otc-row ${e.habilitada ? 'on' : ''} ${isNext ? 'next' : ''}`} style={{ color: 'inherit' }}>
                <span className="name">{e.platform.nombre}{e.platform.otc ? <span className="tag" style={{ marginLeft: 8, verticalAlign: 'middle' }}>Billetera + OTC</span> : null}</span>
                <span className="min">{e.minimoHastaUsd ? `${fmtUsd(e.minimoUsd)}–${fmtUsd(e.minimoHastaUsd).replace('USD ', '')}` : fmtUsd(e.minimoUsd)}{e.pendiente ? ' *' : ''}</span>
                <span className="st">
                  {e.habilitada
                    ? <><span className="tag tag-ok">Habilitada por capital</span> Pedí el acceso a la plataforma.</>
                    : isNext
                      ? <><span className="tag tag-gold">Próxima</span> Te faltan <b className="mono">{fmtUsd(e.faltanteUsd)}</b>.</>
                      : <>Te faltan <b className="mono">{fmtUsd(e.faltanteUsd)}</b>.</>}
                  {e.pendiente ? <> <span className="tag tag-pend">Pendiente de confirmar</span></> : null}
                </span>
                <span className="bar"><i style={{ width: `${pct}%` }} /></span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="stack" style={{ gap: 6 }}>
        {OTC_NOTAS.map((n) => (
          <div key={n.texto} className="notice">
            <span className={`tag ${n.fuente === 'pdf' ? 'tag-gold' : ''}`} style={{ flex: 'none' }}>{n.fuente === 'pdf' ? 'Radar' : 'Academia'}</span>
            <span>{n.texto}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
