# Parity status — tracker de ejecución

Actualiza una fila por paso a medida que se implementa. **Estado:** `pendiente` · `en curso` · `listo` (sólo con evidencia) · `bloqueado`.
**Evidencia** = ruta del screenshot de tu implementación (`docs/feature-parity/shots/NN.png`, 1280×720, generado con `npm run shots` e ignorado por git) y el test que lo cubre. La columna *Referencia* indica la primera imagen de comparación; el detalle de cada pantalla está en [PLAN.md](PLAN.md) §5.

| # | id | tipo | fase | estado | referencia | evidencia | notas |
|---|---|---|---|---|---|---|---|
| 01 | `intro` | intro | 3 | listo | `02-intro.png` | `shots/01.png` · `intro.test.tsx` · e2e `funnel.spec.ts` (reveal, CTA abajo, axe) | Arte propio (burbuja You, orbe de Bloom, chip ?) · I-26/I-27 |
| 02 | `drained` | single | 2 | listo | `03-quiz-single.png` | `shots/02.png` · e2e `funnel.spec.ts` (recorrido) | |
| 03 | `overthink` | single | 2 | listo | — | `shots/03.png` · e2e `funnel.spec.ts` (recorrido) | |
| 04 | `sleep` | single | 2 | listo | — | `shots/04.png` · e2e `funnel.spec.ts` (recorrido) | |
| 05 | `selfcare` | single | 2 | listo | — | `shots/05.png` · e2e `funnel.spec.ts` (recorrido) | |
| 06 | `phone` | single | 2 | listo | — | `shots/06.png` · e2e `funnel.spec.ts` (recorrido) | |
| 07 | `juggling` | single | 2 | listo | — | `shots/07.png` · e2e `funnel.spec.ts` (recorrido) | |
| 08 | `wand` | wand | 4 | listo | `07-wand.png` | `shots/08.png` · `wand.test.tsx`, `wandPhysics.test.ts` · e2e `funnel.spec.ts` (estallido, deriva, reduced motion, axe) | Deriva rAF ±8 px + colisión suave; guarda `answers.wand` en orden de toque · I-31 |
| 09 | `procrastinate` | single | 2 | listo | — | `shots/09.png` · e2e `funnel.spec.ts` (recorrido) | |
| 10 | `restart_habit` | single | 2 | listo | `05-quiz-variants.png` | `shots/10.png` · e2e `funnel.spec.ts` (recorrido) | |
| 11 | `concentration` | single | 2 | listo | — | `shots/11.png` · e2e `funnel.spec.ts` (recorrido) | |
| 12 | `adhd` | single | 2 | listo | — | `shots/12.png` · e2e `funnel.spec.ts` (recorrido) | Opción extra "I'd rather not say" + aviso de privacidad (I-18) |
| 13 | `untapped` | single | 2 | listo | — | `shots/13.png` · e2e `funnel.spec.ts` (recorrido) | |
| 14 | `control_life` | single | 2 | listo | — | `shots/14.png` · e2e `funnel.spec.ts` (recorrido) | |
| 15 | `gender` | single | 2 | listo | — | `shots/15.png` · e2e `funnel.spec.ts` (recorrido) | Define `{{audience}}` (men/women/people) |
| 16 | `age` | single | 2 | listo | — | `shots/16.png` · e2e `funnel.spec.ts` (recorrido) | |
| 17 | `science` | inter | 3 | listo | `08-interstitial-science.png` | `shots/17.png` · `interstitials.test.tsx` · e2e `funnel.spec.ts` | Sin prensa ni cifra (sin evidencia); titular "Made for {{audience}} like you" · I-29 |
| 18 | `others_needs` | single | 2 | listo | — | `shots/18.png` · e2e `funnel.spec.ts` (recorrido) | |
| 19 | `others_expect` | single | 2 | listo | — | `shots/19.png` · e2e `funnel.spec.ts` (recorrido) | |
| 20 | `say_no` | single | 2 | listo | — | `shots/20.png` · e2e `funnel.spec.ts` (recorrido) | |
| 21 | `sacrifice` | multi | 2 | listo | `06-quiz-multi.png` | `shots/21.png` · e2e `funnel.spec.ts` (recorrido) | CTA deshabilitado con 0 selecciones |
| 22 | `missing` | multi | 2 | listo | — | `shots/22.png` · e2e `funnel.spec.ts` (recorrido) | CTA deshabilitado con 0 selecciones |
| 23 | `wish_understood` | single | 2 | listo | — | `shots/23.png` · e2e `funnel.spec.ts` (recorrido) | |
| 24 | `tried_habits` | single | 2 | listo | — | `shots/24.png` · e2e `funnel.spec.ts` (recorrido) | |
| 25 | `match` | inter | 3 | listo | `09-interstitial-match.png` | `shots/25.png` · `interstitials.test.tsx` · e2e `funnel.spec.ts` | Venn: fusión 1 s, check, glow; CTA a 2.3 s · I-30 |
| 26 | `not_alone` | inter | 3 | listo | `10-interstitial-not-alone.png` | `shots/26.png` · `interstitials.test.tsx` · e2e `funnel.spec.ts` | Texto sin cifra de usuarios; órbitas propias · I-29 |
| 27 | `who_for` | multi | 2 | listo | — | `shots/27.png` · e2e `funnel.spec.ts` (recorrido) | CTA deshabilitado con 0 selecciones |
| 28 | `lose_motivation` | single | 2 | listo | — | `shots/28.png` · e2e `funnel.spec.ts` (recorrido) | |
| 29 | `expert_referral` | single | 2 | listo | — | `shots/29.png` · e2e `funnel.spec.ts` (recorrido) | |
| 30 | `evidence` | inter | 3 | listo | `11-interstitial-evidence.png` | `shots/30.png` · `interstitials.test.tsx` · e2e `funnel.spec.ts` | 3 tarjetas de prácticas en vez de universidades · I-29 |
| 31 | `expert` | inter | 3 | listo | `12-interstitial-expert.png` | `shots/31.png` · `interstitials.test.tsx` · e2e `funnel.spec.ts` | Sin revisor experto: título sobre el enfoque, chips Thoughts/Feelings/Behavior · I-29 |
| 32 | `self_discipline` | single | 2 | listo | — | `shots/32.png` · e2e `funnel.spec.ts` (recorrido) | |
| 33 | `need_most` | single | 2 | listo | — | `shots/33.png` · e2e `funnel.spec.ts` (recorrido) | |
| 34 | `success_30d` | multi | 2 | listo | — | `shots/34.png` · e2e `funnel.spec.ts` (recorrido) | CTA deshabilitado con 0 selecciones |
| 35 | `biggest_motivation` | single | 2 | listo | — | `shots/35.png` · e2e `funnel.spec.ts` (recorrido) | |
| 36 | `summary` | summary | 5 | listo | `13-summary.png` | `shots/36.png` · `summary.test.tsx`, `profile/derive.test.ts` · e2e `funnel.spec.ts` (fase 5, axe) | Reglas de §6.5; "Focus and attention" si sólo se sospecha TDAH; aviso "Not a medical assessment" · I-32 |
| 37 | `loader` | loader | 5 | listo | `14-loader-states.png` | `shots/37.png`, `shots/37b.png` · `loader.test.tsx`, `loaderScript.test.ts` · e2e `funnel.spec.ts` (fase 5, axe) | 2 preguntas bloqueantes (50 %, 58 %); notas propias en vez de testimonios; texto oscuro sobre las barras (AA) · I-33 |
| 38 | `email` | capture | 6 | en curso | `16-lead-capture.png` | `shots/38.png` (placeholder) | Pantalla provisional con título + Continue hasta su fase |
| 39 | `name` | capture | 6 | en curso | — | `shots/39.png` (placeholder) | Pantalla provisional con título + Continue hasta su fase |
| 40 | `loading` | loading | 6 | en curso | — | `shots/40.png` (placeholder) | Pantalla provisional con título + Continue hasta su fase |
| 41 | `paywall` | paywall | 7 | en curso | `17-paywall.png` | `shots/41.png` (placeholder) | Pantalla provisional con título + Continue hasta su fase |
| 42 | `checkout` | checkout | 7 | en curso | `18-checkout.png` | `shots/42.png` (placeholder) | Pantalla provisional con título + Continue hasta su fase |

