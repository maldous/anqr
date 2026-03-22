# ANQR 1.0 Architecture Standards

## Architecture style

- Capability-oriented modular frontend
- Explicit layered architecture
- Separation between:
  - presentation
  - application orchestration
  - domain logic
  - environment adapters
  - cross-cutting infrastructure

## Repository Topology

```
apps/           deployable application targets
packages/       shared architecture packages
src/            transitional monolith (being decomposed)
tests/          integration, smoke, and scenario tests
tools/          local operating engine
netlify/        serverless functions and edge functions
docs/           governance and doctrine
android/        native Android build scaffold (Capacitor)
ios/            native iOS build scaffold (Capacitor)
```

See `docs/02-repo-skeleton.md` for the full target tree.

### apps/

**Purpose:**

- deployable application targets
- thin shells that compose packages

| Directory      | Description                                                            |
| -------------- | ---------------------------------------------------------------------- |
| `apps/web/`    | Vite SPA — primary web application                                     |
| `apps/api/`    | API surface (future — current serverless functions live in `netlify/`) |
| `apps/mobile/` | Capacitor mobile shell                                                 |

**Allowed dependencies:**

- `packages/*`

**Must not:**

- contain domain logic
- import from other apps
- import from `src/` (post-extraction)

### packages/

**Purpose:**

- shared reusable architecture
- target location for code extracted from `src/`

| Package                   | Subdirectories                                        | Layer                 |
| ------------------------- | ----------------------------------------------------- | --------------------- |
| `packages/contracts/`     | generator                                             | contracts             |
| `packages/domain/`        | qr, render, payload, analyze, share                   | domain                |
| `packages/application/`   | generator, analyze, gallery, onboarding, monetization | application           |
| `packages/ui/`            | web, mobile, design-tokens                            | ui                    |
| `packages/platform/`      | browser, node, native, worker                         | platform              |
| `packages/observability/` | logging, telemetry, sentry                            | infra                 |
| `packages/analytics/`     | ga4, ads                                              | infra                 |
| `packages/testing/`       | fixtures, fakes, contracts, parity, playwright        | testing (non-runtime) |
| `packages/config/`        | eslint, tsconfig, depcruise, build                    | tooling (non-runtime) |

**Rules:**

- inter-package dependencies follow the same layer rules as `src/`
- each package exposes a narrow public API via its root `index.ts`

### packages/contracts/

**Purpose:**

- portable, stable boundary definitions
- shared language across app, worker, node, web, and tests

**Allowed dependencies:**

- other contract packages through their root entrypoints
- narrow domain-owned type surfaces when the domain package is the canonical owner

**Must not:**

- contain stores, UI state, or delivery-specific state adapters
- contain import/update/patch/workflow orchestration
- contain helpers, factories, services, or runtime adapters
- depend on application, ui, platform, apps, config, testing, or operational tooling

**Naming rule:**

- contracts are nouns
- contracts describe shape, not behavior
- filenames should read like boundary language, not workflow steps

### src/ (transitional)

**Status:** inherited production monolith, actively being decomposed.

Code in `src/` is progressively extracted into `packages/` and `apps/`. During transition, `src/` may import from both internal layers and `packages/*`. As extraction completes, `src/` internal imports are replaced with `packages/*` imports until `src/` is fully dissolved.

The layer rules below govern `src/` during the transition period.

### tests/

**Purpose:**

- integration, smoke, and scenario tests that span multiple packages or apps

| Directory          | Description                       |
| ------------------ | --------------------------------- |
| `tests/unit/`      | cross-cutting unit test bootstrap |
| `tests/smoke/`     | post-deploy smoke tests           |
| `tests/scenarios/` | multi-step integration scenarios  |

Colocated `*.spec.ts` files remain preferred for package-level and feature-level unit tests.

### scripts/ops/

**Purpose:**

- local operating engine — not deployed to production
- all automation scripts executed by systemd timers or manually

| Directory / File                                     | Description                                           |
| ---------------------------------------------------- | ----------------------------------------------------- |
| `scripts/ops/symphony-runner.mjs`                    | execution orchestrator (picks issues, runs agent)     |
| `scripts/ops/symphony-agent.mjs`                     | tool-calling AI agent (Ollama)                        |
| `scripts/ops/symphony-config.mjs`                    | centralized queue/execution config                    |
| `scripts/ops/symphony-credit-gate.mjs`               | provider cascade (credit gate)                        |
| `scripts/ops/symphony-queue-control.mjs`             | queue feeder, drain, enforcement                      |
| `scripts/ops/symphony/WORKFLOW.md`                   | agent system prompt (versioned)                       |
| `scripts/ops/linear-client.mjs`                      | Linear API helpers                                    |
| `scripts/ops/linear-guardian.mjs`                    | rule-based issue management                           |
| `scripts/ops/harness-report.mjs`                     | deterministic health checks                           |
| `scripts/ops/nightly-ops-pass.mjs`                   | nightly orchestration pipeline                        |
| `scripts/ops/notify.mjs`                             | notification dispatch (stdout + email)                |
| `scripts/ops/lib/notify.mjs`                         | email helper (msmtp + rate limiting)                  |
| `scripts/ops/email-ingest.mjs`                       | email-to-issue ingest (mbsync + notmuch)              |
| `scripts/ops/ollama-local-audit.mjs`                 | root compatibility shim for model health verification |
| `scripts/ops/integrations/model/litellm-config.yaml` | local model aliases                                   |
| `scripts/ops/model-injector-proxy.py`                | root compatibility shim for request normalization     |

