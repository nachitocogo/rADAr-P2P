import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { ETAPAS, CATEGORIAS, type Etapa, type Categoria } from '../data/types';
import { BINANCE_ESTADOS, INSIGNIAS, type BinanceEstado, type Insignia } from '../data/binanceVerified';
import { DOCUMENTOS, type DocId } from '../data/documentacion';
import { EMPRESAS } from '../data/platforms';
import { INFRA_ESTADOS, type InfraEstado, PROFILE_EJEMPLO, vigenciaCerti } from '../engine/profile';
import { fmtArs, fmtNumero, parseNumero } from '../engine/format';
import { IconArrow, IconBack, IconInfo } from '../components/Icons';
import { META } from '../data/meta';

const CAPITAL_STEPS = [0, 250, 500, 750, 1000, 1500, 2000, 2500, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 12500, 15000, 17500, 20000, 25000, 30000, 40000, 50000, 75000, 100000, 150000, 200000];
const VOLUMEN_STEPS = [0, 1000, 2500, 5000, 7500, 10000, 15000, 20000, 25000, 30000, 40000, 50000, 60000, 80000, 100000, 150000, 200000, 300000, 500000];

const nearestIdx = (steps: number[], v: number) => {
  let best = 0;
  for (let i = 0; i < steps.length; i++) if (Math.abs(steps[i] - v) < Math.abs(steps[best] - v)) best = i;
  return best;
};

const PASOS = ['Etapa', 'Capital', 'Documentación', 'Cuentas'];

