# Bloom

Bloom is a web onboarding funnel (42 steps: 28 questions, intro, interstitials, a wand interaction,
profile summary, "creating your plan" loader, email and name capture, paywall and checkout modal).
It is being built to reach **functional and visual parity** with a reference funnel that was
analysed frame by frame from a screen recording. Parity means the same screens, order, mechanics,
layout and timings. It does not mean copying the reference's brand, illustrations, claims,
credentials or testimonials.

The plan, the step catalogue and the annotated reference screenshots live in
[`docs/feature-parity/`](docs/feature-parity/). Start with
[`PLAN.md`](docs/feature-parity/PLAN.md) (Spanish); implementation choices are tracked in
[`DECISIONS.md`](docs/feature-parity/DECISIONS.md).

## Stack

Next.js 16 (App Router) with React 19 and TypeScript (strict), hosted on Vercel. CSS Modules for
components plus global tokens in `src/styles/tokens.css`. Fonts (Inter and Source Serif 4,
variable) are self-hosted through `next/font/local`, so no request ever goes to Google Fonts.
Unit tests use Vitest, Testing Library and jsdom; e2e tests use Playwright (Chromium).

## Requirements

- Node.js 20.9 or newer for the app (`next dev`, `next build`, `next start`; Vercel runs 20, 22 or
  24). The unit-test runner (Vitest 5) needs Node 22.12 or newer. Developed on Node 22.22. npm.
- Chromium for the e2e tests. Playwright is pinned to exactly `1.63.0`; never run
  `playwright install` here, the browser is expected to be provided by the environment
  (`PLAYWRIGHT_BROWSERS_PATH`).
- Optional: `export NEXT_TELEMETRY_DISABLED=1` (or run `npx next telemetry disable`) so the Next.js
  CLI sends no anonymous usage data. The e2e dev server already runs with it off.

## Commands

| Command                | What it does                                                               |
| ---------------------- | -------------------------------------------------------------------------- |
| `npm run dev`          | Start the Next dev server (Turbopack, default port 3000; `-- -p 5173`)     |
| `npm run build`        | Production build into `.next/` (type-checks too)                           |
| `npm run start`        | Serve the production build (`-- -p <port>`); the gallery 404s here         |
| `npm run typecheck`    | `next typegen` (route types, `next-env.d.ts`) then `tsc --noEmit`          |
| `npm run lint`         | ESLint flat config: `eslint-config-next` (core-web-vitals + TS) + Prettier |
| `npm run format`       | Format everything with Prettier                                            |
| `npm run format:check` | Check formatting without writing                                           |
| `npm test`             | Run unit and component tests once (Vitest + Testing Library + jsdom)       |
| `npm run test:watch`   | Vitest in watch mode                                                       |
| `npm run e2e`          | Playwright end-to-end tests against `next dev` (Chromium, 1280x720)        |
| `npm run shots`        | Capture one screenshot per step for visual comparison (placeholder)        |

### Dev server, ports and `NEXT_DIST_DIR`

Next refuses to run two dev servers on the same build directory, so parallel work gives each
server its own: `NEXT_DIST_DIR=.next-<tag>` (honoured by `next.config.ts`; default `.next`; the
`.next-*` folders are git-ignored).

`npm run e2e` starts `npx next dev -p <port>` (passing `NEXT_DIST_DIR` through) unless a server
already answers at the base URL (`reuseExistingServer`).

- `E2E_PORT` selects the port (default `5173`). Use a different value for each parallel run so
  runs never share a dev server.
- `BASE_URL` overrides the whole base URL (default `http://localhost:<port>`).

```sh
NEXT_DIST_DIR=.next-a E2E_PORT=5190 npm run e2e
```

The dev server is reachable at `http://localhost:<port>` and `http://127.0.0.1:<port>`
(`allowedDevOrigins` in `next.config.ts`). Any other host, such as a phone on the LAN, must be added
there first: Next blocks its dev resources (HMR) and the page loads but never hydrates.

`next.config.ts` points Next at `tsconfig.next.json` (a one-line shim that extends `tsconfig.json`).
Next rewrites the tsconfig it type-checks with, adding `<distDir>/types/**` to `include`; a config
that extends another is left alone, so `tsconfig.json` is never touched, whatever the distDir.

### The funnel

`/` redirects to the first step, `/s/intro` (307, the query string is kept). Every step has its own
URL, `/s/<stepId>` (ids in `src/funnel/steps.ts`), prerendered at build time; any other id is a 404.
Moving between steps changes the URL with the History API (`pushState`), which Next.js syncs with
`usePathname`, so there is no request per step, the browser's Back goes one step back and a reload
resumes in place. Self-advancing steps (the plan loader, the pre-paywall loading screen) replace
their history entry instead, so Back never lands on them.

- **State** (answers, lead, chosen plan, furthest step reached) lives in a small external store
  persisted to `sessionStorage` (`bloom.funnel.v1`): it survives a reload, is gone when the tab
  closes and is never sent anywhere. The step itself appears once the stored answers are back, so a
  reload never flashes unpersonalised content; the server renders the empty frame of the step.
- **Guard.** A visitor can only be on a step up to the furthest one reached by moving forward; a
  deep link past it (shared URL, stale tab) is sent back there. `?qa` on any step URL skips the
  guard for QA, only where the dev tools are on (`next dev`, Vercel previews), never in production.
