# `src/ui`: design-system components

Every component is a folder with `Name.tsx`, `Name.module.css`, `Name.test.tsx` and an `index.ts`.
Import from the barrel (`import { Card, Button } from '@/ui'`). All values come from the tokens in
`src/styles/tokens.css` (PLAN section 4); never hard-code a colour, measure or duration here.

| Component                       | Purpose                                                                                                   |
| ------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `PageShell`                     | Full-viewport background by `theme` (`lilac`, `soft`, `dark`, `warm`, `white`); centres its child.        |
| `Card`                          | The 375 x (viewport - 62) column, radius 32. Full-bleed below 480px. `variant="bare"` drops the look.     |
| `Header`, `Logo`, `ProgressBar` | Logo at +42, progress bar (0 to 1) at +75. The logo is an original placeholder (`TODO(content)`).         |
| `QuizLayout`, `QuestionTitle`   | Vertical structure of question screens: `align="top"` (single) or `"center"` (multi), title at +124.      |
| `Button`                        | `primary`, `disabled`, `loading` ("Please wait..."), `white`; arrow stretches on hover, focus and press.  |
| `OptionCard` + `RadioGroup`     | Single-select: 333 x 72 radios in a `radiogroup`, roving tab stop, arrows move focus, Enter/Space select. |
| `CheckboxRow` + `CheckboxGroup` | Multi-select rows, 325 x 56, `role="checkbox"`, Space toggles.                                            |
| `Modal`                         | Portal dialog: `size="sheet"` (375 x 648) or `"checkout"` (max 430 x 630), focus trap, ESC, scroll lock.  |
| `StepTransition`                | Fades the content of the card between steps: out 400 ms, gap 150 ms, in 300 ms. `onSwap`, `onEntered`.    |

## Conventions worth knowing

- **Forced states for QA.** `OptionCard`, `CheckboxRow` and `Button` accept `data-state="hover"` or
  `"pressed"` to render that look without a pointer (used by the gallery).
- **Option label position.** `--option-label-align` (default `flex-end`, bottom left; decision D5).
  Set it to `center` to centre labels; no component changes are needed.
- **Reduced motion.** Durations are tokens that shrink under `prefers-reduced-motion`; components
  must use `var(--motion-*)` and never literal durations. `StepTransition` reads the same media query
  for its JS timers (`getStepTiming`).
- **Focus.** The global `:focus-visible` ring (`--focus-ring-*`) is the only focus style. Do not set
  `outline: none`.
- **Focus after a step change.** `StepTransition` unmounts the old content, so focus falls back to the
  document. The screen that owns the step should move focus to its heading (for example from
  `onEntered`).
- **Gallery.** `/__gallery`, `/__gallery/quiz-single` and `/__gallery/quiz-multi` show everything.
  They 404 in production unless the dev-tools switch is on (see `src/app/gallery/README.md`).
- **Server and client components.** Components that use hooks, context, effects, portals or define
  event handlers start with `'use client'` (`Button`, `OptionCard`, `RadioGroup`, `RadioGroupContext`,
  `CheckboxRow`, `Modal`, `StepTransition`); purely presentational ones (`Card`, `PageShell`,
  `Header`, `Logo`, `ProgressBar`, `QuizLayout`, `QuestionTitle`, `CheckboxGroup`) work in server
  components. Keep non-component values (constants, helpers) out of `'use client'` files so server
  code can still import them, as `StepTransition/timing.ts` does.