**Rules:**

- no production dependency constraints
- must not be imported by `apps/`, `packages/`, or `src/`
- systemd units in `services/systemd/` reference these scripts directly

### netlify/

**Purpose:**

- serverless functions and edge functions deployed to Netlify

| Directory                 | Description                                     |
| ------------------------- | ----------------------------------------------- |
| `netlify/functions/`      | server-side QR rendering, background processing |
| `netlify/edge-functions/` | SEO and request-time transformations            |

**Allowed dependencies:**

- `packages/domain`
- `packages/platform/node`
- `packages/observability`

### android/, ios/

Native mobile build scaffolds (Capacitor). Configuration and build files only — no application logic.

Target location is `apps/android/` and `apps/ios/` per `docs/02-repo-skeleton.md`; currently at root level during transition.

### docs/

| Directory         | Description                            |
| ----------------- | -------------------------------------- |
| `docs/program/`   | program charter, definitions, policies |
| `docs/discovery/` | technical discovery and analysis       |
| `docs/standards/` | architecture and engineering standards |
| `docs/adr/`       | architecture decision records          |

## Layer Structure

> The following layers describe the internal structure of `src/`. These same
> layer rules apply to the corresponding `packages/` once code is extracted.

```
src/
  app/
  ui/
  features/
  state/
  domain/
  platform/
  infra/
  content/
```

## Layer Responsibilities

### app/

**Purpose:**

- bootstrap
- routing
- shell composition
- runtime initialization

**Allowed dependencies:**

- features
- ui
- state
- infra
- platform
- content

**Must not:**

- contain domain logic
- become a second feature layer

### ui/

**Purpose:**

- visual primitives
- presentational components

**Allowed:**

- ui modules
- styling helpers

**Forbidden:**

- QR domain logic
- browser/native adapters
- state stores
- feature orchestration

### features/

**Purpose:**

- user workflows
- application orchestration

**Examples:**

- generator
- analyze
- gallery
- share
- onboarding
- monetization

**Allowed:**

- ui
- state
- domain
- platform
- infra
- content

**Must not:**

- depend on implementation details of other features

### state/

**Purpose:**

- shared application state
- stores
- selectors
- workflow models

**Allowed:**

- domain
- infra

**Forbidden:**

- ui
- app
- platform

### domain/

**Purpose:**

- QR rules
- rendering algorithms
- payload generation
- analysis
- QArt logic

**Allowed:**

- other domain modules
- infra abstractions

**Forbidden:**

- React
- browser APIs
- native APIs
- worker APIs
- application components

### platform/

**Purpose:**

- environment adapters

**Examples:**

- browser
- native
- worker

**Allowed:**

- domain
- infra

**Forbidden:**

- ui
- features
- app

### infra/

**Purpose:**

- technical cross-cutting services

**Examples:**

- logging
- telemetry
- diagnostics
- testing utilities
- low-level helpers

**Rules:**

- no domain logic
- not a second domain layer

### content/

**Purpose:**

- static resources

**Examples:**

- gallery manifests
- generated assets
- i18n

**Rules:**

- no executable logic (except tiny loaders)

## Naming Standards

### Allowed directory names

- generator
- overlay
- payload
- analyze
- export
- clipboard
- notifications
- logging

### Disallowed generic sinks

- core
- common
- helpers
- misc
- utils
- types

**Allowed only if scoped:**

- `domain/qr/encode/types.ts`
- `domain/render/dither/utils.ts`

## Public API Rules

Each context may expose one entrypoint.

- `domain/qr/encode/index.ts`
- `platform/browser/clipboard/index.ts`

**Avoid:**

- `src/modules/index.ts`
- cross-context barrels
- global `api.ts` aggregators

## File Naming Standards

```
*.types.ts       type contracts
*.model.ts       stable domain models
*.service.ts     orchestration
*.adapter.ts     environment adapters
*.client.ts      worker/remote clients
*.store.ts       state store
*.selector.ts    selectors
*.serializer.ts  data serialization
```

## Test Placement

**Preferred:**

```
src/domain/qr/encode/encoder.ts
src/domain/qr/encode/encoder.spec.ts
```

**Integration / flow tests:**

```
tests/
```

## Ownership Principle

Every file must have exactly one owner.

- app
- ui
- feature
- domain subcontext
- platform adapter group
- infra group
- content

If ownership is unclear → split candidate.
