import { proximosPasos } from '../engine/nextSteps';
import type { Profile } from '../engine/profile';

export function NextSteps({ profile }: { profile: Profile }) {
  const pasos = proximosPasos(profile);
  return (
    <div className="steps">
      {pasos.map((p) => (
        <div key={p.titulo} className="step">
          <h3>{p.titulo}</h3>
          <p>{p.detalle}</p>
        </div>
      ))}
    </div>
  );
}
