# Parity status — tracker de ejecución

Actualiza una fila por paso a medida que se implementa. **Estado:** `pendiente` · `en curso` · `listo` (sólo con evidencia) · `bloqueado`.
**Evidencia** = ruta del screenshot de tu implementación (`docs/feature-parity/shots/NN.png`, 1280×720) y el test que lo cubre. La columna *Referencia* indica la primera imagen de comparación; el detalle de cada pantalla está en [PLAN.md](PLAN.md) §5.

| # | id | tipo | fase | estado | referencia | evidencia | notas |
|---|---|---|---|---|---|---|---|
| 01 | `intro` | intro | 3 | pendiente | `02-intro.png` | | |
| 02 | `drained` | single | 2 | pendiente | `03-quiz-single.png` | | |
| 03 | `overthink` | single | 2 | pendiente | — | | |
| 04 | `sleep` | single | 2 | pendiente | — | | |
| 05 | `selfcare` | single | 2 | pendiente | — | | |
| 06 | `phone` | single | 2 | pendiente | — | | |
| 07 | `juggling` | single | 2 | pendiente | — | | |
| 08 | `wand` | wand | 4 | pendiente | `07-wand.png` | | |
| 09 | `procrastinate` | single | 2 | pendiente | — | | |
| 10 | `restart_habit` | single | 2 | pendiente | `05-quiz-variants.png` | | |
| 11 | `concentration` | single | 2 | pendiente | — | | |
| 12 | `adhd` | single | 2 | pendiente | — | | |
| 13 | `untapped` | single | 2 | pendiente | — | | |
| 14 | `control_life` | single | 2 | pendiente | — | | |
| 15 | `gender` | single | 2 | pendiente | — | | |
| 16 | `age` | single | 2 | pendiente | — | | |
| 17 | `science` | inter | 3 | pendiente | `08-interstitial-science.png` | | |
| 18 | `others_needs` | single | 2 | pendiente | — | | |
| 19 | `others_expect` | single | 2 | pendiente | — | | |
| 20 | `say_no` | single | 2 | pendiente | — | | |
| 21 | `sacrifice` | multi | 2 | pendiente | `06-quiz-multi.png` | | |
| 22 | `missing` | multi | 2 | pendiente | — | | |
| 23 | `wish_understood` | single | 2 | pendiente | — | | |
| 24 | `tried_habits` | single | 2 | pendiente | — | | |
| 25 | `match` | inter | 3 | pendiente | `09-interstitial-match.png` | | |
| 26 | `not_alone` | inter | 3 | pendiente | `10-interstitial-not-alone.png` | | |
| 27 | `who_for` | multi | 2 | pendiente | — | | |
| 28 | `lose_motivation` | single | 2 | pendiente | — | | |
| 29 | `expert_referral` | single | 2 | pendiente | — | | |
| 30 | `evidence` | inter | 3 | pendiente | `11-interstitial-evidence.png` | | |
| 31 | `expert` | inter | 3 | pendiente | `12-interstitial-expert.png` | | |
| 32 | `self_discipline` | single | 2 | pendiente | — | | |
| 33 | `need_most` | single | 2 | pendiente | — | | |
| 34 | `success_30d` | multi | 2 | pendiente | — | | |
| 35 | `biggest_motivation` | single | 2 | pendiente | — | | |
| 36 | `summary` | summary | 5 | pendiente | `13-summary.png` | | |
| 37 | `loader` | loader | 5 | pendiente | `14-loader-states.png` | | |
| 38 | `email` | capture | 6 | pendiente | `16-lead-capture.png` | | |
| 39 | `name` | capture | 6 | pendiente | — | | |
| 40 | `loading` | loading | 6 | pendiente | — | | |
| 41 | `paywall` | paywall | 7 | pendiente | `17-paywall.png` | | |
| 42 | `checkout` | checkout | 7 | pendiente | `18-checkout.png` | | |

## Resumen por fase

| Fase | Descripción | Pasos | Estado |
|---|---|---|---|
| 0 | Bootstrap y decisiones | — | pendiente |
| 1 | Design system y shell | base visual | pendiente |
| 2 | Motor del funnel + 28 preguntas | 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15, 16, 18, 19, 20, 21, 22, 23, 24, 27, 28, 29, 32, 33, 34, 35 | pendiente |
| 3 | Intro e intermedias | 1, 17, 25, 26, 30, 31 | pendiente |
| 4 | Wand interactivo | 8 | pendiente |
| 5 | Resumen y loader | 36, 37 | pendiente |
| 6 | Captura de lead + transición | 38, 39, 40 | pendiente |
| 7 | Paywall y checkout (UI + mock) | 41, 42 | pendiente |
| 8 | Integraciones reales | — | bloqueado (decisiones §9.1) |
| 9 | QA, a11y, performance, responsive | todos | pendiente |

## Decisiones (copiar a DECISIONS.md)

| ID | Tema | Default propuesto | Decisión final |
|---|---|---|---|
| D1 | Stack | Vite + React + TypeScript | |
| D2 | Identidad de Bloom | Tokens de PLAN.md §4.1 con nombres neutros | |
| D3 | Claims / credenciales / testimonios | No renderizar; contenido propio o flag | |
| D4 | Pagos y precios | MockCheckoutProvider; precios sólo demo | |
| D5 | Alineación del label de opciones | Abajo-izquierda con token | |
| D6 | Idiomas | Inglés + i18n listo | |
| D7 | Temporizador de descuento | Detrás de flag, desactivado | |
| D8 | Despliegue y privacidad | Sin despliegue; legales placeholder | |
