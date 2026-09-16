/** Radar decorativo del home: anillos + barrido + tres "blips" (exchanges, OTC, billeteras). */
export function RadarGraphic() {
  return (
    <div className="radar" aria-hidden="true">
      <svg viewBox="0 0 400 400">
        <defs>
          <radialGradient id="sweepGrad" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(200 200) scale(190)">
            <stop offset="0" stopColor="#ebcb6a" stopOpacity="0.45" />
            <stop offset="1" stopColor="#ebcb6a" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ebcb6a" />
            <stop offset="1" stopColor="#7a5f1a" />
          </linearGradient>
        </defs>
        <circle cx="200" cy="200" r="190" fill="#0f0d0a" stroke="url(#ringGrad)" strokeWidth="1.5" />
        {[150, 110, 70, 30].map((r) => <circle key={r} cx="200" cy="200" r={r} fill="none" stroke="#c9a227" strokeOpacity={0.28} strokeWidth="1" />)}
        <path d="M200 10 V390 M10 200 H390" stroke="#c9a227" strokeOpacity="0.18" strokeWidth="1" />
        <path d="M66 66 L334 334 M334 66 L66 334" stroke="#c9a227" strokeOpacity="0.1" strokeWidth="1" />
        <g className="sweep">
          <path d="M200 200 L200 10 A190 190 0 0 1 335 65 Z" fill="url(#sweepGrad)" />
          <path d="M200 200 L200 10" stroke="#ebcb6a" strokeWidth="2" strokeLinecap="round" />
        </g>
        <g fill="#ebcb6a">
          <circle className="blip" cx="268" cy="132" r="5" />
          <circle className="blip" cx="140" cy="250" r="4" />
          <circle className="blip" cx="250" cy="290" r="3.5" />
        </g>
        <circle cx="200" cy="200" r="5" fill="#ebcb6a" />
        <g fontFamily="IBM Plex Mono, monospace" fontSize="10" fill="#c9a227" opacity="0.8" letterSpacing="1.5">
          <text x="278" y="124">EXCHANGES</text>
          <text x="92" y="270">OTC</text>
          <text x="258" y="306">BILLETERAS</text>
        </g>
      </svg>
    </div>
  );
}
