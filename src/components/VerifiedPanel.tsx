import { BINANCE_ESTADOS, INSIGNIAS, VERIFIED_ANTI_WASH, VERIFIED_GUIA, VERIFIED_REQUISITOS, VERIFIED_RITMO, VERIFIED_SI_NO_LLEGA, type BinanceEstado, type Insignia } from '../data/binanceVerified';

export function VerifiedPanel({ estado, insignia }: { estado: BinanceEstado | null; insignia: Insignia | null }) {
  const est = estado ?? 'no_empece';
  const g = VERIFIED_GUIA[est];
  const orden: BinanceEstado[] = ['no_empece', 'construyendo', 'farmeando', 'presentado', 'verificado'];
  return (
    <div className="stack" style={{ gap: 18 }}>
      <div className="verif-state" aria-label="Etapa del verificado">
        {orden.map((e) => (
          <span key={e} className={`chip ${e === est ? 'on' : orden.indexOf(e) < orden.indexOf(est) ? 'on-soft' : ''}`}>{BINANCE_ESTADOS[e].nombre}</span>
        ))}
        {est === 'rechazado' ? <span className="chip on" style={{ background: 'var(--stop)', borderColor: 'var(--stop)', color: '#fff' }}>{BINANCE_ESTADOS.rechazado.nombre}</span> : null}
      </div>

      <div className="card card-gold stack">
        <div className="eyebrow">Tu momento</div>
        <h3>{g.titulo}</h3>
        <ol style={{ color: 'var(--sand)', fontSize: 'var(--fs-sm)', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {g.pasos.map((p) => <li key={p}>{p}</li>)}
        </ol>
        <div className="notice notice-gold" style={{ marginTop: 6 }}>
          <span className="tag tag-gold" style={{ flex: 'none' }}>Cuentas</span>
          <span>{g.stack}</span>
        </div>
        {est === 'verificado' && insignia ? (
          <div className="kv" style={{ marginTop: 6 }}>
            <span className="k">Insignia actual</span><span className="v gold">{INSIGNIAS[insignia].nombre} · comisión {INSIGNIAS[insignia].comision}</span>
          </div>
        ) : null}
      </div>

      <div className="grid grid-2">
        <div className="card stack">
          <div className="row between"><h4>Requisitos de referencia</h4><span className="tag tag-pend">Pendiente de confirmar</span></div>
          <p className="faint" style={{ fontSize: 'var(--fs-xs)' }}>Métricas que maneja la Academia. Binance las cambia sin aviso: verificá en la plataforma.</p>
          <ul className="check-list">
            {VERIFIED_REQUISITOS.map((r) => <li key={r.texto}>{r.texto}</li>)}
          </ul>
        </div>
        <div className="card stack">
          <h4>Ritmo para llegar</h4>
          <div className="kv">
            <span className="k">Operaciones</span><span className="v gold">{VERIFIED_RITMO.opsPorDia}</span>
            <span className="k">Ticket</span><span className="v gold">{VERIFIED_RITMO.ticket}</span>
            <span className="k">Horario</span><span className="v">{VERIFIED_RITMO.horario}</span>
            <span className="k">Mantenimiento</span><span className="v">{VERIFIED_RITMO.mantenimiento}</span>
          </div>
          <p className="muted" style={{ fontSize: 'var(--fs-sm)' }}>{VERIFIED_RITMO.referencia}</p>
        </div>
        <div className="card stack">
          <h4>Para que no te bloqueen por wash trading</h4>
          <ul className="check-list">
            {VERIFIED_ANTI_WASH.map((r) => <li key={r} className="gold">{r}</li>)}
          </ul>
        </div>
        <div className="card stack">
          <h4>Si no llega, revisá esto</h4>
          <ul className="check-list">
            {VERIFIED_SI_NO_LLEGA.map((r) => <li key={r}>{r}</li>)}
          </ul>
        </div>
      </div>

      <div className="card stack" style={{ gap: 6 }}>
        <h4>Insignias y comisiones</h4>
        <div className="kv">
          <span className="k">Sin verificar</span><span className="v">0,20%</span>
          {(Object.keys(INSIGNIAS) as Insignia[]).map((k) => (
            <span key={k} style={{ display: 'contents' }}>
              <span className="k">{INSIGNIAS[k].nombre}</span><span className={`v ${insignia === k ? 'gold' : ''}`}>{INSIGNIAS[k].comision}</span>
            </span>
          ))}
        </div>
        <span className="tag tag-gold" style={{ alignSelf: 'flex-start' }}>Radar sept. 2026</span>
      </div>
    </div>
  );
}
