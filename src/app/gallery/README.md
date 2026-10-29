# UI gallery (dev and QA tooling)

Visual QA for the design system. The pages are `src/app/gallery/**`; `next.config.ts` rewrites
`/__gallery/:path*` to `/gallery/:path*` so the URL stays the one of the plan (App Router treats a
folder that starts with an underscore as private, which is why the real folder has no underscores).

**Pre-launch visibility.** Every gallery page calls `notFound()` unless `isGalleryEnabled()`
(`src/lib/env.ts`) is true: under `next dev`, and on every Vercel deployment, Production included
(`next.config.ts` turns `NEXT_PUBLIC_SHOW_GALLERY` on for every Vercel build so the owner can look at
the work). At launch set `NEXT_PUBLIC_SHOW_GALLERY=0` on the Production environment: the pages then 404. A production build outside Vercel also 404s. The stricter `isDevToolsEnabled()` (demo content,
step-guard bypass) is unrelated and never opens on Production. `tests/unit/pages/gallery.test.tsx`,
`tests/unit/env.test.ts` and `tests/unit/nextConfig.test.ts` cover the matrix.

| Route                    | Shows                                                                                                                 |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| `/__gallery`             | Every component in every state: themes, header at 0/20/50/95 %, buttons, options, checkbox rows, modals, transitions. |
| `/__gallery/quiz-single` | Layout twin of reference image `03-quiz-single.png` (Bloom placeholders).                                             |
| `/__gallery/quiz-multi`  | Layout twin of reference image `06-quiz-multi.png` (card A, two rows selected).                                       |

Compare the twins at 1280x720. The viewport minus 62 gives a 375 x 658 card; reference images are
aspect-corrected and scaled by about 1.2346, so compare proportions (tolerance about 3 %), not pixels.
`tests/e2e/gallery.spec.ts` asserts the measures of PLAN 4.3 on both pages.
