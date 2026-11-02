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
| 17 | `science` | inter | 3 | pendiente (v2) | `08-interstitial-science.png`, `b-16-claims-quiz.png` | `shots/17.png` · `interstitials.test.tsx` · e2e `funnel.spec.ts` | Sin prensa ni cifra (sin evidencia); titular "Made for {{audience}} like you" · I-29 |
| 18 | `others_needs` | single | 2 | listo | — | `shots/18.png` · e2e `funnel.spec.ts` (recorrido) | |
| 19 | `others_expect` | single | 2 | listo | — | `shots/19.png` · e2e `funnel.spec.ts` (recorrido) | |
| 20 | `say_no` | single | 2 | listo | — | `shots/20.png` · e2e `funnel.spec.ts` (recorrido) | |
| 21 | `sacrifice` | multi | 2 | listo | `06-quiz-multi.png` | `shots/21.png` · e2e `funnel.spec.ts` (recorrido) | CTA deshabilitado con 0 selecciones |
| 22 | `missing` | multi | 2 | listo | — | `shots/22.png` · e2e `funnel.spec.ts` (recorrido) | CTA deshabilitado con 0 selecciones |
| 23 | `wish_understood` | single | 2 | listo | — | `shots/23.png` · e2e `funnel.spec.ts` (recorrido) | |
| 24 | `tried_habits` | single | 2 | listo | — | `shots/24.png` · e2e `funnel.spec.ts` (recorrido) | |
| 25 | `match` | inter | 3 | listo | `09-interstitial-match.png` | `shots/25.png` · `interstitials.test.tsx` · e2e `funnel.spec.ts` | Venn: fusión 1 s, check, glow; CTA a 2.3 s · I-30 |
| 26 | `not_alone` | inter | 3 | pendiente (v2) | `10-interstitial-not-alone.png`, `b-16-claims-quiz.png` | `shots/26.png` · `interstitials.test.tsx` · e2e `funnel.spec.ts` | Texto sin cifra de usuarios; órbitas propias · I-29 |
| 27 | `who_for` | multi | 2 | listo | — | `shots/27.png` · e2e `funnel.spec.ts` (recorrido) | CTA deshabilitado con 0 selecciones |
| 28 | `lose_motivation` | single | 2 | listo | — | `shots/28.png` · e2e `funnel.spec.ts` (recorrido) | |
| 29 | `expert_referral` | single | 2 | listo | — | `shots/29.png` · e2e `funnel.spec.ts` (recorrido) | |
| 30 | `evidence` | inter | 3 | pendiente (v2) | `11-interstitial-evidence.png`, `b-16-claims-quiz.png` | `shots/30.png` · `interstitials.test.tsx` · e2e `funnel.spec.ts` | 3 tarjetas de prácticas en vez de universidades · I-29 |
| 31 | `expert` | inter | 3 | pendiente (v2) | `12-interstitial-expert.png`, `b-16-claims-quiz.png` | `shots/31.png` · `interstitials.test.tsx` · e2e `funnel.spec.ts` | Sin revisor experto: título sobre el enfoque, chips Thoughts/Feelings/Behavior · I-29 |
| 32 | `self_discipline` | single | 2 | listo | — | `shots/32.png` · e2e `funnel.spec.ts` (recorrido) | |
| 33 | `need_most` | single | 2 | listo | — | `shots/33.png` · e2e `funnel.spec.ts` (recorrido) | |
| 34 | `success_30d` | multi | 2 | listo | — | `shots/34.png` · e2e `funnel.spec.ts` (recorrido) | CTA deshabilitado con 0 selecciones |
| 35 | `biggest_motivation` | single | 2 | listo | — | `shots/35.png` · e2e `funnel.spec.ts` (recorrido) | |
| 36 | `summary` | summary | 5 | listo | `13-summary.png` | `shots/36.png` · `summary.test.tsx`, `profile/derive.test.ts` · e2e `funnel.spec.ts` (fase 5, axe) | Reglas de §6.5; "Focus and attention" si sólo se sospecha TDAH; aviso "Not a medical assessment" · I-32 |
| 37 | `loader` | loader | 5 | pendiente (v2) | `14-loader-states.png`, `b-17-loader-testimonials.png` | `shots/37.png`, `shots/37b.png` · `loader.test.tsx`, `loaderScript.test.ts` · e2e `funnel.spec.ts` (fase 5, axe) | 2 preguntas bloqueantes (50 %, 58 %); notas propias en vez de testimonios; texto oscuro sobre las barras (AA) · I-33 |
| 38 | `email` | capture | 6 | listo | `16-lead-capture.png` | `shots/38.png` · `capture.test.tsx` · e2e `funnel.spec.ts` (fase 6, axe) | Validación al enviar, error inline con `aria-invalid`; subrayado y placeholder (recomendación de §5.9) · I-34 |
| 39 | `name` | capture | 6 | listo | — | `shots/39.png` · `capture.test.tsx`, `services/lead.test.ts` · e2e `funnel.spec.ts` (fase 6, axe) | "Please wait… ⟶" mientras el `LeadService` mock responde; la respuesta de salud no se envía · I-34/I-35 |
| 40 | `loading` | loading | 6 | listo | — | `shots/40.png` · `capture.test.tsx` · e2e `funnel.spec.ts` (fase 6) | Loader de marca de 1 s (no la pantalla en blanco de 4–5 s); reemplaza su entrada del historial · I-36 |
| 41 | `paywall` | paywall | 7 | listo | `17-paywall.png` | `shots/41.png` · `paywall.test.tsx`, `pricing.test.ts` · e2e `funnel.spec.ts` (fase 7, axe) | 3 planes con cálculos de §5.10, 1 mes por defecto, legal dinámico, precios demo etiquetados; contador sólo con flag (D7) · I-37/I-38 |
| 42 | `checkout` | checkout | 7 | listo | `18-checkout.png` | `shots/42.png` · `paywall.test.tsx` · e2e `funnel.spec.ts` (recorrido completo, fase 7, axe) | Total = plan elegido (no replica el bug); email de #38; botones del `MockCheckoutProvider` en < 2 s; sin formulario de tarjeta · I-39 |

