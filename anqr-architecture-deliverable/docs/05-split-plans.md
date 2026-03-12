# 05. Split plans

This document covers the critical split-required files that must be decomposed before the architecture can be considered stable.

The companion machine-readable manifests are in `manifests/symbol-splits/`.

## 5.1 `src/App.tsx`

### Current responsibilities

- shell composition
- lazy page loading
- page resolution
- SEO/head updates
- URL parameter import and application to generator state
- mobile split persistence
- tier/output/overlay/render/animation/watermark/application of URL params

### Target decomposition

```text
src/app/shell/AppShell.tsx
src/app/routing/page-resolution.ts
src/app/seo/head-links.ts
src/features/generator/application/url-import/apply-payload-params.ts
src/features/generator/application/url-import/apply-encoding-params.ts
src/features/generator/application/url-import/apply-render-params.ts
src/features/generator/application/url-import/apply-overlay-params.ts
src/features/generator/application/url-import/apply-animation-params.ts
src/features/generator/application/url-import/apply-output-params.ts
src/features/generator/application/url-import/apply-safety-and-metadata-params.ts
src/features/generator/model/mobile-split.ts
```

### Rule

`AppShell` may compose pages and dispatch URL import services, but it must not permanently own parameter-application logic.

## 5.2 `src/hooks/useQRGenerator.ts`

### Current responsibilities

- React hook and provider
- QArt worker orchestration
- export configuration
- watermark application
- animation frame generation
- fallback logic and safety adjustment
- overlay file loading
- performance measurement
- canvas conversion helpers

### Target decomposition

```text
src/features/generator/hooks/useQRGenerator.ts
src/features/generator/application/generation/qart-worker-orchestrator.ts
src/features/generator/application/generation/fallback-strategy.ts
src/features/generator/application/generation/safety-adjustments.ts
src/features/generator/application/generation/frame-pipeline.ts
src/features/generator/application/export/export-pipeline.ts
src/features/generator/application/input/overlay-file-loaders.ts
src/infra/telemetry/performance-marks.ts
src/domain/render/animation/pattern-effects.ts
```

### Rule

The hook remains a thin controller around application services. It must not remain the home of rendering, export, animation, worker, and safety logic.

## 5.3 `src/components/Analyze.tsx`

### Current responsibilities

- page/screen composition
- analysis input handling
- reproduction logic
- formatter helpers
- analysis widgets and mini-components
- export to JSON
- import back into generator
- scanning cached animation frames

### Target decomposition

```text
src/features/analyze/components/AnalyzeScreen.tsx
src/features/analyze/components/sections/*
src/features/analyze/components/widgets/*
src/features/analyze/application/analysis-input.ts
src/features/analyze/application/reproduction.ts
src/features/analyze/application/export-analysis-json.ts
src/features/analyze/application/import-into-generator.ts
src/features/analyze/application/frame-scan.ts
src/features/analyze/model/descriptions.ts
src/features/analyze/model/formatters.ts
```

### Rule

UI widgets and application orchestration must not remain in one screen file.

## 5.4 `src/store/qr-store.ts`

### Current responsibilities

- state store
- product taxonomy
- enums for QR/render/animation/output
- payload helper types
- payload serializers

### Target decomposition

```text
src/state/stores/qr-generator.store.ts
src/state/model/qr-state.ts
src/domain/qr/model/*
src/domain/render/model/*
src/domain/payload/model/*
src/domain/payload/serializers/*
src/features/monetization/model/tier.ts
```

### Rule

State owns state shape and state transitions only. Domain enums, payload helper definitions, and serializers move to their owning contexts.

## 5.5 `src/modules/qr-generator/qr-generator-class.ts`

### Current responsibilities

- QR generation orchestration
- scan-gate loops
- decode rescue passes
- robustness scenarios
- overlay complexity
- cache key construction
- raster roundtrip checks
- direct decoder coupling

### Target decomposition

```text
src/domain/render/generator/QRGenerator.ts
src/domain/render/generator/scan-gate.ts
src/domain/render/generator/scan-rescue-patches.ts
src/domain/render/generator/overlay-complexity.ts
src/domain/render/generator/cache-keys.ts
src/domain/render/generator/matrix-wrappers.ts
src/domain/render/generator/robustness.ts
```

### Rule

Keep `QRGenerator` as the façade and move loops, rescue logic, and metrics into explicit collaborators.

## 5.6 `src/modules/qr-generator/types.ts`

### Current responsibilities

- generator config
- canvas types
- overlay types
- pixel/matrix types
- cross-context render contracts

### Target decomposition

```text
src/domain/render/generator/types.ts
src/domain/render/overlay/types.ts
src/platform/browser/canvas/types.ts
src/domain/qr/model/qr-instance.ts
```

### Rule

Do not create another single type gravity well.

## 5.7 `src/lib/utils.ts`

### Current responsibilities

- currently only `cn`, but the file name invites future dumping

### Target decomposition

Rename by actual responsibility. If it remains only `cn`, move it to:

```text
src/ui/primitives/cn.ts
```

or, if reused outside UI styling:

```text
src/infra/utilities/classnames.ts
```

### Rule

The file must not continue as `utils.ts`.

## 5.8 `src/components/Header.tsx`

### Current responsibilities

- navigation
- page selection
- gallery filter behaviour
- share configuration building
- generator settings serialisation
- tier/ad gating interactions

### Target decomposition

```text
src/app/shell/Header.tsx
src/app/shell/navigation/*
src/features/share/application/build-header-share-config.ts
src/features/generator/application/header/build-header-settings.ts
src/features/gallery/application/header-gallery-filter.ts
src/features/monetization/application/change-tier-with-ad-gate.ts
```

### Rule

Header UI stays in the shell. Business logic for share, tiering, and generator state leaves the component.

## Split execution pattern

For each split:

1. create destination files
2. move pure helpers and constants first
3. move types and models second
4. move application services third
5. leave the original file as a short façade temporarily
6. remove the façade once imports are updated
