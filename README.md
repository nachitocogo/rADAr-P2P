# rADAr-P2P — app web (Academia de Arbitraje)

Radar + diagnóstico + recomendador operativo de plataformas para alumnos de la Academia.
Convierte el recurso estático **Radar P2P** (PDF, última revisión septiembre 2026) en una
herramienta que responde: *"Con mi situación actual, ¿qué plataformas tiene sentido que use y para qué?"*

El nombre visible es **rADAr-P2P**: "ADA" (Academia De Arbitraje) va destacado en dorado dentro de
"rADAr". Es una decisión de marca deliberada (componente `src/components/Brand.tsx`). El nombre
técnico (repo, paquete, subdominio) es `radar-p2p`.

- **Web:** https://radar-p2p.netlify.app _(deploy automático desde `main`)_
- **Repositorio:** https://github.com/nachitocogo/rADAr-P2P
- **Fuente original:** [`fuentes/Radar-P2P_2.pdf`](fuentes/Radar-P2P_2.pdf)
- **Análisis de fuentes y pendientes de confirmar:** [`docs/ANALISIS-FUENTES.md`](docs/ANALISIS-FUENTES.md)
- **Lógica del recomendador:** [`docs/LOGICA-RECOMENDADOR.md`](docs/LOGICA-RECOMENDADOR.md)

## Qué hace

| Sección | Ruta | Qué resuelve |
|---|---|---|
| Inicio | `#/` | Intro, CTA "Analizar mi situación", conteo por categoría, última revisión |
| Diagnóstico | `#/diagnostico` | 4 pasos mobile-first: etapa + estado en Binance + clientes · capital y volumen · documentación (con monto certificado) · cuentas que ya tiene |
| Mi mapa | `#/mapa` | Buckets **Usar ahora / Preparar / Reservar / Secundario / No priorizar** con el porqué, acciones y alertas por plataforma. Tabs: OTC, Documentación, Binance Verified, Próximos pasos |
| Explorar | `#/explorar` | Buscador + filtros (categoría, crypto-friendly, alto/bajo volumen, amplía límites, plan/documentación, capital mínimo, pendientes) |
| Ficha | `#/plataforma/:id` | Límites, comisiones, plan, ampliación, documentación, ventajas, cuándo usar/evitar, criterio de la Academia, pendientes, fuente y fecha. Panel "¿Es buena para mi perfil?". Las plataformas con mesa OTC además de billetera (Belo, Let's Bit, Fiwind) muestran las dos modalidades en la misma ficha |
| Comparar | `#/comparar` | Hasta 4 plataformas lado a lado (con atajos: Bitso vs Nexo vs MP, etc.) |
| OTC | `#/otc` | Altímetro: capital → mesas habilitadas / próxima / cuánto falta |

`#/mapa?ejemplo=1` carga un perfil de muestra si todavía no hay diagnóstico (útil para demos).

El perfil se guarda en `localStorage` del navegador (sin cuentas ni base de datos en V1).

## Correr local

```bash
cd projects/academia-arbitraje/radar-p2p
npm install
npm run dev          # http://localhost:5173
```

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | servidor de desarrollo |
| `npm run build` | type-check + build a `dist/` (para Netlify) |
| `npm run preview` | sirve `dist/` local |
| `npm run build:single` | build con todo inline → `dist/index.html` + `dist/radar-p2p-artifact.html` (un solo archivo para compartir/incrustar) |
| `npm run check:engine` | corre el motor sobre 4 perfiles tipo y muestra los buckets (sanity check al tocar reglas o datos) |

## Deploy

GitHub `nachitocogo/rADAr-P2P` (rama `main`) → Netlify site `radar-p2p` con deploy automático.
`netlify.toml` define el build (`npm run build`, publish `dist`). Cada push a `main` publica solo.
Usa `HashRouter`, así que no necesita redirects (el `public/_redirects` queda por si se cambia a rutas limpias).

Para integrarlo o enlazarlo desde la web centralizada de ADA: es un sitio estático (HTML + JS + CSS)
sin backend; se puede enlazar la URL, incrustarlo en un iframe o servir `dist/` desde cualquier host.

## Cómo actualizar datos (lo importante)

**Una sola fuente de verdad:** [`src/data/platforms.ts`](src/data/platforms.ts).
Cada plataforma es un objeto tipado (`src/data/types.ts`). Para cambiar un límite,
comisión, nota o recomendación:

1. Buscar la plataforma por `id` (ej. `'naranja-x'`).
2. Editar el campo. Cada dato lleva `fuente` (`'pdf' | 'academia' | 'sugerencia'`) y
   `confianza` (`'confirmado' | 'pendiente'`): al confirmar un dato pendiente, cambiar
   `confianza` a `'confirmado'` y borrar la línea de `pendientes`.
3. Actualizar `actualizado: 'YYYY-MM'` en esa plataforma.
4. Si cambia la revisión general del recurso: `src/data/meta.ts` → `ultimaRevision`.
5. `npm run check:engine` y listo. Ningún componente hardcodea datos.

Una plataforma que además tiene mesa OTC (Belo, Let's Bit, Fiwind) **es una sola entrada**: las
condiciones de la mesa van en su campo `otc` (mínimo, documentación, notas). Las mesas puras
(Ripio, Cocos, Decrypto) son entradas con `categoria: 'otc'`.

Otros archivos de datos:

- `src/data/meta.ts` — última revisión, cotización de referencia (1.500 ARS/USDT, editable por el alumno), bandas de volumen (20K / 80K / 100K USD/mes), rotación de pasarelas (3-4), vigencia recomendada de la certificación (3 meses).
- `src/data/binanceVerified.ts` — requisitos, ritmo, anti wash-trading y guía por estado del verificado.
- `src/data/documentacion.ts` — tipos de documentación que el alumno puede declarar.

Para ocultar una plataforma sin borrarla: `visible: false`.
Para cambiar cómo la trata el motor sin tocar código: cambiar su `rol`
(ver `docs/LOGICA-RECOMENDADOR.md`).

## Estructura

```
radar-p2p/
├── fuentes/Radar-P2P_2.pdf        ← recurso original
├── docs/                          ← análisis de fuentes + lógica
├── scripts/                       ← engine-check, make-artifact
├── src/
│   ├── data/                      ← platforms.ts (única fuente de verdad), meta, verified, documentación
│   ├── components/Brand.tsx       ← marca rADAr-P2P
│   ├── engine/                    ← profile (persistencia), recommend, otc, documentacion, nextSteps, format
│   ├── components/                ← Layout, cards, OtcLadder, DocPanel, VerifiedPanel, …
│   ├── pages/                     ← Home, Diagnostico, Mapa, Explorar, Plataforma, Comparar, Otc
│   └── styles/                    ← tokens (negro/oro/crema), global, components
├── index.html · vite.config.ts · netlify.toml
```

Stack: Vite 7 · React 19 · TypeScript · CSS propio (sin framework) · react-router (HashRouter).
Tipografías: Barlow Condensed (titulares) · Manrope (UI) · IBM Plex Mono (números).