## Resumen por fase

| Fase | Descripción | Pasos | Estado |
|---|---|---|---|
| 0 | Bootstrap y decisiones | — | listo |
| 1 | Design system y shell | base visual | listo (galería `/__gallery`, `tests/e2e/gallery.spec.ts`) |
| 2 | Motor del funnel + 28 preguntas | 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15, 16, 18, 19, 20, 21, 22, 23, 24, 27, 28, 29, 32, 33, 34, 35 | listo |
| 3 | Intro e intermedias | 1, 17, 25, 26, 30, 31 | listo |
| 4 | Wand interactivo | 8 | listo |
| 5 | Resumen y loader | 36, 37 | listo |
| 6 | Captura de lead + transición | 38, 39, 40 | pendiente |
| 7 | Paywall y checkout (UI + mock) | 41, 42 | pendiente |
| 8 | Integraciones reales | — | bloqueado (decisiones §9.1) |
| 9 | QA, a11y, performance, responsive | todos | pendiente |

## Decisiones (copiar a DECISIONS.md)

| ID | Tema | Default propuesto | Decisión final |
|---|---|---|---|
| D1 | Stack | Vite + React + TypeScript | **Next.js (App Router) + TypeScript, desplegado en Vercel** (decisión del usuario) |
| D2 | Identidad de Bloom | Tokens de PLAN.md §4.1 con nombres neutros | Default adoptado (logo placeholder `TODO(content)`) |
| D3 | Claims / credenciales / testimonios | No renderizar; contenido propio o flag | Default adoptado: `src/funnel/claims.ts`, todo apagado |
| D4 | Pagos y precios | MockCheckoutProvider; precios sólo demo | Default adoptado |
| D5 | Alineación del label de opciones | Abajo-izquierda con token | Default adoptado (`--option-label-align`) |
| D6 | Idiomas | Inglés + i18n listo | Default adoptado: `src/funnel/copy.en.json` |
| D7 | Temporizador de descuento | Detrás de flag, desactivado | Default adoptado |
| D8 | Despliegue y privacidad | Sin despliegue; legales placeholder | Vercel (usuario); legales placeholder en `/legal/*` |
