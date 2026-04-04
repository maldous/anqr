# 09. Compatibility shim policy

Compatibility shims are required for this migration.

## Required shim categories

### Root script entry shims

Keep current root `package.json` script targets working while implementations move.

### Harness entry shims

Keep `harness/ops/*.mjs` public entrypoints stable for systemd and operator use.

### Vite/build shims

If `vite.config.ts` moves logically under `apps/web`, keep a short root shim until tooling is repointed.

### Legacy import shims

Use only when absolutely necessary and delete quickly. Prefer direct call-site rewrites.

## Do not use shims for

- preserving generic sink roots
- preserving `src/modules` as a public architecture
- preserving `src/store`, `src/lib`, or `src/types` as public architecture
- keeping package deep imports alive

## Removal rule

A shim can be removed only after:

1. all call sites are migrated
2. validation remains green
3. package boundaries are clean
4. operator/runtime entrypoints are updated if needed
