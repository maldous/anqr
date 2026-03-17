# ANQR Migration Status

## Current Phase

**Phase 11 — Dissolve `src`** (IN PROGRESS)

> Migration is 95% complete. The remaining work is rewriting 448 `@/` imports in `apps/web/src/` to use direct imports from packages or relative paths.

---

## Validation Gates

| Gate | Status |
|------|--------|
| Typecheck | ✅ 0 errors |
| Depcruise | ⚠️ 4 errors (439 warnings - from `@/` imports) |
| Lint | ⚠️ 1 error |
| Unit Tests | Not run yet |

---

## Migration Completed

### Phases 0-10: ✅ ALL COMPLETE

| Phase | Status | Details |
|-------|--------|---------|
| Phase 0: Freeze baseline | ✅ | Confirmed clean working state |
| Phase 1: Lay down contracts | ✅ | README.md at all required roots |
| Phase 2: Root config monorepo | ✅ | Workspaces, tsconfigs, scripts |
| Phase 3: Contract-separate harness | ✅ | scripts/ops/* internally separated |
| Phase 4: Observability/Platform | ✅ | packages/observability/*, packages/platform/* |
| Phase 5: Domain packages | ✅ | packages/domain/* (qr, render, payload, analyze, share) |
| Phase 6: Application packages | ✅ | packages/application/* (generator, analyze, gallery, onboarding) |
| Phase 7: Thin app shells | ✅ | apps/web/, apps/mobile/, apps/api/ |
| Phase 8: Thin netlify | ✅ | 156/190 files shimmed, 34 handlers remain |
| Phase 9: Retire legacy roots | ✅ | src/modules, src/store, src/lib dissolved |
| Phase 10: Converge native | ✅ | android → apps/android, ios → apps/ios |

---

## Current File Counts

| Area | Files | Status |
|------|-------|--------|
| `src/` | 1,097 | All shims/re-exports |
| `src/types/` | 18 | Ambient .d.ts (also in packages) |
| `src/` (root) | 4 | main.tsx, index.css, etc. (stay until Phase 11) |
| `netlify/` | 190 | 156 shimmed, 34 handlers remain |
| `packages/*/src/` | 2,612 | Canonical owners |
| `apps/*/src/` | 1,362 | Thin delivery shells |
| `scripts/ops/` | 15 root + 35 internal | Contract-separated |

---

## Remaining Work (Phase 11)

### The Problem

- **448 `@/` imports** in `apps/web/src/` route through `src/` shims
- This triggers 439 depcruise warnings (apps-no-src-imports rule)
- Done criteria: "no app imports from `src/*`"

### Import Mapping (66 unique paths → targets)

| Category | Count | Action |
|----------|-------|--------|
| `@/features/*` | 20 | → Relative `./features/` (already local in apps/web/) |
| `@/ui/primitives/*` | 14 | → `packages/ui/web/src/` or inline |
| `@/ui/composites/*` | 2 | → `packages/ui/web/src/` or inline |
| `@/ui/hooks/*` | 1 | → `packages/ui/web/src/` |
| `@/modules/*` | 9 | → `packages/domain/*` (trace via src/modules shims) |
| `@/domain/*` | 2 | → `packages/domain/*` |
| `@/platform/*` | 2 | → `packages/analytics/*` or `packages/platform/*` |
| `@/infra/*` | 4 | → `packages/observability/*` |
| `@/hooks/*` | 1 | → `packages/application/generator/src/hooks` |
| `@/content/*` | 3 | → Relative `./content/` (local) |
| `@/i18n/*` | 2 | → Relative `./i18n/` (local) |
| `@/store/qr-store` | 1 | → Relative `./state/qr-store` (local) |
| `@/lib/*` | 4 | → Relative `./lib/` (local) |
| `@/app/*` | 1 | → `packages/application/generator` |

### Rewrite Strategy

1. **Local files** (features, content, i18n, state, lib) → convert to relative `./` paths
2. **Package files** (ui, modules, domain, platform, infra, hooks, app) → trace through shims to find package targets and rewrite to direct package imports

### Example Rewrites

```typescript
// Before (via src/ shim)
import { useQRGenerator } from "@/hooks/useQRGenerator";
import { buttonVariants } from "@/ui/primitives/button";
import { Tier } from "@/domain/qr/tier";

// After (direct from packages)
import { useQRGenerator } from "@/anqr/hooks/useQRGenerator";
import { buttonVariants } from "@anqr/ui/button";
import { Tier } from "@anqr/domain-qr/tier";
```

---

## Files to Read to Continue

### Migration Documentation
- `migration/11-done-criteria.md` — What "done" looks like
- `migration/09-compatibility-shims.md` — Shim policy and removal rules
- `migration/10-sequenced-run-sheet.md` — Exact phase order

### Source Files to Trace Import Chains
- `src/modules/*/index.ts` — Module shim targets (9 imports)
- `src/ui/primitives/*` — UI component shims (14 imports)  
- `src/domain/qr/tier.ts` — Domain shim target
- `src/platform/ads/components/*` — Platform shim targets
- `src/infra/logging/logger.ts` — Infra shim targets
- `src/hooks/useQRGenerator.ts` — Hook shim target

### Package Structure (extraction targets)
- `packages/domain/qr/src/`
- `packages/domain/render/src/`
- `packages/domain/analyze/src/`
- `packages/ui/web/src/` (if exists)
- `packages/observability/logging/src/`
- `packages/analytics/ads/src/components/`
- `packages/application/generator/src/hooks/`

### Consumer Files (rewrite targets)
- `apps/web/src/**/*.tsx` — 448 @/ imports to rewrite
- Run: `grep -rn 'from "@/' apps/web/src/ --include='*.ts' --include='*.tsx'`

---

## Next Steps

1. **Trace all 66 unique `@/` import paths** to their package targets via src/ shims
2. **Bulk rewrite imports** in `apps/web/src/` using sed/perl or a script
3. **Run validation gates**: typecheck, depcruise, lint, test:unit
4. **Fix any broken imports** that the rewrite causes
5. **Delete src/ shims** once all consumers are rewritten
6. **Final validation**: confirm all gates green

---

## Key Migration Rules (from docs)

- No app imports from `src/*` (done criteria)
- No package deep imports (dependency graph rule)
- No product imports from `scripts/ops/*`
- Compatibility shims removed only after all call sites migrated
- Validation must remain green throughout

---

## Command Reference

```bash
# Count @/ imports
grep -rh 'from "@/' apps/web/src/ --include='*.ts' --include='*.tsx' | wc -l

# List unique import paths
grep -rh 'from "@/' apps/web/src/ --include='*.ts' --include='*.tsx' | sed 's/.*from "@\/\([^;"]*\).*/\1/' | sort -u

