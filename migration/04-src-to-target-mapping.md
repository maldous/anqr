# 04. Exact `src/` to target mapping

This file is the primary ownership map for dissolving the monolith.

## 4.1 `src/app/*`

### Target

Mostly `apps/web/src/*`

### Mapping

- `src/app/boot/*` -> `apps/web/src/boot/*`
- `src/app/shell/*` -> `apps/web/src/shell/*`
- `src/app/routing/*` -> `apps/web/src/routing/*`
- `src/app/seo/*` -> `apps/web/src/seo/*`
- `src/app/pages/*` -> `apps/web/src/pages/*`
- `src/app/search/*` -> `apps/web/src/search/*`
- `src/app/i18n/*` -> `apps/web/src/i18n/*`

### Rule

Do not move `src/app/*` into packages unless the module is no longer delivery-specific.

## 4.2 `src/ui/*` and `src/components/*`

### Target

Primarily `packages/ui/web/*`

### Rule

- generic primitives and composites go to `packages/ui/web`
- feature-specific screen composition stays in `apps/web/src/features/*`
- no domain logic survives in these roots

## 4.3 `src/domain/*`

### Target

`packages/domain/*`

### Mapping

- `src/domain/payload/*` -> `packages/domain/payload`
- `src/domain/share/*` -> `packages/domain/share`
- `src/domain/render/*` -> `packages/domain/render`
- `src/domain/qr/spec/*` -> `packages/domain/qr`
- `src/domain/qr/encode/*` -> `packages/domain/qr`
- `src/domain/qr/decode/*` -> `packages/domain/qr`
- `src/domain/qr/qart/*` -> `packages/domain/qr`
- `src/domain/qr/analyze/*` -> `packages/domain/analyze`

### Rule

`packages/domain/*` stays runtime-agnostic.

## 4.4 `src/features/*`

### Split rule

Current `src/features/*` is mixed between application orchestration and delivery/UI composition.

### Mapping

- `src/features/generator/application/*` -> `packages/application/generator`
- `src/features/generator/model/*` -> `packages/application/generator` when orchestration/domain-state oriented, otherwise `apps/web/src/state` if delivery-only
- `src/features/generator/components/*` -> mostly `apps/web/src/features/generator/*`, with shared widgets moving to `packages/ui/web`
- `src/features/generator/hooks/*` -> `apps/web/src/features/generator/hooks/*` if view hooks, or `packages/application/generator` if orchestration
- `src/features/generator/search/*` -> `apps/web/src/features/generator/search/*` unless generalized
- `src/features/analyze/lib/*` -> `packages/application/analyze`
- `src/features/analyze/components/*` -> `apps/web/src/features/analyze/*` with generic widgets promoted to `packages/ui/web`
- `src/features/gallery/*` -> split between `packages/application/gallery` and `apps/web/src/features/gallery/*`
- `src/features/onboarding/*` -> split between `packages/application/onboarding` and `apps/web/src/features/onboarding/*`
- missing/implicit monetization concerns -> create `packages/application/monetization` contract first, then move only once ownership is proven

## 4.5 `src/platform/*`

### Target

`packages/platform/*`

### Mapping

- `src/platform/browser/*` -> `packages/platform/browser`
- `src/platform/native/*` -> `packages/platform/native`
- `src/platform/worker/*` -> `packages/platform/worker`
- node-specific logic currently outside `src/platform` but runtime-specific -> `packages/platform/node`

## 4.6 `src/infra/*`

### Target

`packages/observability/*` and package-local infra helpers

### Mapping

- `src/infra/logging/*` -> `packages/observability/logging`
- `src/infra/telemetry/*` -> `packages/observability/telemetry`
- Sentry-specific logging/telemetry surfaces -> `packages/observability/sentry`
- `src/infra/testing/*` -> `packages/testing/*` by responsibility

## 4.7 `src/content/*`, `src/data/*`, `src/i18n/*`

### Target

Mostly app-local delivery/content roots, not core packages.

### Mapping

- `src/content/gallery/*` -> `apps/web/src/content/gallery/*`
- `src/content/generated/*` -> `apps/web/src/content/generated/*`
- `src/data/*` -> fold into `apps/web/src/content/*` or `packages/application/gallery` only when the content becomes a reusable contract
- `src/i18n/*` -> `apps/web/src/i18n/*`
- static binary assets remain in `public/*`

## 4.8 `src/state/*`

### Target

App-local state or application package contracts

### Mapping

- app delivery state -> `apps/web/src/state/*`
- reusable orchestration state -> `packages/application/*`

### Rule

Do not preserve `src/state` as a forever-root once extraction is done.

## 4.9 `src/store/*`

### Rule

This is a broad legacy bucket and must be dissolved.

### Mapping

- stateful delivery store modules -> `apps/web/src/state/*`
- payload serializer logic -> `packages/domain/payload` or `packages/application/generator`
- no `packages/store` target is allowed

## 4.10 `src/modules/*`

### Rule

This is a legacy umbrella root and must be retired, not recreated.

### Mapping principle

Move by actual ownership:

- QR encode/decode/spec/qart -> `packages/domain/qr` or `packages/domain/analyze`
- render/dither/overlay/export/animation -> `packages/domain/render`
- browser clipboard/io -> `packages/platform/browser`
- share-links -> `packages/domain/share` or `packages/application/generator`
- payload-generators -> `packages/domain/payload`
- analyzer wrappers -> `packages/domain/analyze`
- generic `core`/`platform` legacy leaves must be redistributed, not preserved as new package names

## 4.11 `src/lib/*`, `src/hooks/*`, `src/types/*`

### Rule

Do not create `packages/lib`, `packages/hooks`, or `packages/types`.

### Mapping

- generic UI hooks -> `packages/ui/web`
- feature hooks -> app-local feature roots or `packages/application/*`
- helper utilities -> nearest owner package/app
- loose types -> nearest owner package/app
