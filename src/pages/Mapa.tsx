import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { agrupar, BUCKETS, recommend, type Bucket } from '../engine/recommend';
import { derive, PROFILE_EJEMPLO } from '../engine/profile';
import { ETAPAS } from '../data/types';
import { BINANCE_ESTADOS } from '../data/binanceVerified';
import { fmtArs, fmtUsd } from '../engine/format';
import { RecoCard } from '../components/RecoCard';
import { OtcLadder } from '../components/OtcLadder';
import { DocPanel } from '../components/DocPanel';
import { VerifiedPanel } from '../components/VerifiedPanel';
import { NextSteps } from '../components/NextSteps';
import { META } from '../data/meta';

const TABS = [
  { id: 'mapa', label: 'Tu mapa' },
  { id: 'otc', label: 'OTC' },
  { id: 'docs', label: 'Documentación' },
  { id: 'verificado', label: 'Binance Verified' },
  { id: 'pasos', label: 'Próximos pasos' },
] as const;
type Tab = (typeof TABS)[number]['id'];

export function Mapa() {
  const { profile, setProfile } = useProfile();
  const [params] = useSearchParams();
  const [tab, setTab] = useState<Tab>('mapa');
  // `#/mapa?ejemplo=1` carga un perfil de muestra (solo si todavía no hay diagnóstico).
  const quiereEjemplo = params.has('ejemplo') && !profile.completado;
  useEffect(() => {
    if (quiereEjemplo) setProfile(() => ({ ...PROFILE_EJEMPLO }));
  }, [quiereEjemplo, setProfile]);
  const recos = useMemo(() => recommend(profile), [profile]);
  const grupos = useMemo(() => agrupar(recos), [recos]);
  const d = derive(profile);

  if (!profile.completado) return quiereEjemplo ? null : <Navigate to="/diagnostico" replace />;

  const ordenBuckets = (Object.keys(BUCKETS) as Bucket[]).sort((a, b) => BUCKETS[a].orden - BUCKETS[b].orden);
  const rotacion = grupos.usar_ahora.filter((r) => r.platform.rol === 'pasarela_rotacion').length;

  return (
    <div className="page">
      <div className="container">
        <div className="row between" style={{ alignItems: 'flex-end', marginBottom: 14 }}>
          <div>
            <div className="eyebrow">Tu mapa operativo</div>
            <h1 style={{ marginTop: 6, textTransform: 'uppercase' }}>Con tu situación, hoy</h1>
          </div>
          <Link to="/diagnostico" className="btn btn-soft btn-sm">Editar diagnóstico</Link>
        </div>

        <div className="profile-strip fade-up">
          <div><div className="k">Etapa</div><div className="v">{profile.etapa ? ETAPAS[profile.etapa].corto : '—'}</div></div>
          <div><div className="k">Binance</div><div className="v">{profile.binance ? BINANCE_ESTADOS[profile.binance].nombre : '—'}{profile.insignia ? ` · ${profile.insignia}` : ''}</div></div>
          <div><div className="k">Capital</div><div className="v mono">{fmtUsd(profile.capitalUsd)}</div></div>
          <div><div className="k">Volumen / mes</div><div className="v mono">{fmtUsd(profile.volumenMensualUsd)}</div></div>
          <div><div className="k">CERTI</div><div className="v mono">{d.tieneCerti ? (d.certiMontoArs ? fmtArs(d.certiMontoArs) : 'Sí') : 'No'}</div></div>
        </div>

        <div className="tabs" style={{ marginTop: 22 }} role="tablist">
          {TABS.map((t) => <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} className={tab === t.id ? 'on' : ''} onClick={() => setTab(t.id)}>{t.label}</button>)}
        </div>

        {tab === 'mapa' && (
          <div className="stack fade-up" style={{ gap: 16, marginTop: 18 }}>
            <p className="muted" style={{ maxWidth: '68ch' }}>
              {d.preVerificado
                ? 'Estás en modo construcción: cuentas para hacer volumen y llegar al verificado, preservando las mejores pasarelas para después.'
                : 'Estás verificado: el mapa pasa a cuentas principales para escalar volumen, con rotación de respaldo.'}
              {' '}Rotación recomendada por la Academia: {META.rotacionPasarelas.min}-{META.rotacionPasarelas.max} pasarelas free activas a la vez — tenés <b className="gold">{rotacion}</b> en "usar ahora".
            </p>
            {ordenBuckets.map((b) => (
              <section key={b} className={`bucket bucket-${b}`}>
                <div className="bucket-head">
                  <i className={`dot dot-${b}`} />
                  <h3>{BUCKETS[b].nombre}</h3>
                  <span className="count">{grupos[b].length}</span>
                </div>
                <p className="bucket-desc">{BUCKETS[b].descripcion}</p>
                {grupos[b].length ? (
                  <div className="bucket-body">
                    {grupos[b].map((r) => <RecoCard key={r.platform.id} r={r} compact={b === 'no_priorizar' || b === 'secundario'} />)}
                  </div>
                ) : <p className="bucket-empty">Nada por acá con tu perfil actual.</p>}
              </section>
            ))}
          </div>
        )}

        {tab === 'otc' && (
          <div className="fade-up" style={{ marginTop: 18 }}>
            <div className="section-head">
              <h2>Capital actual → mesas OTC</h2>
              <p>Los mínimos son del Radar. Con tu capital declarado ves cuáles se habilitan y cuánto falta para las próximas. <Link to="/otc">Simular con otro capital →</Link></p>
            </div>
            <div className="card card-gold"><OtcLadder capitalUsd={profile.capitalUsd} usdArs={profile.usdArs} /></div>
          </div>
        )}

        {tab === 'docs' && (
          <div className="fade-up" style={{ marginTop: 18 }}>
            <div className="section-head">
              <h2>Documentación y ampliaciones</h2>
              <p>Dónde tiene sentido presentar lo que tenés, qué habilitaría y qué requisito faltaría. Nunca es "te van a aumentar a X": la plataforma decide.</p>
            </div>
            <DocPanel profile={profile} />
          </div>
        )}

        {tab === 'verificado' && (
          <div className="fade-up" style={{ marginTop: 18 }}>
            <div className="section-head">
              <h2>Binance Verified</h2>
              <p>El punto de inflexión: antes se opera con fricción, después cambia la estrategia de cuentas. Referencias de la Academia, no promesas.</p>
            </div>
            <VerifiedPanel estado={profile.binance} insignia={profile.insignia} />
          </div>
        )}

        {tab === 'pasos' && (
          <div className="fade-up" style={{ marginTop: 18 }}>
            <div className="section-head">
              <h2>Tu próximo paso</h2>
              <p>Árbol de decisión de la Academia aplicado a tu perfil. Ejecutá el primero antes de pensar en el resto.</p>
            </div>
            <NextSteps profile={profile} />
          </div>
        )}
      </div>
    </div>
  );
}
