# Análisis de fuentes — rADAr-P2P

Fecha: 16/09/2026 (actualizado tras la revisión del equipo, misma fecha). Fuente primaria: `fuentes/Radar-P2P_2.pdf` (4 páginas, "Última revisión: septiembre 2026").
Fuentes secundarias: `asesor-ia/01 - Metodología Técnica` (§4 plataformas, §5 billeteras, §6 verificado, §13 bloqueos, §14 CERTI, §22 árbol), `asesor-ia/02 - Casos` (§1 dudas por fase, §3.4 "¿Uso Lemon desde el día 1?", §5.2/§5.3 casos), `BASE_DE_CONOCIMIENTO.md` (§11 bloqueos, §15 certificación, §22 infraestructura, §23 errores).

Regla aplicada: **el PDF manda**. Donde el material anterior de la Academia dice otra cosa, el dato del PDF es el que ve el alumno y el otro queda registrado como *pendiente de confirmar*.

---

## 1. Lo que dice el PDF (33 fichas)

### Exchanges P2P (7) — orden = liquidez
| # | Plataforma | Etiqueta | Comisión |
|---|---|---|---|
| 1 | Binance | Mayor liquidez, lejos | Sin verificar 0,20% · Bronce 0,16% · Plata 0,14% · Oro 0,10% |
| 2 | Bybit | Alta liquidez | No tiene |
| 3 | OKX | Alta liquidez, buena seguridad | No tiene |
| 4 | MEXC | Liquidez media, no pide verificar identidad | No tiene |
| 5 | Bitget | Liquidez menor, buena confianza | No tiene |
| 6 | BingX | Liquidez baja, fuerte en LatAm | No tiene |
| 7 | KuCoin | La liquidez más baja del grupo | No tiene |

### Mesas OTC (6) — orden = mínimo. "Se solicita directamente a la plataforma — no se activa sola."
Ripio USD 5.000 · Belo USD 10.000 · Let's Bit USD 10.000 · Fiwind USD 15.000 · Cocos USD 20.000 · Decrypto USD 30.000.

### Billeteras para arbitrar (6) — "Se solicita directamente a la plataforma el plan de arbitraje — no se activa solo."
| Plataforma | Dato |
|---|---|
| Lemon Cash | Plan P2P pago y obligatorio. 0% maker / 0,2% taker. Bronce $20M/mes USD 10 · Plata $100M/mes USD 50 · Oro sin límite USD 100. Se bonifica comprando cripto en la app (no P2P): USD 500 / 3.000 / 5.000 |
| Let's Bit | Sin monto mínimo. 0,35% por depósito (plan) |
| Belo | Plan de arbitraje desde USD 10.000 de capital |
| Fiwind | No es billetera de pago tradicional: se opera puertas adentro y después salen los fondos (ejemplo Juan/Pedro) |
| Copter (paga) | Cobra % por operación |
| TelePagos (paga) | Cobra % por operación |

### Bancos y billeteras (14) — orden = capacidad operativa
**Billeteras:** Bitso $45M/día, extensible con documentación · Nexo ídem · Mercado Pago $30–35M/día (varía), MP a MP ilimitado, hasta 24 hs en verificación, trabajarla de a poco · Personal Pay $25M, 15 transferencias/día en cada sentido · Naranja X $10M/mes, extensible con documentación, volumen bajo · Claro Pay 10 transferencias/día, $3M/día, $1M por movimiento · Prex USD 3.000/día, USD 4.000/mes · Rebanking sin monto, montos bajos · Ualá sin límite público, bajo volumen.
**Bancos:** Supervielle $30–60M/día (varía) · Santander hasta $40M (varía) · Galicia $35M · Macro $20M · Nación $15M (varía).
**Solo uso personal:** Cuenta DNI, Brubank.

---

## 2. Lo que la app toma del conocimiento de la Academia (no está en el PDF)

Todo esto entra con `fuente: 'academia'` y, salvo indicación, `confianza: 'pendiente'`.

| Tema | Qué se incorporó | Dónde vive en la app |
|---|---|---|
| Estrategia por fase | Pre-verificado se construye con pasarelas de rotación; **Lemon y Mercado Pago no se tocan sin CERTI**; post-verificado + CERTI se centraliza en Lemon con 2-3 free de respaldo; escalado → billeteras pro + OTC | `engine/recommend.ts` (roles `pasarela_premium`, `pasarela_vigilada`, `billetera_pro`) |
| Regla 3-4 pasarelas | "Tener 3-4 activas en simultáneo siempre" | `meta.rotacionPasarelas` + top-up/demotion en `recommend()` |
| Bandas de volumen | < 20K arranque · 20-80K medio · > 80K alto · Copter primaria a 100K+ | `meta.bandasVolumenUsd` |
| Billeteras pagas | "Se justifican con volumen de cliente, no con voluntad de escalar" (Caso 5.2) | rol `billetera_pro` |
| Exchanges | Binance principal; Bybit/OKX se abren temprano sin moverlas; Bybit verificado cae después; OKX super verificado ~800 ops; BingX/Bitget oportunistas; caso BingX+Binance USD 40-50/día sin verificado | roles `exchange_*` |
| Bancos | "Billeteras virtuales, no cuentas bancarias al principio"; ante el banco "compraventa de activos digitales" | rol `banco` |
| OTC | Compran al CCL; conviene con ticket alto; el mínimo es por operación (cliente como palanca); Fiwind se negocia por WhatsApp y pide CERTI 15K+ | `engine/otc.ts` notas + reglas |
| Verificado de Binance | Volumen equivalente a 1 BTC histórico y 0,5 BTC en 30 días (operando siempre USDT), 350-450 ops, +90 días, 500 USDT retenidos; ritmo 20-25 ops/día USD 500-700; 15-20 días de referencia; anti wash-trading; extracto con logo y dirección; mantenimiento ~60 ops/mes; guía por estado. Por decisión del equipo no se sugiere operar BTC ni usar Binance Spot como regla (solo si el precio es realmente mejor) | `data/binanceVerified.ts` |
| CERTI | "Lo más abultada posible"; validez 3 meses; qué suma (recibos 12 meses, mutuo, monotributo…); ADA no da asesoría contable → contador vigente (Discord) | `engine/documentacion.ts`, `data/documentacion.ts` |
| Bloqueos | "Es un evento que te va a suceder"; mandar documentación sin pelear; migrar mientras tanto | modificador `infra = 'bloqueada'` |
| Plataformas extra | Wala, Astropay ($5M/día · $150M/mes) | `platforms.ts` con badge "Pendiente de confirmar". Velo, Bipagos y Binance OTC se eliminaron por decisión del equipo (16/09/2026) |
| Límites alternativos | Lemon $500M/mes con plan · LB plan $500M/mes · $5.000M/año · Belo 5K USDT/día · 100K/año · Naranja X $10M/día · $300M/mes · Personal Pay $16M/día · $400M/mes | campo `pendientes` de cada plataforma (no se muestran como límite) |

