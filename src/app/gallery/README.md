# UI gallery (dev and QA tooling)

Visual QA for the design system. The pages are `src/app/gallery/**`; `next.config.ts` rewrites
`/__gallery/:path*` to `/gallery/:path*` so the URL stays the one of the plan (App Router treats a
folder that starts with an underscore as private, which is why the real folder has no underscores).

**They 404 in production.** Every gallery page calls `notFound()` unless `isDevToolsEnabled()`
(`src/lib/env.ts`) is true: that is the case under `next dev`, and on every Vercel _preview_
deployment (`next.config.ts` derives the switch from `VERCEL_ENV`; set
`NEXT_PUBLIC_ENABLE_DEV_TOOLS=0` on the Preview environment to hide it). The production environment
never enables it. `tests/unit/pages/gallery.test.tsx`, `tests/unit/env.test.ts` and
`tests/unit/nextConfig.test.ts` cover the matrix.

| Route                    | Shows                                                                                                                 |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| `/__gallery`             | Every component in every state: themes, header at 0/20/50/95 %, buttons, options, checkbox rows, modals, transitions. |
| `/__gallery/quiz-single` | Layout twin of reference image `03-quiz-single.png` (Bloom placeholders).                                             |
| `/__gallery/quiz-multi`  | Layout twin of reference image `06-quiz-multi.png` (card A, two rows selected).                                       |

Compare the twins at 1280x720. The viewport minus 62 gives a 375 x 658 card; reference images are
aspect-corrected and scaled by about 1.2346, so compare proportions (tolerance about 3 %), not pixels.
`tests/e2e/gallery.spec.ts` asserts the measures of PLAN 4.3 on both pages.
