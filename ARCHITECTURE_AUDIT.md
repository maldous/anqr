# ANQR Architecture Audit Report

**Date:** Production-grade audit of `src/modules/` directory structure
**Goal:** Eliminate violations, enforce boundaries, clean up public APIs

---

## A. Inventory and Classification

### Current Directory Structure

```
src/modules/
├── core/                    # ✅ CORE - Pure utilities, no deps
│   ├── index.ts
│   └── internal/
│       ├── color.ts
│       ├── math.ts
│       └── types.ts
├── qr-spec/                 # ✅ MODULE - QR domain knowledge
│   ├── index.ts
│   └── internal/
│       ├── bch.ts
│       ├── constants.ts
│       ├── masks.ts
│       ├── patterns.ts
│       └── types.ts
├── qr-encoder/              # ✅ MODULE - QR encoding
│   ├── index.ts
│   └── [internal files]
├── qr-decoder/              # ✅ MODULE - QR decoding (large, 100+ files)
│   └── [internal files]
├── qr-generator/            # ✅ MODULE - QR rendering
│   ├── index.js
│   └── [internal files]
├── qr-analyzer/             # ✅ MODULE - QR analysis
│   ├── index.ts
│   └── internal/
│       ├── scanner.ts
│       └── safety.ts
├── overlay/                 # ✅ MODULE - Image processing
│   ├── index.ts
│   └── internal/
│       ├── crop-handler.js
│       ├── filters.ts
│       ├── processor.ts
│       └── watermark.ts
├── platform/                # ✅ PLATFORM - Capacitor IO
│   ├── index.ts
│   ├── admob.ts
│   └── media-store.ts
├── dither-algorithms/       # ✅ MODULE - Dithering
│   ├── index.ts
│   └── [internal files]
├── exporter/                # ✅ MODULE - Export functions
│   ├── index.ts
│   └── [internal files]
├── animation/               # ✅ MODULE - Animation handling
│   ├── index.ts
│   └── internal/
│       └── patterns.ts
├── payload-generators/      # ✅ MODULE → Should be SHARE (data-only)
│   ├── index.ts
│   └── [internal files]
├── share-utils/             # ✅ MODULE → Should be SHARE (data-only)
│   ├── index.ts
│   └── [internal files]
├── shared/                  # ⚠️ DEPRECATED - Should be empty
│   └── index.ts
│
│ === ROOT-LEVEL FILES (23 total) ===
│
├── index.ts                 # ✅ KEEP - Main barrel export
├── qr-core.ts               # ⚠️ FACADE - Re-exports from qr-spec + qr-encoder
├── qrcode.mjs               # ⚠️ DEPRECATED - Legacy wrapper
├── color-utils.ts           # ⚠️ VIOLATION - Has logic, not just re-exports
├── blue-noise-dither.ts     # ❌ VIOLATION - Should be in qr-generator/internal/
├── shift-jis-encoder.ts     # ❌ VIOLATION - Should be in qr-encoder/internal/
├── temporal-dither.ts       # ❌ VIOLATION - Should be in dither-algorithms/internal/
├── animation.ts             # ✅ FACADE - Re-exports from animation/
├── animation-patterns.ts    # ⚠️ DEPRECATED FACADE - Points to animation/internal/
├── dither-algorithms.ts     # ✅ FACADE - Re-exports from dither-algorithms/
├── exporter.ts              # ✅ FACADE - Re-exports from exporter/
├── share-utils.ts           # ✅ FACADE - Re-exports from share-utils/
├── payload-generators.ts    # ✅ FACADE - Re-exports from payload-generators/
├── qr-generator.js          # ✅ FACADE - Re-exports from qr-generator/
├── qr-analyzer.ts           # ✅ FACADE - Re-exports from qr-analyzer/
├── qr-scanner.ts            # ⚠️ DEPRECATED FACADE - Points to qr-analyzer/internal/
├── safety-analyzer.ts       # ⚠️ DEPRECATED FACADE - Points to qr-analyzer/internal/
├── image-filters.ts         # ⚠️ DEPRECATED FACADE - Points to overlay/internal/
├── overlay-processor.ts     # ⚠️ DEPRECATED FACADE - Points to overlay/
├── watermark.ts             # ⚠️ DEPRECATED FACADE - Points to overlay/internal/
├── crop-handler.js          # ⚠️ DEPRECATED FACADE - Points to overlay/internal/
├── admob-service.ts         # ⚠️ DEPRECATED FACADE - Points to platform/
├── media-store-writer.ts    # ⚠️ DEPRECATED FACADE - Points to platform/
```

