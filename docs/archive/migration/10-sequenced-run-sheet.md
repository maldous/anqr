# 10. Sequenced run sheet

This is the exact migration order.

## Phase 0 — freeze the baseline

- confirm current tree and clean working state
- confirm validations are green
- do not start by moving source code

## Phase 1 — lay down target contracts

- extract this bundle
- create/refresh `README.md` contracts at:
  - root
  - `apps/*`
  - `packages/*`
  - `packages/*/*`
  - `harness/ops/*`
  - `netlify/*`
  - `src/*` transitional roots
  - `tests/*`
  - `services/systemd`
  - `android`, `ios`, `public`, `reports`, `vite-config`

## Phase 2 — make root config monorepo-ready

- update `package.json`
- add workspace declarations
- add split scripts
- add root `tsconfig.base.json` and split tsconfigs
- expand lint/boundary/depcruise/sonar/test config scopes

## Phase 3 — contract-separate the harness

- create internal harness subdirectories under `harness/ops/`
- move implementations into contract subdirectories
- keep top-level public entry shims stable
- keep systemd and root scripts working

## Phase 4 — extract observability and platform packages first

- move logging/telemetry/sentry into `packages/observability/*`
- move browser/native/worker adapters into `packages/platform/*`
- rewrite imports from `src/*` consumers

## Phase 5 — extract domain packages

- `packages/domain/payload`
- `packages/domain/share`
- `packages/domain/render`
- `packages/domain/qr`
- `packages/domain/analyze`

Delete legacy duplicates only after imports are rewritten and green.

## Phase 6 — extract application packages

- generator orchestration
- analyze orchestration
- gallery orchestration
- onboarding orchestration
- monetization scaffolds if not yet implemented

## Phase 7 — create thin app shells

### `apps/web`

Take:

- boot
- shell
- routing
- seo
- pages
- app-local state
- feature screen composition
- content rendering
- i18n integration

### `apps/mobile`

Create shell contract and move only delivery-specific mobile composition.

### `apps/api`

Create contract only; keep netlify live until package extraction has made the API thin.

## Phase 8 — thin netlify

- keep handlers
- move implementation into packages
- convert handlers to package composition only

## Phase 9 — retire broad legacy roots

Dissolve:

- `src/modules`
- `src/store`
- `src/lib`
- `src/hooks` only after redistributed
- any duplicated `src/data` vs `src/content` surfaces

## Phase 10 — converge native shells

Only after app/package extraction is stable:

- define `apps/android`
- define `apps/ios`
- move root native scaffolds deliberately

## Phase 11 — dissolve `src`

When all owned code is moved:

- remove remaining `src/*`
- remove `src` from root build and sonar scopes
- remove transitional depcruise/eslint exceptions