## Resumen por fase

| Fase | Descripción | Pasos | Estado |
|---|---|---|---|
| 0 | Bootstrap y decisiones | — | listo |
| 1 | Design system y shell | base visual | listo (galería `/__gallery`, `tests/e2e/gallery.spec.ts`) |
| 2 | Motor del funnel + 28 preguntas | 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15, 16, 18, 19, 20, 21, 22, 23, 24, 27, 28, 29, 32, 33, 34, 35 | listo |
| 3 | Intro e intermedias | 1, 17, 25, 26, 30, 31 | listo (17, 26, 30 y 31 reabiertos por guardrails v2: fase B1) |
| 4 | Wand interactivo | 8 | listo |
| 5 | Resumen y loader | 36, 37 | listo (37 reabierto por guardrails v2: fase B1) |
| 6 | Captura de lead + transición | 38, 39, 40 | listo |
| 7 | Paywall y checkout (UI + mock) | 41, 42 | listo |
| 8 | Integraciones reales | — | bloqueado (decisiones §9.1) |
| 9 | QA, a11y, performance, responsive | todos | listo (ver §8 abajo) |

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

## Verificación (PLAN §8)

### §8.1 Checklist por pantalla

- [x] **Shell/quiz**: card 375×(vh−62), radio 32, header, barra, opción 72 px, gap 9, label abajo-izquierda — `gallery.spec.ts`, `shots/02.png`
- [x] **Single**: hover `#E4E1FD`, auto-avance a 150 ms, salida 400 / hueco 150 / entrada 300 ms, sin Next/Back — `funnel.spec.ts` (transición), `singleSelect.test.tsx`
- [x] **Multi**: checkbox 24 px, fila seleccionada, CTA deshabilitado con 0, bloque centrado — `multiSelect.test.tsx`, `shots/21.png`
- [x] **Intro**: sin card, reveal escalonado ≈ 1 s, CTA abajo — `funnel.spec.ts` (fase 3), `shots/01.png`
- [x] **Wand**: 5 burbujas, deriva, 3 toques, estallido, contador, cierre con CTA blanco — `wand.test.tsx`, `funnel.spec.ts` (fase 4)
- [x] **Intermedias**: CTA con delay de 0.5 s, flecha, layout por variante, match animado — `interstitials.test.tsx`, `funnel.spec.ts` (fase 3)
- [x] **Resumen**: medidor, alerta, 4 tiles, CTA — `summary.test.tsx`, `shots/36.png`
- [x] **Loader**: 3 barras eased, 2 modales bloqueantes, checks, auto-avance — `loader.test.tsx`, `funnel.spec.ts` (fase 5)
- [x] **Captura**: email/nombre, validación, "Please wait…", precarga en checkout — `capture.test.tsx`, `funnel.spec.ts` (fase 6)
- [x] **Paywall**: 3 planes, cálculos, selección, contador (flag), header sticky, legal dinámico — `paywall.test.tsx`, `pricing.test.ts`
- [x] **Checkout**: total = plan elegido, botones asíncronos, cierre, legal — `paywall.test.tsx`, `funnel.spec.ts` (fase 7)

