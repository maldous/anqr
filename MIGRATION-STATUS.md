# ANQR Migration Status - Phase 11 Completion Checkpoint

## Current Validation State

| Gate | Status | Details |
|------|--------|---------|
| **Lint** | ✅ PASS | 2 pre-existing warnings (triple-slash reference, unused import) |
| **Typecheck** | ❌ FAIL | 3 errors |
| **Depcruise** | ❌ FAIL | 399 violations |

---

## Typecheck Errors (3)

### 1. `packages/domain/render/src/animation/parse-web-p-frames.ts:26`
```
Property 'duration' does not exist on type 'ImageDecodeResult'.
```
**Fix**: The `ImageDecodeResult` type from the ImageDecoder API doesn't have a `duration` property directly. Need to check the correct API for WebP animation frame timing.

### 2. `packages/domain/render/src/animation/resolve-gif-enc.ts:1`
```
Could not find a declaration file for module 'gifenc'.
```
**Fix**: Add `npm i --save-dev @types/gifenc` OR create a declaration file:
```ts
declare module 'gifenc';
```

### 3. `packages/platform/worker/src/qart/worker-base-payload.ts:1`
```
Cannot find module '@/domain/qr/qart/bit-mapping' or its corresponding type declarations.
```
**Fix**: The `@/` alias was removed during cleanup. This import path is broken. Need to:
- Find where `bit-mapping` actually lives now (likely `packages/domain/qr/src/qart/bit-mapping.ts`)
- Update to relative or package import

---

## Depcruise Errors (399 total)

### Category Breakdown

#### A. no-deep-package-imports (329 errors)
Packages importing deep internal paths from other packages:
- `packages/domain/render/src/*` → `packages/domain/qr/src/qr-generator/types.ts` (200+ errors)
- `packages/domain/render/src/*` → `packages/domain/qr/src/qr-generator/cache.ts`
- `packages/domain/render/src/*` → `packages/domain/qr/src/spec/qr-patterns.ts`
- `packages/domain/qr/src/*` → `packages/domain/render/src/*`
- `packages/domain/qr/src/qr-generator/*` → `packages/platform/browser/src/canvas/canvas-factory.ts`
- `packages/platform/worker/src/*` → `packages/observability/logging/src/logger.ts`
- `packages/platform/native/src/ads/*` → `packages/observability/logging/src/logger.ts`
- `packages/application/generator/src/*` → `packages/observability/logging/src/logger.ts`
- `packages/application/generator/src/*` → `packages/domain/*`

#### B. domain-no-app-imports (4 errors)
Domain packages importing from app layer:
- `packages/domain/share/src/share-links/types.ts` → `apps/web/src/state/types/animation-wave-axis.ts`
- `packages/domain/share/src/share-links/types.ts` → `apps/web/src/state/types/animation-target.ts`
- `packages/domain/share/src/parse-url-params-from-search-params.tsx` → apps/web/src/state/*

#### C. application-no-app-imports (24 errors)
Application packages importing from app layer:
- `packages/application/generator/src/url-import/*` → `apps/web/src/state/qr-store.ts`
- `packages/application/generator/src/url-import/*` → `apps/web/src/features/generator/model/mobile-split.ts`
- `packages/application/generator/src/hooks/use-qr-generator.tsx` → `apps/web/src/state/qr-store.ts`

#### D. domain-no-ui-imports (1 error)
- `packages/domain/qr/src/tier.ts` → `packages/ui/web/src/tier.ts`

#### E. domain-no-platform-imports (17 errors)
- `packages/domain/qr/src/qr-generator/*` → `packages/platform/browser/src/canvas/*`
- `packages/domain/qr/src/qr-art/index.ts` → `packages/platform/worker/src/qart/worker-client.ts`
- `packages/domain/analyze/src/qr-analyzer/index.ts` → `packages/platform/worker/src/analyze/validation-worker-client.ts`

---

## Root Cause Analysis

The cleanup removed the `src/` shim directory that previously re-exported from packages. This exposed several issues that were masked:

1. **Broken alias**: `@/domain/qr/qart/bit-mapping` in worker-base-payload.ts no longer resolves
2. **Deep imports exposed**: Packages were importing via `src/` re-exports which hid the deep internal paths. Now depcruise sees them directly.
3. **Cross-layer violations**: The application/domain layer was importing from `apps/web/src/state/` via the shim layer - this is now exposed as violations.

---

## Solution Options

### Option A: Fix typecheck only (fast)
- Fix the 3 typecheck errors
- Leave depcruise violations as-is
- Still considered "migration incomplete"

### Option B: Fix depcruise "no-deep-package-imports" (medium)
- Add barrel exports at package boundaries for types that are commonly needed
- Update depcruise config to allow specific well-known cross-package type dependencies
- Example: `packages/domain/render/src/index.ts` re-exports from `packages/domain/qr/src/qr-generator/types.ts`

### Option C: Fix all boundary violations (complete)
- Restructure imports to follow contract boundaries strictly
- Move shared types to a common location (e.g., packages/domain/types/)
- Remove application→app imports by moving state types to packages
- This matches the original migration doc intent

---

## AI Handoff Prompt

You are continuing the ANQR migration from Phase 11 (dissolve src/). The src/ shim directories have been removed, but this caused validation failures.

**Your job:**

1. **Fix typecheck errors first**:
   - `parse-web-p-frames.ts` - check ImageDecodeResult API
   - `resolve-gif-enc.ts` - add @types/gifenc or declare module
   - `worker-base-payload.ts` - fix broken import path to point to actual location

2. **Fix depcruise violations** - choose approach:
   - Option B (recommended): Add barrel exports at package boundaries to allow common types
   - Option C: Restructure imports to follow boundaries strictly

3. **Key files to modify**:
   - `packages/domain/render/src/index.ts` - add re-exports for commonly needed types from qr-generator
   - `packages/domain/share/src/index.ts` - move animation type definitions from apps/web/src/state/types/
   - `packages/application/generator/src/url-import/*` - remove imports from apps/web/src/state/*
   - `packages/ui/web/src/index.ts` - add tier re-export
   - `.dependency-cruiser.cjs` - may need to add allowed rules for known cross-package types

4. **Validation after fixes**:
   ```bash
   npm run typecheck
   npm run depcruise
   npm run lint
   ```

**Current state files:**
- typecheck.txt - current typecheck output
- depcruise.txt - current depcruise output  
- lint.txt - current lint output

---

## Files for Work Continuation

Extract this zip over `/home/user/src/anqr` and run validation:

```bash
cd /home/user/src/anqr
npm run typecheck 2>&1 | grep "error TS"
npm run depcruise 2>&1 | grep "^error" | wc -l
npm run lint 2>&1 | grep -c "error"
```

Target: All gates green.