export function Diagnostico() {
  const { profile, setProfile } = useProfile();
  const nav = useNavigate();
  const [step, setStep] = useState(0);

  const up = (patch: Partial<typeof profile>) => setProfile((p) => ({ ...p, ...patch }));

  const puedeSeguir = step === 0 ? profile.etapa !== null && profile.binance !== null : true;

  const finalizar = () => {
    setProfile((p) => ({ ...p, completado: true, actualizado: new Date().toISOString().slice(0, 10) }));
    nav('/mapa');
  };

  return (
    <div className="page">
      <div className="container wizard">
        <div className="row between" style={{ marginBottom: 10 }}>
          <span className="eyebrow">Diagnóstico · paso {step + 1} de {PASOS.length}</span>
          {!profile.completado && step === 0 ? (
            <button type="button" className="btn btn-soft btn-sm" onClick={() => { setProfile(() => ({ ...PROFILE_EJEMPLO })); nav('/mapa'); }}>
              Ver un ejemplo cargado
            </button>
          ) : null}
        </div>
        <div className="progress" aria-hidden="true">
          {PASOS.map((p, i) => <i key={p} className={i < step ? 'done' : i === step ? 'cur' : ''} />)}
        </div>

        {step === 0 && (
          <section className="fade-up">
            <h1 className="step-title">¿En qué etapa estás?</h1>
            <p className="step-sub">La recomendación depende más de tu etapa que del límite de cada plataforma.</p>

            <div className="opt-grid" role="radiogroup" aria-label="Etapa">
              {(Object.keys(ETAPAS) as Etapa[]).map((e) => (
                <button key={e} type="button" role="radio" aria-checked={profile.etapa === e} className={`opt ${profile.etapa === e ? 'on' : ''}`} onClick={() => up({ etapa: e })}>
                  <span className="opt-title"><span className="chk" />{ETAPAS[e].nombre}</span>
                  <span className="opt-desc">{ETAPAS[e].descripcion}</span>
                </button>
              ))}
            </div>

            <div className="q">
              <div className="q-label">¿Cómo venís con el verificado de Binance?</div>
              <div className="q-help">Es el hito que más cambia tu estrategia de cuentas.</div>
              <div className="opt-grid" role="radiogroup" aria-label="Estado en Binance">
                {(Object.keys(BINANCE_ESTADOS) as BinanceEstado[]).map((b) => (
                  <button key={b} type="button" role="radio" aria-checked={profile.binance === b} className={`opt ${profile.binance === b ? 'on' : ''}`} onClick={() => up({ binance: b, insignia: b === 'verificado' ? profile.insignia ?? 'bronce' : null })}>
                    <span className="opt-title"><span className="chk" />{BINANCE_ESTADOS[b].nombre}</span>
                    <span className="opt-desc">{BINANCE_ESTADOS[b].descripcion}</span>
                  </button>
                ))}
              </div>
            </div>

            {profile.binance === 'verificado' ? (
              <div className="q">
                <div className="q-label">¿Qué insignia tenés?</div>
                <div className="chips">
                  {(Object.keys(INSIGNIAS) as Insignia[]).map((k) => (
                    <button key={k} type="button" className={`chip ${profile.insignia === k ? 'on' : ''}`} onClick={() => up({ insignia: k })}>{INSIGNIAS[k].nombre} · {INSIGNIAS[k].comision}</button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="q">
              <div className="q-label">¿Tenés clientes que te pasan volumen?</div>
              <div className="chips">
                <button type="button" className={`chip ${!profile.clientes ? 'on' : ''}`} onClick={() => up({ clientes: false })}>Todavía no</button>
                <button type="button" className={`chip ${profile.clientes ? 'on' : ''}`} onClick={() => up({ clientes: true })}>Sí, uno o más recurrentes</button>
              </div>
            </div>
          </section>
        )}

        {step === 1 && (
          <section className="fade-up">
            <h1 className="step-title">Capital y volumen</h1>
            <p className="step-sub">Con esto cruzamos mínimos de OTC, planes y capacidad de cada pasarela.</p>

            <SliderField
              label="¿Con cuánto capital operás?"
              help="Capital propio disponible para rotar. El mínimo de las mesas OTC es por operación."
              steps={CAPITAL_STEPS}
              value={profile.capitalUsd}
              onChange={(v) => up({ capitalUsd: v })}
              pre="USD"
              suf={`≈ ${fmtArs(profile.capitalUsd * profile.usdArs)}`}
            />

            <SliderField
              label="¿Cuánto volumen movés (o pretendés mover) por mes?"
              help={`Suma de compras y ventas. Por día serían ≈ ${fmtArs((profile.volumenMensualUsd * profile.usdArs) / META.diasOperativosMes)}.`}
              steps={VOLUMEN_STEPS}
              value={profile.volumenMensualUsd}
              onChange={(v) => up({ volumenMensualUsd: v })}
              pre="USD"
              suf="por mes"
            />

            <div className="q">
              <div className="q-label">Cotización USDT de referencia</div>
              <div className="q-help">Solo para convertir tus números a pesos. Ajustala al precio de hoy.</div>
              <div className="input" style={{ maxWidth: 240 }}>
                <span className="pre">$</span>
                <input inputMode="numeric" value={fmtNumero(profile.usdArs)} onChange={(e) => up({ usdArs: Math.max(1, parseNumero(e.target.value)) })} aria-label="Cotización USDT en pesos" />
                <span className="suf">ARS / USDT</span>
              </div>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="fade-up">
            <h1 className="step-title">¿Qué documentación tenés?</h1>
            <p className="step-sub">No hace falta subir nada: marcá qué respaldo tenés disponible. Con eso vemos dónde presentar y qué te habilita.</p>

            <div className="opt-grid">
              {DOCUMENTOS.map((d) => {
                const on = profile.docs.includes(d.id);
                return (
                  <button key={d.id} type="button" role="checkbox" aria-checked={on} className={`opt square ${on ? 'on' : ''}`} onClick={() => up({ docs: on ? profile.docs.filter((x) => x !== d.id) : [...profile.docs, d.id as DocId] })}>
                    <span className="opt-title"><span className="chk" />{d.nombre}</span>
                    <span className="opt-desc">{d.descripcion}</span>
                  </button>
                );
              })}
            </div>

            {profile.docs.includes('certi') ? (
              <div className="q">
                <div className="q-label">Monto respaldado por tu certificación</div>
                <div className="q-help">Lo que el contador certificó. Sirve para compararlo con tu volumen y con los límites conocidos.</div>
                <div className="input" style={{ maxWidth: 320 }}>
                  <span className="pre">$</span>
                  <input inputMode="numeric" placeholder="25.000.000" value={profile.certiMontoArs ? fmtNumero(profile.certiMontoArs) : ''} onChange={(e) => up({ certiMontoArs: parseNumero(e.target.value) || null })} aria-label="Monto certificado en pesos" />
                  <span className="suf">ARS</span>
                </div>
                {profile.certiMontoArs ? <p className="faint" style={{ marginTop: 6, fontSize: 'var(--fs-sm)' }}>≈ {fmtArs(profile.certiMontoArs)} · {fmtNumero(profile.certiMontoArs / profile.usdArs)} USD a la cotización de referencia</p> : null}

                <div className="q-label" style={{ marginTop: 18 }}>¿De qué mes es la certificación? <span className="faint" style={{ fontWeight: 400 }}>(opcional)</span></div>
                <div className="input" style={{ maxWidth: 220 }}>
                  <input type="month" value={profile.certiEmision ?? ''} max={new Date().toISOString().slice(0, 7)} onChange={(e) => up({ certiEmision: e.target.value || null })} aria-label="Mes de emisión de la certificación" style={{ fontSize: '1rem' }} />
                </div>
                <CertiAviso emision={profile.certiEmision} />
              </div>
            ) : null}
          </section>
        )}

        {step === 3 && (
          <section className="fade-up">
            <h1 className="step-title">¿Qué cuentas tenés hoy?</h1>
            <p className="step-sub">Marcá las que ya abriste, las que usás activamente y las que están bloqueadas. Lo que no marques cuenta como "no tengo".</p>
            <InfraStep infra={profile.infra} onChange={(infra) => up({ infra })} />
          </section>
        )}

        <div className="wiz-nav">
          {step > 0 ? <button type="button" className="btn btn-soft" onClick={() => setStep(step - 1)}><IconBack /> Atrás</button> : <span />}
          {step < PASOS.length - 1 ? (
            <button type="button" className="btn btn-gold" disabled={!puedeSeguir} onClick={() => setStep(step + 1)}>Siguiente <IconArrow /></button>
          ) : (
            <button type="button" className="btn btn-gold" onClick={finalizar}>Ver mi mapa operativo <IconArrow /></button>
          )}
        </div>
      </div>
    </div>
  );
}

function CertiAviso({ emision }: { emision: string | null }) {
  const v = vigenciaCerti(emision);
  const meses = META.certiVigenciaMeses;
  const texto =
    v === 'vencida' ? `Tu certificación ya tiene más de ${meses} meses. Antes de presentarla en cualquier plataforma, actualizala con el contador.`
    : v === 'por_vencer' ? `Tu certificación está por cumplir ${meses} meses. Si la vas a presentar en varias plataformas, evaluá renovarla primero.`
    : `Tené en cuenta que para presentar una certificación contable conviene que tenga una antigüedad máxima de ${meses} meses. Si está próxima a vencer, evaluá actualizarla antes de enviarla a distintas plataformas.`;
  return (
    <div className={`notice ${v === 'vencida' ? 'notice-warn' : 'notice-gold'}`} style={{ marginTop: 12 }}>
      <IconInfo />
      <span>{texto}</span>
    </div>
  );
}

function SliderField({ label, help, steps, value, onChange, pre, suf }: { label: string; help: string; steps: number[]; value: number; onChange: (v: number) => void; pre: string; suf: string }) {
  const idx = nearestIdx(steps, value);
  const pct = (idx / (steps.length - 1)) * 100;
  return (
    <div className="q">
      <div className="q-label">{label}</div>
      <div className="q-help">{help}</div>
      <div className="big-value">{pre} {fmtNumero(value)}<small>{suf}</small></div>
      <input
        type="range"
        className="slider"
        min={0}
        max={steps.length - 1}
        step={1}
        value={idx}
        style={{ ['--pct' as string]: `${pct}%` }}
        onChange={(e) => onChange(steps[parseInt(e.target.value, 10)])}
        aria-label={label}
      />
      <div className="slider-scale"><span>{pre} 0</span><span>{pre} {fmtNumero(steps[Math.floor(steps.length / 2)])}</span><span>{pre} {fmtNumero(steps[steps.length - 1])}+</span></div>
      <div className="input" style={{ maxWidth: 240, marginTop: 10 }}>
        <span className="pre">{pre}</span>
        <input inputMode="numeric" value={fmtNumero(value)} onChange={(e) => onChange(parseNumero(e.target.value))} aria-label={`${label} (valor exacto)`} />
      </div>
    </div>
  );
}

function InfraStep({ infra, onChange }: { infra: Record<string, InfraEstado>; onChange: (v: Record<string, InfraEstado>) => void }) {
  const grupos = useMemo(() => {
    const orden: Categoria[] = ['exchange', 'billetera', 'billetera_arbitraje', 'otc', 'banco'];
    return orden.map((cat) => ({ cat, empresas: EMPRESAS.filter((e) => e.categorias[0] === cat) })).filter((g) => g.empresas.length);
  }, []);
  const set = (id: string, v: InfraEstado) => onChange({ ...infra, [id]: v });
  const marcadas = Object.values(infra).filter((v) => v !== 'no').length;
  return (
    <div className="stack">
      <p className="faint" style={{ fontSize: 'var(--fs-sm)' }}>{marcadas} cuentas marcadas.</p>
      {grupos.map((g, gi) => (
        <details key={g.cat} className="details" open={gi < 2}>
          <summary>{CATEGORIAS[g.cat].plural} <span className="faint mono" style={{ fontSize: 'var(--fs-xs)' }}>{g.empresas.filter((e) => (infra[e.id] ?? 'no') !== 'no').length}/{g.empresas.length}</span></summary>
          <div className="details-body">
            {g.empresas.map((e) => {
              const v = infra[e.id] ?? 'no';
              return (
                <div key={e.id} className="infra-row">
                  <div>
                    <div className="infra-name">{e.nombre}</div>
                    {e.categorias.length > 1 ? <div className="infra-cat">{e.categorias.map((c) => CATEGORIAS[c].corto).join(' + ')}</div> : null}
                  </div>
                  <div className="seg" role="radiogroup" aria-label={`Estado de ${e.nombre}`}>
                    {(Object.keys(INFRA_ESTADOS) as InfraEstado[]).map((k) => (
                      <button key={k} type="button" role="radio" aria-checked={v === k} className={`${v === k ? 'on' : ''} ${k === 'bloqueada' ? 'bloq' : k}`} onClick={() => set(e.id, k)}>{INFRA_ESTADOS[k].corto}</button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </details>
      ))}
    </div>
  );
}
