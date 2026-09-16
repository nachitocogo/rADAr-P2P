import { Link, Navigate, useParams } from 'react-router-dom';
import { byId, PLATFORMS_VISIBLES } from '../data/platforms';
import { CATEGORIAS } from '../data/types';
import { useProfile } from '../context/ProfileContext';
import { recommendOne } from '../engine/recommend';
import { BucketTag, CryptoTag, FitTag, FuenteTag, Liquidez, RiesgoTag } from '../components/Badges';
import { limitesTexto } from '../components/platformUtil';
import { fmtMonto } from '../engine/format';
import { IconBack, IconCheck, IconPlus } from '../components/Icons';
import { ETAPAS } from '../data/types';

export function Plataforma() {
  const { id } = useParams();
  const p = id ? byId(id) : undefined;
  const { profile, compare, toggleCompare } = useProfile();
  if (!p) return <Navigate to="/explorar" replace />;

  const reco = profile.completado ? recommendOne(p, profile) : null;
  const on = compare.includes(p.id);
  const hermanos = PLATFORMS_VISIBLES.filter((x) => x.empresa === p.empresa && x.id !== p.id);

  return (
    <div className="page">
      <div className="container">
        <Link to="/explorar" className="btn btn-soft btn-sm" style={{ marginBottom: 18 }}><IconBack /> Explorar</Link>

        <div className="detail-head fade-up">
          <div className="row">
            <span className="tag tag-gold">{p.subtipo}</span>
            <FuenteTag fuente={p.fuente} confianza={p.confianza} />
            <span className="tag">Actualizado {p.actualizado}</span>
          </div>
          <h1>{p.nombre}</h1>
          {p.tagline ? <p className="gold" style={{ fontWeight: 700, fontSize: 'var(--fs-lg)' }}>{p.tagline}</p> : null}
          <p className="muted" style={{ maxWidth: '68ch' }}>{p.descripcion}</p>
          {p.otc ? (
            <div className="row" aria-label="Modalidades">
              <span className="chip on-soft" style={{ pointerEvents: 'none' }}>{p.plan ? 'Billetera / plan de arbitraje' : 'Billetera'}</span>
              <span className="chip on-soft" style={{ pointerEvents: 'none' }}>Mesa OTC · mínimo {fmtMonto(p.otc.capitalMinimo)}</span>
              <span className="faint" style={{ fontSize: 'var(--fs-xs)' }}>Una misma cuenta, dos modalidades.</span>
            </div>
          ) : null}
          <div className="row">
            <CryptoTag v={p.cryptoFriendly} />
            <RiesgoTag r={p.riesgoBloqueo} />
            {p.liquidez ? <span className="tag">Liquidez <Liquidez n={p.liquidez} /></span> : null}
            {p.usoPersonal ? <span className="tag tag-stop">Uso personal</span> : null}
            <button type="button" className={`cmp-toggle ${on ? 'on' : ''}`} onClick={() => toggleCompare(p.id)} aria-pressed={on}>
              {on ? <IconCheck /> : <IconPlus />} {on ? 'En comparador' : 'Agregar a comparar'}
            </button>
          </div>
          {hermanos.length ? (
            <p className="faint" style={{ fontSize: 'var(--fs-sm)' }}>
              También de {p.nombre.replace(' OTC', '')}: {hermanos.map((h, i) => <span key={h.id}>{i ? ' · ' : ''}<Link to={`/plataforma/${h.id}`}>{h.subtipo}</Link></span>)}
            </p>
          ) : null}
        </div>

        <div className="detail-grid">
          <div>
            <Sec titulo="Límites">
              {limitesTexto(p).length ? <ul>{limitesTexto(p).map((t) => <li key={t} className="mono" style={{ color: 'var(--cream)' }}>{t}</li>)}</ul> : <p className="muted">Sin límite publicado en el Radar.</p>}
              {p.limites ? <div className="row"><FuenteTag fuente={p.limites.fuente} confianza={p.limites.confianza} /></div> : null}
            </Sec>

            {p.otc ? (
              <Sec titulo="Como mesa OTC">
                <p className="mono gold" style={{ fontSize: 'var(--fs-xl)' }}>Mínimo {fmtMonto(p.otc.capitalMinimo)}</p>
                {p.otc.descripcion ? <p className="muted">{p.otc.descripcion}</p> : null}
                {p.otc.cuandoUsar?.length ? <ul>{p.otc.cuandoUsar.map((t) => <li key={t}>{t}</li>)}</ul> : null}
                {p.otc.documentacion?.sirve?.length ? <p className="muted">Sirve presentar: {p.otc.documentacion.sirve.join(', ')}.</p> : null}
                {p.otc.notasAcademia?.length ? <ul>{p.otc.notasAcademia.map((n) => <li key={n.texto}>{n.texto} {n.confianza === 'pendiente' ? <span className="tag tag-pend" style={{ marginLeft: 4 }}>A confirmar</span> : null}</li>)}</ul> : null}
                {p.otc.pendientes?.length ? <ul>{p.otc.pendientes.map((t) => <li key={t} style={{ color: 'var(--warn)' }}>{t}</li>)}</ul> : null}
                <div className="row"><FuenteTag fuente={p.otc.capitalMinimo.fuente} confianza={p.otc.capitalMinimo.confianza} /></div>
              </Sec>
            ) : null}

            {p.capitalMinimo ? (
              <Sec titulo={p.plan ? 'Capital mínimo del plan' : 'Capital / monto mínimo'}>
                <p className="mono gold" style={{ fontSize: 'var(--fs-xl)' }}>{fmtMonto(p.capitalMinimo)}</p>
                {p.capitalMinimo.nota ? <p className="muted">{p.capitalMinimo.nota}</p> : null}
                <div className="row"><FuenteTag fuente={p.capitalMinimo.fuente} confianza={p.capitalMinimo.confianza} /></div>
              </Sec>
            ) : null}

            {p.comision ? (
              <Sec titulo="Comisiones">
                {p.comision.detalle ? (
                  <div className="kv">{p.comision.detalle.map((d) => <span key={d.nivel} style={{ display: 'contents' }}><span className="k">{d.nivel}</span><span className="v gold">{d.valor}</span></span>)}</div>
                ) : <p className="mono" style={{ color: 'var(--cream)' }}>{p.comision.resumen}</p>}
                <div className="row"><FuenteTag fuente={p.comision.fuente} confianza={p.comision.confianza} /></div>
              </Sec>
            ) : null}

            {p.plan ? (
              <Sec titulo={p.plan.requerido ? 'Plan requerido' : 'Plan'}>
                <p style={{ fontWeight: 700 }}>{p.plan.nombre}</p>
                {p.plan.niveles ? (
                  <div className="kv">
                    {p.plan.niveles.map((n) => (
                      <span key={n.nombre} style={{ display: 'contents' }}>
                        <span className="k">{n.nombre} · {n.limite}{n.nota ? <><br /><small className="faint">{n.nota}</small></> : null}</span>
                        <span className="v gold">{n.costo}</span>
                      </span>
                    ))}
                  </div>
                ) : null}
                {p.plan.comoSeAccede ? <p className="muted">{p.plan.comoSeAccede}</p> : null}
                <div className="row"><FuenteTag fuente={p.plan.fuente} confianza={p.plan.confianza} /></div>
              </Sec>
            ) : null}

            <Sec titulo="Ampliación de límites">
              <p className="muted">
                {p.ampliacion.posible === 'si' ? <><span className="tag tag-info">Posible</span> {p.ampliacion.como}</> : p.ampliacion.posible === 'no' ? 'No aplica: el acceso depende del capital mínimo, no de documentación.' : 'Sin información confirmada sobre ampliación.'}
              </p>
              <div className="row"><FuenteTag fuente={p.ampliacion.fuente} confianza={p.ampliacion.confianza} /></div>
            </Sec>

            {p.documentacion ? (
              <Sec titulo="Documentación">
                {p.documentacion.requerida?.length ? <><p style={{ fontWeight: 700, fontSize: 'var(--fs-sm)' }}>Requerida</p><ul>{p.documentacion.requerida.map((t) => <li key={t}>{t}</li>)}</ul></> : null}
                {p.documentacion.sirve?.length ? <><p style={{ fontWeight: 700, fontSize: 'var(--fs-sm)' }}>Sirve presentar</p><ul>{p.documentacion.sirve.map((t) => <li key={t}>{t}</li>)}</ul></> : null}
                {p.documentacion.nota ? <p className="muted">{p.documentacion.nota}</p> : null}
                <div className="row"><FuenteTag fuente={p.documentacion.fuente} confianza={p.documentacion.confianza} /></div>
              </Sec>
            ) : null}

            {p.recomendacion ? <Sec titulo="Recomendación del Radar"><p style={{ color: 'var(--cream)' }}>{p.recomendacion}</p></Sec> : null}
            {p.ventajas?.length ? <Sec titulo="Ventajas"><ul>{p.ventajas.map((t) => <li key={t}>{t}</li>)}</ul></Sec> : null}
            {p.inconvenientes?.length ? <Sec titulo="Inconvenientes / limitaciones"><ul>{p.inconvenientes.map((t) => <li key={t}>{t}</li>)}</ul></Sec> : null}
            {p.cuandoUsar?.length ? <Sec titulo="Cuándo usarla"><ul>{p.cuandoUsar.map((t) => <li key={t}>{t}</li>)}</ul></Sec> : null}
            {p.cuandoEvitar?.length ? <Sec titulo="Cuándo no priorizarla"><ul>{p.cuandoEvitar.map((t) => <li key={t}>{t}</li>)}</ul></Sec> : null}
            {p.etapas.length ? <Sec titulo="Etapa sugerida"><div className="row">{p.etapas.map((e) => <span key={e} className="chip on-soft" style={{ pointerEvents: 'none' }}>{ETAPAS[e].corto}</span>)}</div></Sec> : null}

            {p.notasAcademia?.length ? (
              <Sec titulo="Criterio de la Academia">
                <ul>{p.notasAcademia.map((n) => <li key={n.texto}>{n.texto} {n.confianza === 'pendiente' ? <span className="tag tag-pend" style={{ marginLeft: 4 }}>A confirmar</span> : null}</li>)}</ul>
              </Sec>
            ) : null}

            {p.pendientes?.length ? (
              <Sec titulo="Datos pendientes de confirmar">
                <ul>{p.pendientes.map((t) => <li key={t} style={{ color: 'var(--warn)' }}>{t}</li>)}</ul>
              </Sec>
            ) : null}
          </div>

          <aside className="fit-panel">
            <div className={`card ${reco ? 'card-gold' : ''} stack`}>
              <div className="eyebrow">¿Es buena para mi perfil?</div>
              {reco ? (
                <>
                  <div className="row"><BucketTag b={reco.bucket} /><FitTag f={reco.fit} /></div>
                  <ul className="reco-list">
                    {reco.razones.map((t, i) => <li key={`r${i}`}>{t}</li>)}
                    {reco.acciones.map((t, i) => <li key={`a${i}`} className="accion">{t}</li>)}
                    {reco.alertas.map((t, i) => <li key={`w${i}`} className="alerta">{t}</li>)}
                  </ul>
                  <Link to="/mapa" className="btn btn-ghost btn-sm">Ver mi mapa completo</Link>
                </>
              ) : (
                <>
                  <p className="muted" style={{ fontSize: 'var(--fs-sm)' }}>Completá el diagnóstico y el Radar te dice si esta plataforma tiene sentido para tu etapa, capital y documentación.</p>
                  <Link to="/diagnostico" className="btn btn-gold btn-sm">Analizar mi situación</Link>
                </>
              )}
            </div>
            <div className="card card-flat stack" style={{ marginTop: 12, gap: 6 }}>
              <span className="faint" style={{ fontSize: 'var(--fs-xs)', fontFamily: 'var(--font-mono)' }}>{CATEGORIAS[p.categoria].nombre} · orden {p.orden} en el Radar</span>
              <span className="faint" style={{ fontSize: 'var(--fs-xs)' }}>Los datos cambian: verificá en la plataforma antes de operar montos grandes.</span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Sec({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="detail-sec">
      <h3>{titulo}</h3>
      {children}
    </section>
  );
}
