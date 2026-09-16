import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { OtcLadder } from '../components/OtcLadder';
import { fmtNumero, parseNumero } from '../engine/format';

const STEPS = [0, 1000, 2500, 5000, 7500, 10000, 12500, 15000, 20000, 25000, 30000, 40000, 50000, 75000, 100000, 150000, 200000, 250000];
const nearest = (v: number) => { let b = 0; STEPS.forEach((s, i) => { if (Math.abs(s - v) < Math.abs(STEPS[b] - v)) b = i; }); return b; };

export function Otc() {
  const { profile, setProfile } = useProfile();
  const [capital, setCapital] = useState(profile.capitalUsd);
  const idx = nearest(capital);
  const pct = (idx / (STEPS.length - 1)) * 100;
  return (
    <div className="page">
      <div className="container">
        <div className="section-head">
          <div className="eyebrow">Mesas OTC</div>
          <h1 style={{ textTransform: 'uppercase' }}>Capital → mesas habilitadas</h1>
          <p>Movés el capital y ves qué mesas se abren, cuál es la próxima y cuánto te falta. Los mínimos son los del Radar (septiembre 2026).</p>
        </div>

        <div className="card stack" style={{ marginTop: 16 }}>
          <div className="q-label">Simulá con este capital</div>
          <input type="range" className="slider" min={0} max={STEPS.length - 1} step={1} value={idx} style={{ ['--pct' as string]: `${pct}%` }} onChange={(e) => setCapital(STEPS[parseInt(e.target.value, 10)])} aria-label="Capital en USD" />
          <div className="row between">
            <div className="input" style={{ maxWidth: 220 }}>
              <span className="pre">USD</span>
              <input inputMode="numeric" value={fmtNumero(capital)} onChange={(e) => setCapital(parseNumero(e.target.value))} aria-label="Capital exacto" />
            </div>
            {profile.completado && capital !== profile.capitalUsd ? (
              <button type="button" className="btn btn-soft btn-sm" onClick={() => setProfile((p) => ({ ...p, capitalUsd: capital }))}>Guardar en mi perfil</button>
            ) : null}
          </div>
        </div>

        <div className="card card-gold" style={{ marginTop: 16 }}>
          <OtcLadder capitalUsd={capital} usdArs={profile.usdArs} />
        </div>

        {!profile.completado ? (
          <div className="resume" style={{ marginTop: 20 }}>
            <p>Con el diagnóstico completo, el Radar cruza esto con tu etapa, tus clientes y tu documentación.</p>
            <Link to="/diagnostico" className="btn btn-gold btn-sm">Analizar mi situación</Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
