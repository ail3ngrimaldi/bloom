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

## Requirements

- Node.js 22.12 or newer (developed on Node 22.22) and npm.
- Chromium for the e2e tests. Playwright is pinned to exactly `1.63.0`; never run
  `playwright install` here, the browser is expected to be provided by the environment
  (`PLAYWRIGHT_BROWSERS_PATH`).

## Commands

| Command                | What it does                                                         |
| ---------------------- | -------------------------------------------------------------------- |
| `npm run dev`          | Start the Vite dev server (default port 5173)                        |
| `npm run build`        | Type-check (`tsc -b`) and build for production into `dist/`          |
| `npm run preview`      | Serve the production build locally                                   |
| `npm run typecheck`    | Type-check the app, unit tests, tooling configs and e2e tests        |
| `npm run lint`         | ESLint (flat config, typescript-eslint, react-hooks, react-refresh)  |
| `npm run format`       | Format everything with Prettier                                      |
| `npm run format:check` | Check formatting without writing                                     |
| `npm test`             | Run unit and component tests once (Vitest + Testing Library + jsdom) |
| `npm run test:watch`   | Vitest in watch mode                                                 |
| `npm run e2e`          | Playwright end-to-end tests (Chromium, 1280x720)                     |
| `npm run shots`        | Capture one screenshot per step for visual comparison (placeholder)  |

### End-to-end tests and ports

`npm run e2e` starts `npm run dev -- --port <port> --strictPort` unless a server already answers
at the base URL (`reuseExistingServer`).

- `E2E_PORT` selects the port (default `5173`). Use a different value for each parallel run so
  runs never share a dev server.
- `BASE_URL` overrides the whole base URL (default `http://localhost:<port>`).

```sh
E2E_PORT=5190 npm run e2e
```

## Folder map

| Path                   | Contents                                                                    |
| ---------------------- | --------------------------------------------------------------------------- |
| `src/app/`             | App-level wiring: providers, router, global state                           |
| `src/funnel/`          | Funnel engine: step types, config and copy, store, navigation, progress     |
| `src/screens/`         | One module per screen type (single, multi, intro, wand, paywall, ...)       |
| `src/ui/`              | Design-system components (Button, OptionCard, Modal, ...) as CSS Modules    |
| `src/styles/`          | Global design tokens (`tokens.css`) and base styles                         |
| `src/assets/`          | Bloom's own images and illustrations (placeholders marked `TODO(content)`)  |
| `tests/unit/`          | Unit and component tests (`*.test.ts(x)`), plus the Vitest setup file       |
| `tests/e2e/`           | Playwright specs                                                            |
| `scripts/`             | Node scripts (`shots.mjs`)                                                  |
| `docs/feature-parity/` | Plan, reference step catalogue, status tracker, decisions, reference images |

Use the `@` alias for anything under `src` (`import { Button } from '@/ui/Button'`). It is configured
in `tsconfig.app.json`, `vite.config.ts` (which Vitest also reads).

Unit tests may live next to the code as `src/**/*.test.ts(x)` or under `tests/unit/`.

## Rules to keep

- **Never commit the `.mkv`** screen recording of the reference funnel. It is ignored by
  `.gitignore` and is not part of the repository.
- **Reference images live only in `docs/`.** Never import or copy them into `src/` or `public/`.
- The product is called Bloom. Do not use the reference product's name, logo, illustrations,
  claims, credentials or testimonials (PLAN section 2).
- No real payments and no data sent to third parties: integrations are mocks until credentials
  and the open decisions in DECISIONS.md are provided.
