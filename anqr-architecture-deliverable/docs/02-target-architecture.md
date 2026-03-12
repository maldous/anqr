# 02. Target architecture

## Architecture style

Use a **capability-oriented modular frontend** with explicit layering.

This is not a strict backend-style onion architecture. It is a frontend architecture with:

- **presentation** at the edges
- **feature/application orchestration** in the middle
- **domain services and models** at the core
- **adapters** for browser/native/worker boundaries
- **cross-cutting technical services** kept separate from product logic

## Top-level structure

```text
src/
  app/
    boot/
    shell/
    routing/
    pages/
    i18n/
    search/

  ui/
    primitives/
    composites/
    hooks/

  features/
    generator/
      components/
      hooks/
      application/
      model/
    analyze/
      components/
      hooks/
      application/
      model/
    gallery/
      components/
      application/
      model/
    share/
      components/
      application/
      model/
    onboarding/
      components/
    monetization/
      components/
      application/

  state/
    model/
    stores/
    selectors/

  domain/
    qr/
      spec/
      encode/
      decode/
      analyze/
      qart/
    render/
      primitives/
      color/
      dither/
      filters/
      overlay/
      animation/
      generator/
      export/
    payload/
      generators/
      parsers/
      serializers/
      model/
    share/
      model/

  platform/
    browser/
      canvas/
      clipboard/
      io/
      boot/
    native/
      ads/
      media-store/
      notifications/
    worker/
      analyze/
      qart/

  infra/
    logging/
    telemetry/
    diagnostics/
    testing/
    utilities/

  content/
    gallery/
    i18n/
    generated/
```

## Layer responsibilities

### `app/`

Owns bootstrap, shell composition, routing, static pages, global providers, and runtime initialisation.

Allowed to know:

- `features`
- `ui`
- `state`
- `infra`
- `platform`
- `content`

Must not become:

- a second feature layer
- a domain logic sink

### `ui/`

Owns generic visual primitives and purely presentational composites.

Allowed to know:

- other `ui` modules
- narrow styling helpers

Must not know:

- QR domain concepts
- browser/native adapters
- state stores
- feature-specific orchestration

### `features/`

Own user-facing workflows and orchestration.

Examples:

- generator configuration workflow
- analysis workflow
- gallery browsing
- sharing flow
- onboarding
- monetization UX

Allowed to know:

- `ui`
- `state`
- `domain`
- `platform`
- `infra`
- `content`

Must not know:

- implementation details of other features

### `state/`

Own shared application state, selectors, reducers/stores, and workflow state models.

Allowed to know:

- `domain`
- `infra`

Must not know:

- `ui`
- `app`
- `platform`

### `domain/`

Own QR rules, rendering algorithms, payload generation, analysis, QArt, and share semantics.

Allowed to know:

- other domain submodules where explicitly allowed
- `infra` for narrow abstractions such as logging interfaces if absolutely needed

Must not know:

- React
- browser APIs
- native APIs
- worker APIs
- application pages/components

### `platform/`

Own concrete adapters to browser, native shell, worker runtime, and other environment boundaries.

Allowed to know:

- `domain`
- `infra`

Must not know:

- `ui`
- `features`
- `app`

### `infra/`

Own technical services that are not domain logic:

- logging
- telemetry
- diagnostics
- test utilities
- general low-level helpers that remain cross-cutting after decomposition

Must not become:

- a second domain layer
- a place for business logic

### `content/`

Own static/generated resources:

- gallery manifests
- generated showcase files
- i18n static assets

Executable code should not live here unless it is a tiny loader/index.

## Directory naming standards

### Allowed names

Prefer names that express ownership and capability:

- `generator`
- `overlay`
- `payload`
- `analyze`
- `export`
- `clipboard`
- `notifications`
- `logging`

### Disallowed generic names

Avoid introducing or preserving new generic sinks:

- `core`
- `common`
- `helpers`
- `misc`
- `utils`
- `types`

These names are only acceptable if they are inside a bounded context and narrow in scope, for example:

- `src/domain/qr/encode/types.ts`
- `src/domain/render/dither/utils.ts`

## Public API standard

Each bounded context may expose **one narrow entry point** at its root if needed.

Examples:

- `src/domain/qr/encode/index.ts`
- `src/platform/browser/clipboard/index.ts`

Do not recreate:

- root-level `src/modules/index.ts`
- cross-context public barrels
- shared `api.ts` files that aggregate unrelated concerns

## File naming conventions

- `*.types.ts` — type-only contracts, local to a bounded context
- `*.model.ts` — stable domain or state models
- `*.service.ts` — orchestration or application service
- `*.adapter.ts` — environment adapter
- `*.client.ts` — worker or remote boundary client
- `*.store.ts` — state store only
- `*.selector.ts` — selectors only
- `*.serializer.ts` — payload or data serializers only

## Testing placement

Prefer colocated tests next to the owning module:

```text
src/domain/qr/encode/encoder.ts
src/domain/qr/encode/encoder.spec.ts
```

For broader flow tests, use a dedicated top-level `tests/` directory.

## Ownership principle

Every file must have a single primary owner:

- app
- ui
- one feature
- one domain subcontext
- one platform adapter group
- one infra group
- content

If a file cannot be assigned to one owner with confidence, it is a split candidate.
