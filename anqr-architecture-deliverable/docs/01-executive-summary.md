# 01. Executive summary

## Decision

Refactor ANQR to a **capability-oriented frontend modular architecture** with explicit boundaries between:

- presentation (`app`, `ui`)
- feature/application orchestration (`features`, `state`)
- domain logic (`domain`)
- adapters (`platform`)
- cross-cutting technical services (`infra`)
- static/generated resources (`content`)

This is the right target because the inventory shows that the current structure is primarily organized around broad technical folders such as `modules`, but several of those folders are not coherent bounded contexts. The clearest example is `src/modules/qr-generator`, which currently mixes rendering, filtering, overlay, platform canvas concerns, cache, and orchestration.

## Evidence

### Global inventory
- 1043 files
- 5056 symbols
- 1578 file dependencies
- 58313 symbol dependencies
- 224 files with top-level side effects

### Working architecture set, excluding `src/i18n/static/**`
- 257 files
- 3130 symbols
- 749 internal file dependencies
- 200 deterministic direct file moves
- 54 files requiring symbol-level decomposition
- 3 broad barrel deletions
- 0 file import cycles detected

## Diagnosis

### Structural strengths
- File-level import graph is acyclic at the working-set level.
- The codebase is large enough to need automation, but still small enough to refactor safely with explicit manifests and rules.
- There are already identifiable capability clusters: QR encode/spec, decode/analyze, QArt, rendering, animation, payload generation, share links, platform adapters, UI primitives.

### Structural problems
1. **Overloaded technical buckets**
   - `src/modules/qr-generator` is not a single coherent module.
   - `src/modules/core` is too generic to be an ownership boundary.
   - `src/lib/utils.ts` is a classic utility sink.

2. **Over-centralized cross-cutting files**
   - `src/lib/logger.ts` has the highest observed fan-in.
   - `src/store/qr-store.ts` is both a state store and a taxonomy/type hub.
   - `src/modules/qr-generator/types.ts` acts as a contract hotspot.

3. **Oversized mixed-responsibility entrypoints**
   - `src/App.tsx`
   - `src/hooks/useQRGenerator.ts`
   - `src/components/Analyze.tsx`
   - `src/store/qr-store.ts`
   - `src/modules/qr-generator/qr-generator-class.ts`

4. **Broad barrels and aggregate APIs**
   - `src/modules/index.ts`
   - `src/modules/core/index.ts`
   - multiple `api.ts`, `index.ts`, and `types.ts` files that need narrowing to bounded-context public APIs

## Hotspots

### Highest fan-in files
- `src/lib/logger.ts` — 196 internal importers
- `src/modules/qr-generator/types.ts` — 27 internal importers
- `src/components/ui/dynamic-testid.ts` — 22 internal importers
- `src/store/qr-store.ts` — 17 internal importers
- `src/modules/core/index.ts` — 17 internal importers
- `src/modules/qr-encoder/types.ts` — 15 internal importers
- `src/modules/qr-generator/cache.ts` — 13 internal importers
- `src/lib/utils.ts` — 12 internal importers
- `src/components/ui/button.tsx` — 11 internal importers
- `src/lib/search-context.tsx` — 11 internal importers

### Largest current clusters
- `src/modules/qr-generator` — 42 files
- `src/modules/qr-decoder` — 26 files
- `src/modules/animation` — 18 files
- `src/modules/qr-analyzer` — 15 files
- `src/components/ui` — 14 files
- `src/modules/qr-art` — 13 files
- `src/modules/qr-encoder` — 13 files
- `src/modules/dither-algorithms` — 12 files
- `src/modules/payload-generators` — 11 files
- `src/components/sections` — 10 files

### Most symbol-dense files
- `src/hooks/useQRGenerator.ts` — 118 top-level symbols
- `src/modules/qr-art/generate.ts` — 116 top-level symbols
- `src/components/Analyze.tsx` — 107 top-level symbols
- `src/store/qr-store.ts` — 83 top-level symbols
- `src/modules/qr-generator/pixel-matrix-dithered.ts` — 78 top-level symbols
- `src/components/sections/PayloadSection.tsx` — 77 top-level symbols
- `src/modules/qr-generator/scaled-render.ts` — 66 top-level symbols
- `src/modules/share-links/url-params.ts` — 55 top-level symbols
- `src/lib/logger.ts` — 50 top-level symbols
- `src/modules/payload-generators/types.ts` — 42 top-level symbols

## Target architecture statement

The project should be refactored to:

- **presentation modules** that know about React and UI composition only
- **application/feature modules** that coordinate user workflows and state transitions
- **domain modules** that perform QR, rendering, analysis, payload, and share logic without React or browser APIs
- **platform adapters** that isolate browser, native, and worker boundaries
- **infrastructure modules** that provide logging, diagnostics, testing utilities, and telemetry
- **content modules** that isolate static/generated assets from executable architecture

## What changes immediately

- Introduce the new top-level structure.
- Apply the deterministic move manifest.
- Remove broad barrels.
- Split the five highest-risk mixed files before any wider generator refactor.
- Enforce boundaries in CI.
- Treat `src/i18n/static/**` and generated content as content, not architecture.

## What does not change immediately

- Business behavior
- Feature set
- External APIs
- Visual design
- Public routing

This refactor is structural, not product-facing.