### Classification Summary

| Layer | Directories | Description |
|-------|-------------|-------------|
| **core** | `core/` | Pure utilities, zero deps, no IO |
| **qr-spec** | `qr-spec/` | QR domain constants, depends only on core |
| **module** | `qr-encoder/`, `qr-decoder/`, `qr-generator/`, `qr-analyzer/`, `overlay/`, `dither-algorithms/`, `exporter/`, `animation/` | Domain logic |
| **share** | `payload-generators/`, `share-utils/` | Should be data-only, pure strings |
| **platform** | `platform/` | Capacitor IO adapters |
| **deprecated** | `shared/`, `qrcode.mjs`, various facades | To be removed |

---

## B. Dependency Rule Matrix

### Allowed Dependencies

| From ↓ / To → | core | qr-spec | qr-encoder | qr-decoder | qr-generator | qr-analyzer | overlay | dither | exporter | animation | payload | share | platform | store |
|---------------|------|---------|------------|------------|--------------|-------------|---------|--------|----------|-----------|---------|-------|----------|-------|
| **core** | - | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **qr-spec** | ✅ | - | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **qr-encoder** | ✅ | ✅ | - | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **qr-decoder** | ✅ | ✅ | ❌ | - | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **qr-generator** | ✅ | ✅ | ✅ | ❌ | - | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **qr-analyzer** | ✅ | ✅ | ❌ | ✅ | ❌ | - | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **overlay** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | - | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ⚠️ |
| **dither** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | - | ❌ | ❌ | ❌ | ❌ | ❌ | ⚠️ |
| **exporter** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | - | ❌ | ❌ | ❌ | ✅ | ❌ |
| **animation** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | - | ❌ | ❌ | ❌ | ❌ |
| **payload** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | - | ❌ | ❌ | ⚠️ |
| **share** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | - | ❌ | ❌ |
| **platform** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | - | ❌ |

**Legend:** ✅ = Allowed, ❌ = Forbidden, ⚠️ = Current violation (to fix)

### Import Path Rules

1. **No deep imports across modules.** Only import from `./module-name` or `./module-name/index`.
2. **Internal files are private.** Never import `./module-name/internal/*` from outside the module.
3. **Facade files at root re-export only.** No logic in `./module-name.ts` files.

---

## C. Violations List (Ordered by Impact)

### Critical Violations (Must Fix)