### §8.3 Accesibilidad, responsive y rendimiento

| Criterio | Resultado | Evidencia |
|---|---|---|
| Axe WCAG 2.1 A/AA en todas las pantallas | 0 violaciones en 16 pasos + galería | `funnel.spec.ts`, `gallery.spec.ts` (accessibility) |
| Teclado completo y foco | Radiogroups con flechas, Space/Enter, foco al título (o al campo) tras cada paso, trampa de foco en modales | `funnel.spec.ts` (teclado), `quality.spec.ts` (planes) |
| `prefers-reduced-motion` | Fundidos ≤ 100 ms, sin deriva en la wand, match sin desplazamiento | `gallery.spec.ts` (motion), `funnel.spec.ts` (wand) |
| Móvil 360 / 390 / 430 px | Sin scroll horizontal; card a pantalla completa; todos los controles ≥ 44 px | `quality.spec.ts` |
| Sin JavaScript | Intro completo desde el servidor; resto de pasos con aviso | `quality.spec.ts` |
| CLS | 0.000–0.001 (recorrido intro → #04) | `quality.spec.ts` (< 0.1), medición manual |
| LCP / FCP (build de producción, `next start` local) | Desktop 60–90 ms; móvil 4× CPU + 1.6 Mbps / 150 ms RTT: 0.87 s | Medición manual con PerformanceObserver (I-40) |

---

# Variante B (`fabulousFunnel.mkv`) — ver [PLAN-B.md](PLAN-B.md) (revisión v2)

Los pasos #01–#40 son los de la tabla de arriba (quiz compartido). Aquí van las **diferencias**, los pasos **nuevos** de la variante B y los pasos del quiz **reabiertos** por los guardrails v2 (aparecen arriba como `pendiente (v2)`). Mismos estados y reglas de evidencia: `pendiente` · `en curso` · `listo` (sólo con evidencia) · `bloqueado`.

| Ítem | id | tipo | fase | estado | referencia | evidencia | notas |
|---|---|---|---|---|---|---|---|
| Guardias `referenceAssets` y `sourcePrivacy` | `guards` | tests | B0 | pendiente | PLAN-B.md §8.4 | | guardrails 6 y 7; antes de escribir contenido |
| Entrada (UTM + slug) | `entry` | atribución | B7 | pendiente | `b-04b-ad-destination-urls.png` | | URL cortada: verificar |
| 01 (delta) | `intro` | intro | B1 | pendiente | `b-05-intro-variants.png` | | titular "Let's see if we're a match." |
| 17 (v2) | `science` | inter | B1 | pendiente | `b-16-claims-quiz.png` | | reabierto: prensa + "Join over 30 million {{audience}}" (C1, C2); reemplaza `I-29` |
| 26 (v2) | `not_alone` | inter | B1 | pendiente | `b-16-claims-quiz.png` | | reabierto: cifra (C1); reemplaza `I-29` |
| 30 (delta + v2) | `evidence` | inter | B1 | pendiente | `b-16-claims-quiz.png`, `b-06-evidence-variants.png` | | reabierto: universidades (C3) + frase final según perfil |
| 31 (v2) | `expert` | inter | B1 | pendiente | `b-16-claims-quiz.png` | | reabierto: tarjeta del revisor (C4); reemplaza `I-29` |
| 36 (delta) | `summary` | summary | B1 | pendiente | `b-07-summary-b.png` | | valores según §6.4; medidor honesto |
| 37 (v2) | `loader` | loader | B1 | pendiente | `b-17-loader-testimonials.png`, `b-17b-loader-questions.png` | | reabierto: los tres testimonios (C6) en lugar de las notas propias (`I-33`) |
| 41 | `pwyw` | pwyw | B2 | pendiente | `b-08-pwyw.png` | | la nota del costo (C8) se renderiza |
| 42a | `plan_sheet` (contenedor + carga) | plan_sheet | B3 | pendiente | `b-anim-02-sheet-loading.png` | | objetivo < 1.5 s |
| 42b | `sheet_header` (contador + línea + barra fija) | plan_sheet | B3 | pendiente | `b-10-sheet-top.png` | | contador sólo con `paywall.countdown.enabled`; vencimiento real |
| 42c | `sheet_compare` (NOW vs GOAL) | plan_sheet | B4 | pendiente | `b-10-sheet-top.png` | | reglas propuestas §6.4 |
| 42d | `sheet_ticket_plan` (cupón + banner + plan) | plan_sheet | B4 | pendiente | `b-11-sheet-plan.png` | | cálculos §6.3; tachado sólo con `listPrice` real |
| 42e | `sheet_legal_benefits_faq` | plan_sheet | B4 | pendiente | `b-13-sheet-legal-benefits.png` | | legal dinámico y legible |
| 42f | `sheet_reviews_expert_letter` | plan_sheet | B4 | pendiente | `b-15-sheet-expert-letter.png`, `b-19-sheet-social-proof.png` | | reseñas (C7), revisor (C4), premios (C5), prensa (C2) renderizados |
| 42g | `gift_modal` | overlay | B5 | pendiente | `b-09-gift-reveal.png` | | `prefers-reduced-motion`; descuento real |
| 42h | `payment_block` | plan_sheet | B6 | pendiente | `b-12-sheet-payment.png` | | MockCheckoutProvider; resumen del cobro junto al botón |
| 42i | `sheet_order` (orden y espacios de la hoja) | plan_sheet | B4 | pendiente | `b-18-sheet-fullpage.png` | | Apéndice B de PLAN-B.md |

## Resumen por fase (variante B)

| Fase | Descripción | Estado |
|---|---|---|
| B0 | Decisiones, flag `funnel.closing`, config y guardias | pendiente |
| B1 | Guardrails v2 en el quiz (#17, #26, #30, #31, #37) y deltas (#01, #30, #36) | pendiente |
| B2 | Página *Pay what you want* (#41) | pendiente |
| B3 | Hoja de plan: contenedor, carga, cabecera, contador | pendiente |
| B4 | Secciones de la hoja | pendiente |
| B5 | Modal del regalo y descuento | pendiente |
| B6 | Pago (mock) y *Start Now* | pendiente |
| B7 | Atribución, slugs y analytics | pendiente |
| B8 | QA, accesibilidad, rendimiento, responsive | pendiente |

## Decisiones nuevas (registradas en DECISIONS.md)

| ID | Tema | Default propuesto (v2) | Decisión final |
|---|---|---|---|
| D3 (v2) | Claims, credenciales y testimonios | Se renderizan (PLAN-B.md §3.3), sin flags ni `claimRef` | Guardrails 2 y 3 (v2) |
| D9 | Cierre principal (pwyw vs paywall) | Ambos tras `funnel.closing`; empezar por `pwyw` | |
| D10 | Modelo *Pay what you want* | Importes configurables; con la nota del costo (C8); preseleccionado el más popular | |
| D11 | Regalo, cupón y contador | Tres regalos con el mismo resultado (`count = 1` alternativo); descuento real; contador tras `paywall.countdown.enabled` | |
| D12 | Precios, moneda y periodicidad | Demo vía MockCheckoutProvider; tachado sólo con `listPrice` real | |
| D13 | Prueba social y reglas del perfil | Renderizar todo; reglas "inferido" | |
| D14 | Atribución, slugs, idiomas, píxel | UTM + slug por idioma; ES después; sin píxel sin consentimiento | |
| D15 | ¿Investigación en la Biblioteca de anuncios? | Fuera de alcance | |
