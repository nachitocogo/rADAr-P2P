/**
 * Metadatos del recurso. Se muestran en la interfaz.
 */
export const META = {
  /** Nombre visible de la herramienta. "ADA" (Academia De Arbitraje) va destacado dentro de rADAr. */
  nombre: 'rADAr-P2P',
  organizacion: 'Academia de Arbitraje',
  /** Última revisión general del recurso (texto que ve el alumno). */
  ultimaRevision: 'Septiembre 2026',
  ultimaRevisionISO: '2026-09',
  /** Vigencia recomendada de una certificación contable para presentarla (meses). */
  certiVigenciaMeses: 3,
  /**
   * Cotización USDT/ARS de referencia para convertir capital y volumen.
   * El alumno la puede ajustar en el diagnóstico; esto es solo el valor inicial.
   */
  usdArsReferencia: 1500,
  /** Días operativos por mes para pasar volumen mensual → diario. */
  diasOperativosMes: 22,
  /** Bandas de volumen mensual (USD) de la metodología ADA §5.3. */
  bandasVolumenUsd: { arranque: 20_000, medio: 80_000, copterPrimaria: 100_000 },
  /** Cantidad de pasarelas free que la Academia recomienda tener activas en simultáneo. */
  rotacionPasarelas: { min: 3, max: 4 },
} as const;