- **Copy** is in `src/funnel/copy.en.json` (`{{brand}}`, `{{audience}}` placeholders), separate from
  the step structure in `src/funnel/steps.ts`. Claims that need evidence (user numbers, press,
  universities, expert, testimonials) are off in `src/funnel/claims.ts` and never rendered.
- **Analytics** is a stub adapter (`src/funnel/analytics.ts`): nothing is sent; with the dev tools on,
  events are recorded in `window.__bloomEvents` for QA.

### QA gallery and dev tools

`/__gallery` (and `/__gallery/quiz-single`, `/__gallery/quiz-multi`) show every design-system
component. They exist while `isGalleryEnabled()` (`src/lib/env.ts`) is true: under `next dev` and on
every Vercel deployment, Production included, while the site is pre-launch (see "Deploy on Vercel").
A production build anywhere else returns 404. The riskier QA tooling (the `?qa` step-guard bypass,
the analytics event log) follows the separate `isDevToolsEnabled()`, which is limited to `next dev`
and Vercel previews and never opens on Production.

## Deploy on Vercel

1. Import the GitHub repository in Vercel (New Project).
2. The **Next.js** framework preset is detected automatically; keep the default build command
   (`next build`) and output settings. No `vercel.json` is needed. Node 20, 22 or 24 all work.
3. No environment variable is required. Nothing is deployed from this repository by itself, and the
   code holds no credentials: payments and every other integration are mocks until real
   credentials are supplied.
4. **Pre-launch: the gallery is visible everywhere on Vercel.** Every deployment (Preview and
   Production) serves the funnel at `/` and the UI gallery at `/__gallery` (`next.config.ts` turns
   `NEXT_PUBLIC_SHOW_GALLERY` on for every Vercel build; nothing has to be configured). **At
   launch**, set `NEXT_PUBLIC_SHOW_GALLERY=0` on the Production environment and redeploy so real
   users never see the gallery. The other QA tooling (`?qa`, the event log) is stricter: previews
   only (`NEXT_PUBLIC_ENABLE_DEV_TOOLS=0` hides it there too), never Production.

The app is a normal Next.js server app (no `output: 'export'`), so route handlers such as
`/api/leads` can be added later. Reference images and the `.mkv` recording never ship: images live
only in `docs/`, the recording is ignored by git (see below).

## Folder map

| Path                   | Contents                                                                          |
| ---------------------- | --------------------------------------------------------------------------------- |
| `src/app/`             | App Router: `layout.tsx` (fonts, metadata, global CSS), `icon.svg`                |
| `src/app/s/`           | The funnel: `layout.tsx` (state provider) and `[stepId]/page.tsx` (42 steps)      |
| `src/app/legal/`       | Placeholder Terms, Privacy Policy and Subscription Policy (`TODO(content)`)       |
| `src/app/gallery/`     | QA gallery pages (served as `/__gallery` through a rewrite); 404 in production    |
| `src/lib/`             | Small shared modules (`env.ts`: the two switches)                                 |
| `src/funnel/`          | Funnel engine: step config and copy, store, navigation, progress, `FunnelView`    |
| `src/screens/`         | One module per screen type (single, multi, intro, wand, paywall, ...)             |
| `src/ui/`              | Design-system components (Button, OptionCard, Modal, ...) as CSS Modules          |
| `src/styles/`          | Global design tokens (`tokens.css`) and base styles                               |
| `src/assets/`          | Bloom's own images and illustrations (placeholders marked `TODO(content)`), fonts |
| `tests/unit/`          | Unit and component tests (`*.test.ts(x)`), Vitest setup, `helpers/`               |
| `tests/e2e/`           | Playwright specs                                                                  |
| `scripts/`             | Node scripts (`shots.mjs`)                                                        |
| `docs/feature-parity/` | Plan, reference step catalogue, status tracker, decisions, reference images       |

Use the `@` alias for anything under `src` (`import { Button } from '@/ui/Button'`). It is
configured in `tsconfig.json` (`paths`) and `vitest.config.ts`.

Unit tests may live next to the code as `src/**/*.test.ts(x)` or under `tests/unit/`.
`tests/unit/helpers/nextNavigation.ts` mocks `next/navigation` (`useRouter`, `usePathname`,
`useSearchParams`, `useParams`, `notFound`, `redirect`) for components and pages under test.

### Server and client components

Pages and layouts are server components. A file starts with `'use client'` when it uses hooks,
context, effects, portals or defines event handlers (see `src/ui/README.md` for which components).
Use `next/link` and `next/navigation` for routing, `process.env.NODE_ENV` and `NEXT_PUBLIC_*` for
environment checks (always as literal `process.env.NAME` so Next can inline them).

## Rules to keep

- **Never commit the `.mkv`** screen recording of the reference funnel. It is ignored by
  `.gitignore` and is not part of the repository.
- **Reference images live only in `docs/`.** Never import or copy them into `src/` or `public/`.
- The product is called Bloom. Do not use the reference product's name, logo, illustrations,
  claims, credentials or testimonials (PLAN section 2).
- No real payments and no data sent to third parties: integrations are mocks until credentials
  and the open decisions in DECISIONS.md are provided.
