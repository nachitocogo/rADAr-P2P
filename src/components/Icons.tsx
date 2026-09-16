const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

export const IconHome = () => (
  <svg viewBox="0 0 24 24" {...base}><path d="M3 11.5 12 4l9 7.5" /><path d="M5 10v10h14V10" /></svg>
);
export const IconRadar = () => (
  <svg viewBox="0 0 24 24" {...base}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4.5" /><path d="M12 12 19 6" /><circle cx="12" cy="12" r="1" fill="currentColor" /></svg>
);
export const IconGrid = () => (
  <svg viewBox="0 0 24 24" {...base}><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" /></svg>
);
export const IconCompare = () => (
  <svg viewBox="0 0 24 24" {...base}><path d="M9 4v16M15 4v16" /><path d="M4 8h5M4 16h5M15 8h5M15 16h5" /></svg>
);
export const IconSearch = () => (
  <svg viewBox="0 0 24 24" {...base}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></svg>
);
export const IconInfo = () => (
  <svg viewBox="0 0 24 24" {...base}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>
);
export const IconArrow = () => (
  <svg viewBox="0 0 24 24" {...base} width="18" height="18"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
export const IconBack = () => (
  <svg viewBox="0 0 24 24" {...base} width="18" height="18"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
);
export const IconCheck = () => (
  <svg viewBox="0 0 24 24" {...base} width="16" height="16"><path d="m5 12 4 4L19 6" /></svg>
);
export const IconPlus = () => (
  <svg viewBox="0 0 24 24" {...base} width="14" height="14"><path d="M12 5v14M5 12h14" /></svg>
);

/** Marca: radar dorado. */
export const BrandMark = ({ size = 30 }: { size?: number }) => (
  <svg className="brand-mark" width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
    <circle cx="16" cy="16" r="15" fill="#080705" stroke="#c9a227" strokeWidth="1.5" />
    <circle cx="16" cy="16" r="9" fill="none" stroke="#c9a227" strokeWidth="1" opacity="0.7" />
    <circle cx="16" cy="16" r="4" fill="none" stroke="#c9a227" strokeWidth="1" opacity="0.7" />
    <path d="M16 16 L27 7" stroke="#ebcb6a" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="16" cy="16" r="2" fill="#ebcb6a" />
    <circle cx="22" cy="20" r="1.4" fill="#ebcb6a" />
  </svg>
);
