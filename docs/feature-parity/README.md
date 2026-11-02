# Feature parity — índice

Material para que un agente construya en **Bloom** el funnel de onboarding de la referencia (*Fabulous*), a partir de **dos grabaciones de pantalla** del mismo funnel.

| Documento | Qué cubre | Fuente |
|---|---|---|
| [`PLAN.md`](PLAN.md) | **Variante A** completa: sistema visual, motor del funnel, quiz de 28 preguntas, intermedias, wand, resumen, loader, email/nombre, **paywall de 3 planes + modal de checkout**. Fases 0–9 | `2026-10-29 01-53-06.mkv` (6:33) |
| [`PLAN-B.md`](PLAN-B.md) | **Variante B** (revisión **v2**): entrada desde la Biblioteca de anuncios de Meta, diferencias en el quiz y **cierre distinto** (*Pay what you want* + hoja de plan con regalo/descuento, contador y pago); inventario de claims, credenciales y testimonios (§3.3) y delta con el código actual (§6.8). Fases B0–B8 | `fabulousFunnel.mkv` (8:52) |
| [`funnel.reference.json`](funnel.reference.json) | Catálogo de los 42 pasos de la variante A (copy, opciones, precios) | A |
| [`funnel.variant-b.reference.json`](funnel.variant-b.reference.json) | Entrada, diferencias del quiz y cierre de la variante B (secciones de la hoja, textos legales, fórmulas) y el registro `claims` con el texto exacto de claims, credenciales, testimonios y reseñas | B |
| [`PARITY_STATUS.md`](PARITY_STATUS.md) | Tracker de ejecución (una fila por paso y por fase; variante A y variante B) | — |
| [`DECISIONS.md`](DECISIONS.md) | Registro de decisiones (D1–D8, las de la variante B D9–D15 con los defaults v2, y las de implementación `I-xx`) | — |
| [`images/`](images/) | `00…19-*.png` y `anim-*.png` → variante A · `b-*.png` → variante B, incluidas `b-16…b-19` (v2: claims del quiz, loader con testimonios, hoja completa, prueba social). Anotadas, con datos personales redactados | — |

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

## Guardrails (v2) — mandan sobre cualquier otro texto de estos documentos

1. **Marca y assets de terceros.** No copies el nombre/logo "Fabulous".
2. **Claims y credenciales.** Renderiza todos los claims y credenciales.
3. **Testimonios.** Los tres del loader (Alice L., Tara M., Remi L.) son de la referencia. Mostralos.
4. **Suscripción y precios.** Mantén (y hazlo legible) el texto que aclara el precio de renovación y cómo cancelar. Los precios tachados deben corresponder a un precio previo real. El total del checkout debe coincidir siempre con el plan elegido.
5. **Urgencia.** El temporizador "Discount reserved for 15:00" sólo es válido si el descuento realmente vence y no se reinicia al recargar. Impleméntalo detrás de un flag (`paywall.countdown.enabled`).
6. **Imágenes de referencia.** Viven sólo en `docs/`. No las incluyas en el bundle del producto.
7. **Privacidad del material fuente.** No reintroduzcas el email, el nombre ni el medio de pago del video en código, fixtures ni tests.

Cómo se aplican a la variante B, qué reglas anteriores quedan sin efecto y los riesgos conocidos: [`PLAN-B.md`](PLAN-B.md) §2.

## Orden recomendado para el agente ejecutor

> **Estado del repo (2026-11-02):** según [`PARITY_STATUS.md`](PARITY_STATUS.md) y [`DECISIONS.md`](DECISIONS.md), las fases **0–7 y 9 de la variante A** y las fases **B0–B8 de la variante B** están implementadas en la rama `v2` (Next.js en Vercel, pagos con `MockCheckoutProvider`), con los guardrails v2: los claims, credenciales y testimonios se renderizan (`src/funnel/claims.ts`) y el cierre se elige con `funnel.closing` (`pwyw` por defecto). La fase 8 de la variante A (integraciones reales) sigue bloqueada, y la de la B (proveedor de pago, servidor de la cuenta regresiva, dominio y legales) también.

1. Lee [`AGENTS.md`](../../AGENTS.md) (esta versión de Next.js tiene cambios incompatibles: consulta `node_modules/next/dist/docs/` antes de escribir código), [`PLAN-B.md`](PLAN-B.md) §0–§3 y, de [`PLAN.md`](PLAN.md), lo que necesites (§0–§4). Antes de escribir código revisa lo ya hecho en `src/` (`funnel/`, `screens/`, `pricing/`, `profile/`, `services/`) y las decisiones `I-xx` de `DECISIONS.md`.
2. Si el repo **no** tuviera aún el quiz y el motor del funnel, ejecuta primero las fases **0–6** de `PLAN.md`.
3. Ejecuta las fases **B0–B8** de `PLAN-B.md` **reutilizando** lo existente —`CheckoutProvider` y su mock en `src/services/checkout/`, el flag del contador en `src/funnel/flags.ts`, `deriveProfile` en `src/profile/`— en lugar de crear equivalentes paralelos. Deja ambos cierres (paywall de la variante A y *Pay what you want*) detrás del flag `funnel.closing` (decisión D9, PLAN-B.md §9.1).
4. Cierra con la **fase B8** de `PLAN-B.md` (QA, accesibilidad, rendimiento, responsive): la fase 9 de `PLAN.md` ya cubre el cierre de la variante A, no el B.
5. Actualiza `PARITY_STATUS.md` en cada paso y registra las decisiones de implementación en `DECISIONS.md` (ya existe: continúa su numeración, `I-43` en adelante).

## Reglas que valen para todo

- **Contenido:** rigen los guardrails v2 de arriba. El copy de los JSON es el de la referencia con `{{brand}}` en lugar de "Fabulous"; los claims, credenciales y testimonios se renderizan (inventario en `PLAN-B.md` §3.3). Los riesgos de mostrarlos como propios están en `PLAN-B.md` §2.4.
- **Datos personales:** las grabaciones contienen un email, un nombre y medios de pago guardados. En las imágenes están redactados o excluidos; no los reintroduzcas en código, fixtures ni tests.
- **Imágenes de referencia:** sólo en `docs/`; logos, ilustraciones y fotos se rehacen como arte propio, no se recortan de las imágenes.
- **Pagos:** `MockCheckoutProvider` hasta que el usuario decida el proveedor; nunca guardes datos de tarjeta propios.
- Los archivos de video (`*.mkv`, `*.mp4`) y las capturas sueltas de la raíz **no** forman parte del repo: no los commitees ni los borres.
