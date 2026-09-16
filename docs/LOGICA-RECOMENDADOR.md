# Lógica del recomendador

El motor (`src/engine/recommend.ts`) no mira nombres: mira el **rol** de cada plataforma
(`src/data/platforms.ts` → campo `rol`) y el perfil del alumno. Cambiar el rol de una
plataforma cambia cómo la trata el motor, sin tocar código.

## Perfil (lo que se pregunta)

| Campo | Pregunta | Uso |
|---|---|---|
| `etapa` | Recién arranco / construyendo / opero con criterio / escalando (fases ADA) | principiante frena exchanges oportunistas y bancos |
| `binance` | No empecé / construyendo / buscando verificado / presenté / rechazado / verificado (+ insignia) | `verificado` cambia la estrategia de cuentas; `rechazado` activa Bybit/OKX |
| `clientes` | ¿Tenés clientes que te pasan volumen? | habilita OTC y billeteras pro aunque el volumen propio sea medio |
| `capitalUsd` | Capital operativo | mínimos OTC, plan Belo, Fiwind |
| `volumenMensualUsd` | Volumen mensual | banda (arranque < 20K · medio 20-80K · alto > 80K), capacidad por pasarela, plan de Lemon |
| `usdArs` | Cotización de referencia | conversiones ARS ↔ USD |
| `docs` + `certiMontoArs` + `certiEmision` | Documentación disponible, monto certificado y mes de emisión | `tieneCerti` destraba Lemon/MP/bancos; monto vs volumen y vs límites; vigencia (3 meses) → avisos y paso "Renovar la certificación" |
| `infra` | Por empresa: no tengo / abierta / la uso / bloqueada | bloqueada → no priorizar + acción; activa → sube a usar ahora; abierta → falta activar |

Derivados: `banda`, `volumenDiarioArs` (mensual / 22), `necesidadPorPasarelaArs` (diario / 3).

## Reglas por rol

| Rol | Regla resumida |
|---|---|
| `exchange_principal` (Binance) | Siempre *usar ahora*; texto según estado del verificado. Rechazada/bloqueada → *preparar* (apelar). |
| `exchange_secundario` (Bybit, OKX) | Pre-verificado → *preparar* (abrir, no mover). Binance bloqueada → *usar ahora*. Verificado → Bybit *usar ahora*, OKX *secundario*. |
| `exchange_oportunista` (MEXC, Bitget, BingX, KuCoin) | *Secundario*; principiante → *no priorizar*; liquidez 1 → *no priorizar*. BingX pre-verificado con nota del caso documentado. |
| `otc` | Capital < mínimo → *no priorizar* con "te faltan USD X". Capital ≥ mínimo → *preparar* si escalado / banda alta / clientes; si no, *reservar*. Activa → *usar ahora*. Rango sin confirmar → se toma el tope. |
| `pasarela_rotacion` | Capacidad diaria (límite diario, o mensual/22, o movimiento×transferencias) vs necesidad por pasarela: holgada/justa → *usar ahora*; chica → *secundario* (arranque) o *no priorizar*; chica + amplía + CERTI → *preparar*. Pendientes de confirmar → máximo *secundario*. |
| `pasarela_premium` (Lemon) | Sin CERTI → *reservar* (motivo de preservación). CERTI + pre-verificado → *preparar* (pedir plan, de a poco). CERTI + verificado → *usar ahora*. Sugiere nivel del plan por volumen mensual. |
| `pasarela_vigilada` (Mercado Pago) | Sin CERTI → *reservar*. Con CERTI → *secundario* (de a poco, MP a MP ilimitado). |
| `billetera_pro` (Let's Bit plan, Copter, TelePagos) | Arranque → *reservar*. Medio o clientes → Let's Bit *preparar* (una pro de respaldo), resto *reservar*. Alto → Let's Bit y Copter *usar ahora*, resto *preparar*. |
| `billetera_plan` (Belo) | Capital < 10K → *no priorizar* con faltante. ≥ 10K → *preparar* (o *usar ahora* si activa). |
| `otc_wallet` (Fiwind) | Capital ≥ mínimo de su mesa (15K) y banda ≥ media → *preparar*; principiante → *no priorizar*; resto *reservar*. |
| `banco` | Sin CERTI o principiante → *reservar*. Con CERTI y volumen → *secundario* (tickets grandes), con recordatorio de cómo hablarle al banco. |
| `personal` (Cuenta DNI, Brubank) | *No priorizar*. |

### Modalidad OTC de la misma plataforma
Belo, Let's Bit y Fiwind son una sola entidad con campo `otc`. Después de la regla de su rol, el motor evalúa la mesa: capital < mínimo → agrega "te faltan USD X"; capital ≥ mínimo y (escalado / banda alta / clientes) → agrega la acción de pedir acceso y sube el bucket al menos a *preparar*; si no, aclara que la mesa rinde con ticket alto. La escalera OTC (`engine/otc.ts`, `MESAS_OTC`) incluye mesas puras y modalidades.

### Regla de rotación (post-proceso)
La Academia pide 3-4 pasarelas free activas. Si en *usar ahora* hay menos de 3 pasarelas de rotación, se promueven *secundarias* confirmadas; si hay más de 4, las sobrantes bajan a *secundario*. Prioridad: lo que ya usás > lo que ya abriste > lo que falta abrir; después el orden del Radar.

## Otras salidas

- **OTC** (`engine/otc.ts`): escalera capital → habilitadas / próxima / faltante + notas (acceso se solicita, mínimo por operación, compran al CCL).
- **Documentación** (`engine/documentacion.ts`): dónde presentar (ampliación, plan, acceso OTC, verificado) con etiquetas *Límite conocido / Posibilidad / Requisito / Estimación / No confirmado*, faltantes, aviso si el volumen supera lo certificado.
- **Binance Verified** (`data/binanceVerified.ts`): requisitos de referencia, ritmo, anti wash-trading, guía por estado. Siempre USDT (sin sugerir BTC); Binance Spot solo como oportunidad puntual si el precio es mejor que las alternativas, nunca como regla.
- **Próximos pasos** (`engine/nextSteps.ts`): árbol ADA §22 — verificado → CERTI → captación / planilla → volumen.

## Sanity check
`npm run check:engine` corre cuatro perfiles tipo (principiante, construcción con CERTI, verificado oro escalando, Binance bloqueada) e imprime los buckets. Correrlo después de tocar reglas o datos.
