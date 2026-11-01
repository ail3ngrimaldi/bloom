# Feature parity — índice

Material para que un agente construya en **Bloom** el funnel de onboarding de la referencia (*Fabulous*), a partir de **dos grabaciones de pantalla** del mismo funnel.

| Documento | Qué cubre | Fuente |
|---|---|---|
| [`PLAN.md`](PLAN.md) | **Variante A** completa: sistema visual, motor del funnel, quiz de 28 preguntas, intermedias, wand, resumen, loader, email/nombre, **paywall de 3 planes + modal de checkout**. Fases 0–9 | `2026-10-29 01-53-06.mkv` (6:33) |
| [`PLAN-B.md`](PLAN-B.md) | **Variante B**: entrada desde la Biblioteca de anuncios de Meta, diferencias en el quiz y **cierre distinto** (*Pay what you want* + hoja de plan con regalo/descuento, contador y pago). Fases B0–B8 | `fabulousFunnel.mkv` (8:52) |
| [`funnel.reference.json`](funnel.reference.json) | Catálogo de los 42 pasos de la variante A (copy, opciones, precios) | A |
| [`funnel.variant-b.reference.json`](funnel.variant-b.reference.json) | Entrada, diferencias del quiz y cierre de la variante B (secciones de la hoja, textos legales, fórmulas) | B |
| [`PARITY_STATUS.md`](PARITY_STATUS.md) | Tracker de ejecución (una fila por paso y por fase; variante A y variante B) | — |
| [`DECISIONS.md`](DECISIONS.md) | Registro de decisiones (D1–D8 y las de implementación `I-xx`); las D9–D15 de la variante B están propuestas en PLAN-B.md §9.1 y aún no se registran aquí | — |
| [`images/`](images/) | `00…19-*.png` y `anim-*.png` → variante A · `b-*.png` → variante B (anotadas, corregidas de aspecto, datos personales redactados) | — |

## Cómo se relacionan

```text
            ┌───────────────────────── compartido (PLAN.md §3–§6, fases 0–6) ─────────────────────────┐
 anuncio ─► │ intro ─► 28 preguntas + wand + intermedias ─► resumen ─► loader ─► email ─► nombre ─► #40 │
            └───────────────────────────────────────────────────────────────────────────────────────────┘
                                                      │
                          funnel.closing = 'paywall'  │  funnel.closing = 'pwyw'
                      ┌───────────────────────────────┴───────────────────────────────┐
              #41 paywall (3 planes + timer)                          #41 Pay what you want (3 importes)
              #42 modal de checkout                                   #42 hoja de plan + regalo + pago
              (PLAN.md §5.10–5.11, fase 7)                            (PLAN-B.md §4, fases B2–B6)
```

El quiz es el mismo en ambas variantes; sólo cambian el titular del intro, la frase final del paso #30 y los valores del resumen (PLAN-B.md §3.2).

## Orden recomendado para el agente ejecutor

> **Estado del repo (2026-11-01):** según [`PARITY_STATUS.md`](PARITY_STATUS.md) y [`DECISIONS.md`](DECISIONS.md), las fases **0–7 y 9 de la variante A ya están implementadas** (Next.js en Vercel, pagos con `MockCheckoutProvider`); la fase 8 sigue bloqueada. Lo pendiente de este material es la **variante B** (fases B0–B8), que se construye sobre ese código.

1. Lee [`PLAN-B.md`](PLAN-B.md) §0–§3 y, de [`PLAN.md`](PLAN.md), lo que necesites (§0–§4). Antes de escribir código revisa lo ya hecho en `src/` (`funnel/`, `screens/`, `pricing/`, `profile/`, `services/`) y las decisiones `I-xx` de `DECISIONS.md`.
2. Si el repo **no** tuviera aún el quiz y el motor del funnel, ejecuta primero las fases **0–6** de `PLAN.md`.
3. Ejecuta las fases **B0–B8** de `PLAN-B.md` (cierre *Pay what you want*) **reutilizando** lo existente —`CheckoutProvider` y su mock en `src/services/checkout/`, el flag del contador en `src/funnel/flags.ts`, `deriveProfile` en `src/profile/`— en lugar de crear equivalentes paralelos. Deja ambos cierres (paywall de la variante A y *Pay what you want*) detrás del flag `funnel.closing` (decisión D9, PLAN-B.md §9.1).
4. Cierra con la **fase B8** de `PLAN-B.md` (QA, accesibilidad, rendimiento, responsive): la fase 9 de `PLAN.md` ya cubre el cierre de la variante A, no el B.
5. Actualiza `PARITY_STATUS.md` en cada paso y registra las decisiones D9–D15 y las de implementación en `DECISIONS.md` (ya existe: continúa su numeración).

## Reglas que valen para todo

- **No copiar** marca, ilustraciones, logos, testimonios, credenciales, premios ni cifras de la referencia: el copy de los JSON es sólo de referencia (`PLAN.md` §2, `PLAN-B.md` §2).
- **Datos personales:** las grabaciones contienen un email, un nombre y medios de pago guardados. En las imágenes están redactados o excluidos; no los reintroduzcas en código, fixtures ni tests.
- **Pagos:** `MockCheckoutProvider` hasta que el usuario decida el proveedor; nunca guardes datos de tarjeta propios.
- Los archivos de video (`*.mkv`, `*.mp4`) y las capturas sueltas de la raíz **no** forman parte del repo: no los commitees ni los borres.
