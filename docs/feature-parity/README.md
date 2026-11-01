# Feature parity — índice

Material para que un agente construya en **Bloom** el funnel de onboarding de la referencia (*Fabulous*), a partir de **dos grabaciones de pantalla** del mismo funnel.

| Documento | Qué cubre | Fuente |
|---|---|---|
| [`PLAN.md`](PLAN.md) | **Variante A** completa: sistema visual, motor del funnel, quiz de 28 preguntas, intermedias, wand, resumen, loader, email/nombre, **paywall de 3 planes + modal de checkout**. Fases 0–9 | `2026-10-29 01-53-06.mkv` (6:33) |
| [`PLAN-B.md`](PLAN-B.md) | **Variante B**: entrada desde la Biblioteca de anuncios de Meta, diferencias en el quiz y **cierre distinto** (*Pay what you want* + hoja de plan con regalo/descuento, contador y pago). Fases B0–B8 | `fabulousFunnel.mkv` (8:52) |
| [`funnel.reference.json`](funnel.reference.json) | Catálogo de los 42 pasos de la variante A (copy, opciones, precios) | A |
| [`funnel.variant-b.reference.json`](funnel.variant-b.reference.json) | Entrada, diferencias del quiz y cierre de la variante B (secciones de la hoja, textos legales, fórmulas) | B |
| [`PARITY_STATUS.md`](PARITY_STATUS.md) | Tracker de ejecución (una fila por paso y por fase) | — |
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

1. Lee [`PLAN.md`](PLAN.md) §0–§4 y luego [`PLAN-B.md`](PLAN-B.md) §0–§3.
2. Ejecuta las fases **0–6** de `PLAN.md` (bootstrap, design system, motor, preguntas, intermedias, wand, resumen, loader, captura).
3. Ejecuta las fases **B0–B8** de `PLAN-B.md` (cierre *Pay what you want*), **o** la fase **7** de `PLAN.md` (cierre de paywall) según la decisión D9 de PLAN-B.md §9.1. Lo ideal es dejar ambos detrás del flag `funnel.closing`.
4. Cierra con la **fase 9** de `PLAN.md` y la **fase B8** de `PLAN-B.md` (QA, accesibilidad, rendimiento, responsive).
5. Actualiza `PARITY_STATUS.md` en cada paso y registra decisiones en `DECISIONS.md` (créalo tú).

## Reglas que valen para todo

- **No copiar** marca, ilustraciones, logos, testimonios, credenciales, premios ni cifras de la referencia: el copy de los JSON es sólo de referencia (`PLAN.md` §2, `PLAN-B.md` §2).
- **Datos personales:** las grabaciones contienen un email, un nombre y medios de pago guardados. En las imágenes están redactados o excluidos; no los reintroduzcas en código, fixtures ni tests.
- **Pagos:** `MockCheckoutProvider` hasta que el usuario decida el proveedor; nunca guardes datos de tarjeta propios.
- Los archivos de video (`*.mkv`, `*.mp4`) y las capturas sueltas de la raíz **no** forman parte del repo: no los commitees ni los borres.