---

## 3. Lo que propuse yo (sugerencias a validar)

- **Los 5 buckets** (Usar ahora / Preparar-solicitar / Reservar / Secundario / No priorizar) y el concepto de *rol operativo* por plataforma, para que el motor sea data-driven.
- **Etiquetas en documentación**: Límite conocido · Posibilidad de ampliar · Requisito · Estimación · No confirmado — para no prometer "te aumentan a X".
- **Capacidad por pasarela** = volumen diario / 3 (rotación). Criterio simple y explicable; se puede ajustar en `derive()`.
- **Criterio conservador con rangos sin confirmar**: si un mínimo es un rango, la mesa se habilita recién en el tope.
- **Una plataforma, varias modalidades**: Belo, Let's Bit y Fiwind son una sola entidad con su billetera/plan y su mesa OTC (campo `otc`), no dos empresas.
- **Vigencia de la certificación contable**: el alumno puede indicar el mes de emisión; la app avisa cuando pasa (o está por pasar) los 3 meses recomendados para presentarla.
- **Alerta por tope por movimiento** (Claro Pay $1M) contra el ticket de referencia USD 500-700.
- **Clasificación `cryptoFriendly` y `riesgoBloqueo`** por plataforma: inferida de la doctrina (Lemon/MP alto, exchanges cripto bajo, bancos medio). **No está en el PDF: conviene que Franco la revise.**
- **Tipos de documentación** DDJJ y documentación societaria (no aparecen en el material; son útiles para bancos/OTC).
- **Cotización de referencia editable** (default 1.500 ARS/USDT) para convertir capital y volumen.
- **Bitso/Nexo desde el arranque**: el PDF las marca "buena opción para arbitraje" sin etapa; el material no las reserva como a Lemon/MP, así que el motor las habilita apenas el alumno opera, con alerta de subir volumen de a poco sin CERTI. *Confirmar criterio.*

---

## 4. Pendientes de confirmar (para revisar con Franco)

1. **Brubank**: el Radar la reserva para uso personal; el material anterior la listaba como "quemable" pre-verificado y como fuente de extracto para el verificado. ¿Cuál aplica hoy?
2. **Naranja X**: $10M **mensual** (Radar) vs $10M diarios / $300M mensuales (material anterior).
3. **Personal Pay**: $25M (Radar) vs $16M diarios / $400M mensuales.
4. **Lemon**: niveles Bronce/Plata/Oro (Radar) vs "$500M mensuales con plan".
5. **Mínimos OTC**: Let's Bit USD 10.000 y Ripio USD 5.000 (Radar) vs 1.000 USDT (material anterior).
6. **Let's Bit plan**: límites $500M/mes · $5.000M/año (no figuran en el Radar).
7. **Belo plan**: 5K USDT/día · 100K USDT/año (no figuran en el Radar).
8. **Fiwind OTC**: ¿exige CERTI por 15K+? ¿Se negocia por WhatsApp con el trader?
9. **Copter y TelePagos**: % exacto de comisión y límites.
10. **Plataformas fuera del Radar**: Wala y Astropay — ¿siguen recomendadas? ¿con qué números? (hoy visibles con badge; `visible: false` las oculta). Velo, Bipagos y Binance OTC ya fueron eliminadas por el equipo.
11. **Binance**: taker 0,05 USDT; requisitos del verificado (métricas rolling) — ¿vigentes en septiembre 2026?
12. **Bitso / Nexo pre-verificado**: ¿se usan desde el arranque o también se preservan?
13. **Ripio OTC** "rechaza contratos de mutuo para certificar".
14. **Cocos**: nota "retail no como primaria de alto volumen".
15. **Clasificaciones crypto-friendly / riesgo de bloqueo** (ver §3).
16. **Cotización de referencia** inicial (1.500 ARS/USDT) — parámetro en `meta.ts`.

Cuando se confirme un dato: `confianza: 'confirmado'` en `platforms.ts`, borrar la línea de `pendientes` y actualizar `actualizado`.