| # | File | Violation | Impact | Fix |
|---|------|-----------|--------|-----|
| 1 | `color-utils.ts` | **Contains 600+ lines of logic** instead of re-exporting from `core/` | Duplication, maintenance burden | Move gradient/store-specific code to new `color/` module, re-export core |
| 2 | `blue-noise-dither.ts` | **Should be in qr-generator/internal/** | QR-specific dithering lives at root | Move to `qr-generator/internal/blue-noise.ts` |
| 3 | `shift-jis-encoder.ts` | **Should be in qr-encoder/internal/** | Encoding utility at root | Move to `qr-encoder/internal/shift-jis.ts` |
| 4 | `temporal-dither.ts` | **Should be in dither-algorithms/internal/** | Dither utility at root (but has full impl) | Move to `dither-algorithms/internal/temporal.ts` |
| 5 | `overlay/internal/processor.ts` | **Imports from `../../store/qr-store`** | Module depends on app store | Extract types to `overlay/types.ts`, remove store dep |
| 6 | `dither-algorithms/*.ts` | **Imports from `../../store/qr-store`** | Module depends on app store | Extract types to `dither-algorithms/types.ts` |
| 7 | `payload-generators/` | **Imports from `../../store/qr-store`** | Share layer has store dependency | Extract types, make pure |

### Medium Violations (Should Fix)

| # | File | Violation | Fix |
|---|------|-----------|-----|
| 8 | `qrcode.mjs` | Legacy wrapper, uses `.mjs` extension | Delete after confirming no external imports |
| 9 | `shared/index.ts` | Deprecated but still exists | Delete after updating any remaining imports |
| 10 | `animation-patterns.ts` | Facade to internal (exposes private path) | Delete, update imports to use `animation/` |
| 11 | `qr-scanner.ts` | Facade to `qr-analyzer/internal/` | Update to import from `qr-analyzer/` public API |
| 12 | `safety-analyzer.ts` | Facade to `qr-analyzer/internal/` | Update to import from `qr-analyzer/` public API |
| 13 | `image-filters.ts` | Facade to `overlay/internal/` | Update to import from `overlay/` public API |

### Low Priority (Nice to Have)

| # | File | Violation | Fix |
|---|------|-----------|-----|
| 14 | `crop-handler.js` | JavaScript file, not TypeScript | Convert to TypeScript |
| 15 | `qr-generator/index.js` | JavaScript file, not TypeScript | Convert to TypeScript |
| 16 | `qr-generator/*.js` | Multiple JavaScript files | Convert to TypeScript |

---

## D. Public API Changes Per Module

### `core/` - No changes needed
Current exports are appropriate.

### `qr-spec/` - No changes needed  
Current exports are appropriate.

### `qr-encoder/` - Add shift-jis
```typescript
// Add to index.ts:
export { createShiftJISEncoder, canEncodeAsShiftJIS } from './internal/shift-jis';
```

### `qr-generator/` - Add blue-noise
```typescript
// Add to index.ts:
export { generateBlueNoiseDithered, type BlueNoiseOptions, type BlueNoiseResult } from './internal/blue-noise';
```

### `qr-analyzer/` - Promote scanner and safety to public API
```typescript
// Already done - scanner and safety are exported from index.ts
// Remove deprecated facades: qr-scanner.ts, safety-analyzer.ts
```

### `overlay/` - Promote all from internal to public
```typescript
// Already done - filters, watermark, processor exported from index.ts
// Remove deprecated facades: image-filters.ts, watermark.ts, overlay-processor.ts, crop-handler.js
```

### `dither-algorithms/` - Add temporal
```typescript
// Add to index.ts:
export {
  calculateTemporalOffset,
  applyTemporalNoiseToCanvas,
  generateTemporalSequence,
  isTemporalDitherActive,
  type TemporalDitherMode,
} from './internal/temporal';
```

### `animation/` - Already has patterns in internal
```typescript
// Remove deprecated facade: animation-patterns.ts
```

### `platform/` - No changes needed
Current exports are appropriate.

---

## E. Junk Drawer Audit

### `shared/index.ts` - VIOLATIONS

Current state: Marked deprecated, re-exports from `core/`.

**Issues:**
- Still exists (should be deleted)
- Any imports should use `core/` directly

**Fix:** Delete file after grep confirms no imports.

### `platform/` - CLEAN ✅

Contains only Capacitor adapters:
- `admob.ts` - AdMob plugin wrapper
- `media-store.ts` - MediaStore plugin wrapper

No domain logic found. Correct usage.

### `payload-generators/` - VIOLATIONS

**Issues:**
- Imports types from `../../store/qr-store` (couples to app state)
- Should be pure string generators with no deps

**Fix:**
1. Extract types to `payload-generators/types.ts`
2. Remove store import
3. Accept config as parameters, not from store

### `share-utils/` - CLEAN ✅

Pure URL encoding/decoding. No store dependencies.

---

## F. Tooling Changes Needed

### 1. Add dependency-cruiser rules for layer enforcement

```javascript
// .dependency-cruiser.cjs - add these rules:

{
  name: 'core-no-internal-deps',
  severity: 'error',
  comment: 'core/ must not depend on any other internal modules',
  from: { path: '^src/modules/core/' },
  to: { 
    path: '^src/modules/(?!core/)',
    pathNot: ['node_modules']
  }
},
{
  name: 'no-deep-imports',
  severity: 'error', 
  comment: 'Do not import from module internals',
  from: { pathNot: '^src/modules/([^/]+)/' },
  to: { path: '^src/modules/[^/]+/internal/' }
},
{
  name: 'no-store-in-modules',
  severity: 'warn',
  comment: 'Modules should not depend on app store',
  from: { path: '^src/modules/' },
  to: { path: '^src/store/' }
}
```

### 2. Add TypeScript path restrictions

```json
// tsconfig.json - add paths to enforce module boundaries:
{
  "compilerOptions": {
    "paths": {
      "@/modules/core": ["./src/modules/core/index.ts"],
      "@/modules/qr-spec": ["./src/modules/qr-spec/index.ts"],
      "@/modules/*": ["./src/modules/*/index.ts"],
      // Block internal imports
      "@/modules/*/internal/*": ["./src/modules/BLOCKED"]
    }
  }
}
```

### 3. Add biome rules for file size

```json
// biome.json - add complexity rules:
{
  "linter": {
    "rules": {
      "complexity": {
        "noExcessiveCognitiveComplexity": {
          "level": "warn",
          "options": { "maxAllowedComplexity": 25 }
        }
      }
    }
  }
}
```

### 4. File size guidelines

| Category | Max Lines | Exceptions |
|----------|-----------|------------|
| Module index.ts | 100 | Re-exports only |
| Internal file | 400 | Data tables (constants.ts) |
| Type definitions | 200 | - |
| Test files | 500 | - |

---

## G. Migration Plan

### Phase 1: Fix Critical Type Violations (Immediate)
1. Extract store types to module-local types.ts files
2. Update imports to use local types
3. Run TypeScript check

### Phase 2: Move Files to Correct Locations
1. Move `shift-jis-encoder.ts` → `qr-encoder/internal/shift-jis.ts`
2. Move `blue-noise-dither.ts` → `qr-generator/internal/blue-noise.ts`
3. Move `temporal-dither.ts` → `dither-algorithms/internal/temporal.ts`
4. Update all imports
5. Update module index.ts files to re-export

### Phase 3: Delete Deprecated Facades
1. Delete `qrcode.mjs`
2. Delete `shared/index.ts`
3. Delete `animation-patterns.ts`
4. Update any remaining imports

### Phase 4: Refactor color-utils.ts
1. Create `color/` module for gradient/store-specific code
2. Make `color-utils.ts` a pure facade to `core/`
3. Update imports throughout codebase

### Phase 5: Convert JavaScript to TypeScript
1. Convert `crop-handler.js` → `crop-handler.ts`
2. Convert `qr-generator/*.js` → `*.ts`

### Phase 6: Add Tooling Enforcement
1. Add dependency-cruiser rules
2. Add CI check for module boundaries
3. Document architecture in README

---

## H. Summary

### Current State
- **23 files at root** (should be 1-2)
- **13 TypeScript errors** in facades
- **6 modules** have store dependencies (violation)
- **3 files** are JavaScript (should be TypeScript)

### Target State
- **2 files at root**: `index.ts` (barrel) + optional `qr-core.ts` (facade)
- **0 TypeScript errors**
- **0 store dependencies** in modules (types extracted)
- **0 JavaScript files** (all TypeScript)

### Effort Estimate
- Phase 1: 2 hours
- Phase 2: 4 hours  
- Phase 3: 1 hour
- Phase 4: 2 hours
- Phase 5: 4 hours
- Phase 6: 2 hours
- **Total: ~15 hours**
