# UI gallery (dev and QA tooling)

Visual QA for the design system. **Only registered when `import.meta.env.DEV` is true**: the lazy
import in `src/app/routes.tsx` is dropped from production builds, so none of this ships (checked: the
built bundle contains no gallery code or CSS).

| Route                    | Shows                                                                                                                 |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| `/__gallery`             | Every component in every state: themes, header at 0/20/50/95 %, buttons, options, checkbox rows, modals, transitions. |
| `/__gallery/quiz-single` | Layout twin of reference image `03-quiz-single.png` (Bloom placeholders).                                             |
| `/__gallery/quiz-multi`  | Layout twin of reference image `06-quiz-multi.png` (card A, two rows selected).                                       |

Compare the twins at 1280x720. The viewport minus 62 gives a 375 x 658 card; reference images are
aspect-corrected and scaled by about 1.2346, so compare proportions (tolerance about 3 %), not pixels.
`tests/e2e/gallery.spec.ts` asserts the measures of PLAN 4.3 on both pages.