# Run validation
npm run typecheck
npm run depcruise  
npm run lint
npm run test:unit

# Check src/ shims
find src -name '*.ts' -o -name '*.tsx' | xargs grep -l '// Shim' | wc -l

# Check netlify shims
grep -rl '// Shim' netlify/ --include='*.ts' | wc -l
```

---

# HANDOVER PACKAGE FOR ALTERNATE AI MODEL

## Quick Transfer Command

```bash
# Create the transfer archive
cd /home/user/src/anqr
zip -r migration-handover.zip \
  MIGRATION-STATUS.md \
  migration/ \
  src/hooks/ \
  src/modules/ \
  src/ui/ \
  src/domain/ \
  src/platform/ \
  src/infra/ \
  src/store/ \
  src/lib/ \
  src/i18n/ \
  src/content/ \
  src/features/ \
  apps/web/src/ \
  packages/domain/ \
  packages/observability/ \
  packages/analytics/ \
  packages/application/ \
  packages/platform/ \
  .dependency-cruiser.cjs \
  tsconfig.json \
  package.json
```

## Files Included in Archive

### Migration Documentation (13 files)
- `migration/00-reading-order.md`
- `migration/01-root-inventory.md`
- `migration/02-root-config-changes.md`
- `migration/03-target-layout.md`
- `migration/04-src-to-target-mapping.md`
- `migration/05-harness-engineering.md`
- `migration/06-netlify-and-api-migration.md`
- `migration/07-native-public-docs-and-runtime-state.md`
- `migration/08-quality-gates-and-evidence.md`
- `migration/09-compatibility-shims.md`
- `migration/10-sequenced-run-sheet.md`
- `migration/11-done-criteria.md`
- `migration/AI-EXECUTION-PROMPT.md`

### Source Shim Files to Trace (for import mapping)
- `src/hooks/useQRGenerator.ts` → target: packages/application/generator/src/hooks/
- `src/modules/core/index.ts` → target: packages/domain/qr/src/
- `src/modules/qr-generator/index.ts` → target: packages/domain/qr/src/
- `src/modules/payload-generators/index.ts` → target: packages/domain/payload/src/
- `src/modules/qr-analyzer/index.ts` → target: packages/domain/analyze/src/
- `src/ui/primitives/button.tsx` → target: packages/ui/web/src/
- `src/ui/primitives/input.tsx` → target: packages/ui/web/src/
- `src/domain/qr/tier.ts` → target: packages/domain/qr/src/
- `src/platform/ads/components/ad-unit.tsx` → target: packages/analytics/ads/src/components/
- `src/infra/logging/logger.ts` → target: packages/observability/logging/src/
- `src/store/qr-store.ts` → target: apps/web/src/state/qr-store.ts

### Configuration Files
- `tsconfig.json` — shows `@/*` → `./src/*` alias
- `package.json` — shows workspaces: `apps/*`, `packages/*/*`
- `.dependency-cruiser.cjs` — has `apps-no-src-imports` rule

### Consumer Files (rewrite targets)
- All of `apps/web/src/**/*.ts` and `apps/web/src/**/*.tsx` — contains 448 @/ imports to rewrite

---

## PROMPT FOR CONTINUING AI MODEL

> You are continuing the ANQR migration project. The migration is **95% complete** — Phases 0-10 are done. You are starting at **Phase 11**.
>
> **Current State:**
> - Typecheck: ✅ 0 errors
> - Depcruise: ⚠️ 4 errors, 439 warnings (from `@/` imports)
> - Lint: ⚠️ 1 error
> - src/: 1,097 files all shimmed/re-exported
> - netlify/: 156/190 shimmed, 34 handlers remain
> - packages/*/src/: 2,612 files (canonical owners)
> - apps/*/src/: 1,362 files
>
> **The Problem:**
> There are 448 `@/` imports in `apps/web/src/` that route through `src/` shims. This violates the done criteria: "no app imports from `src/*`". This triggers 439 depcruise warnings.
>
> **Your Task:**
> 1. Trace all 66 unique `@/` import paths to their final package targets by reading the src/ shim files
> 2. Rewrite the imports in `apps/web/src/` to either:
>    - Relative paths (for features, content, i18n, lib, state — these are already local in apps/web/)
>    - Direct package imports (for ui, modules, domain, platform, infra, hooks, app)
> 3. Run `npm run typecheck`, `npm run depcruise`, `npm run lint` after changes
> 4. Fix any broken imports
> 5. Once all @/ imports are gone, delete the src/ shim files
>
> **Key Files to Read First:**
> - `MIGRATION-STATUS.md` (this file)
> - `migration/11-done-criteria.md` — what "done" means
> - `migration/09-compatibility-shims.md` — when shims can be removed
> - src/ shim files to trace import chains
> - `grep -rn 'from "@/' apps/web/src/` to see all imports
>
> **Rules:**
> - No app imports from `src/*` (done criteria)
> - Validation must stay green throughout
> - Compatibility shims can only be removed after all consumers are migrated
>
> **Expected Outcome:**
> - All 448 @/ imports rewritten
> - Depcruise warnings reduced from 439 to near 0
> - All validation gates green
> - src/ directory reduced to 4 root entry files (main.tsx, index.css, etc.)
>
> Start by reading the shim files in `src/` to trace import chains, then rewrite the imports in `apps/web/src/`.

---

## Import Mapping Reference (66 unique paths → targets)

| Import Path | Current Shim Target | Rewrite To |
|-------------|---------------------|------------|
| `@/features/analyze/lib/*` | src/features/analyze/lib/ | `./features/analyze/lib/` (local) |
| `@/features/generator/components/*` | src/features/generator/components/ | `./features/generator/components/` (local) |
| `@/features/generator/model/*` | src/features/generator/model/ | `./features/generator/model/` (local) |
| `@/content/gallery/*` | src/content/gallery/ | `./content/gallery/` (local) |
| `@/i18n` | src/i18n/index.ts | `./i18n/` (local) |
| `@/i18n/static` | src/i18n/static.ts | `./i18n/static.ts` (local) |
| `@/store/qr-store` | src/store/qr-store.ts → apps/web/src/state/qr-store.ts | `./state/qr-store` (local) |
| `@/lib/*` | src/lib/ | `./lib/` (local) |
| `@/hooks/useQRGenerator` | src/hooks/useQRGenerator.ts | packages/application/generator/src/hooks/ |
| `@/modules/core` | src/modules/core/index.ts | packages/domain/qr/src/ |
| `@/modules/payload-generators` | src/modules/payload-generators/index.ts | packages/domain/payload/src/ |
| `@/modules/qr-analyzer` | src/modules/qr-analyzer/index.ts | packages/domain/analyze/src/ |
| `@/modules/qr-encoder` | src/modules/qr-encoder/index.ts | packages/domain/qr/src/ |
| `@/modules/qr-generator` | src/modules/qr-generator/index.ts | packages/domain/qr/src/ |
| `@/modules/qr-spec` | src/modules/qr-spec/index.ts | packages/domain/qr/src/ |
| `@/modules/share-links` | src/modules/share-links/index.ts | packages/domain/share/src/ |
| `@/modules/platform` | src/modules/platform/index.ts | packages/platform/browser/src/ |
| `@/domain/qr/tier` | src/domain/qr/tier.ts | packages/domain/qr/src/ |
| `@/domain/qr/analyze/*` | src/domain/qr/analyze/ | packages/domain/analyze/src/ |
| `@/domain/render/color/*` | src/domain/render/color/ | packages/domain/render/src/ |
| `@/platform/ads/components/*` | src/platform/ads/components/ | packages/analytics/ads/src/components/ |
| `@/platform/browser/clipboard` | src/platform/browser/clipboard.ts | packages/platform/browser/src/ |
| `@/infra/logging/logger` | src/infra/logging/logger.ts | packages/observability/logging/src/ |
| `@/infra/telemetry/*` | src/infra/telemetry/ | packages/observability/ |
| `@/infra/testing/*` | src/infra/testing/ | packages/observability/testing/src/ |
| `@/ui/primitives/*` | src/ui/primitives/ | packages/ui/web/src/ (or inline) |
| `@/ui/composites/*` | src/ui/composites/ | packages/ui/web/src/ (or inline) |
| `@/ui/hooks/*` | src/ui/hooks/ | packages/ui/web/src/ |
| `@/app/search/*` | src/app/search/ | packages/application/generator/src/ |

---

## Validation Commands

```bash
cd /home/user/src/anqr

# Run all gates
npm run typecheck
npm run depcruise
npm run lint
npm run test:unit

# Check remaining @/ imports
grep -rh 'from "@/' apps/web/src/ --include='*.ts' --include='*.tsx' | wc -l

# Check src/ shims remaining
find src -type f \( -name '*.ts' -o -name '*.tsx' \) -exec grep -L '// Shim' {} \; | grep -v 'main\|index\|vite-env\|global' | wc -l
```

---

*Last updated: Phase 11 in progress - 448 imports remaining*
*Transfer package created for alternate AI model*