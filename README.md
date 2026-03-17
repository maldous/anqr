# ANQR 1.0 design-by-contract migration bundle

This bundle is the contract-first migration control surface for moving ANQR from the current `src/` monolith into `apps/` and `packages/`, while also hardening harness engineering as a first-class bounded system under `scripts/ops/`.

## Read these files in this exact order

1. `README.md`
2. `migration/00-reading-order.md`
3. `migration/01-root-inventory.md`
4. `migration/02-root-config-changes.md`
5. `migration/03-target-layout.md`
6. `migration/04-src-to-target-mapping.md`
7. `migration/05-harness-engineering.md`
8. `migration/06-netlify-and-api-migration.md`
9. `migration/07-native-public-docs-and-runtime-state.md`
10. `migration/08-quality-gates-and-evidence.md`
11. `migration/09-compatibility-shims.md`
12. `migration/10-sequenced-run-sheet.md`
13. `migration/11-done-criteria.md`
14. `migration/AI-EXECUTION-PROMPT.md`

After that, read the contract `README.md` file at every root and leaf target that you are about to touch.

## Non-negotiable architecture rules

- `apps/*` are thin delivery shells.
- `packages/*/*` are the reusable contract-owned architecture.
- `src/` is transitional and must be dissolved by ownership seam.
- `scripts/ops/` is the canonical harness runtime. Do not create a competing runtime root.
- `netlify/` remains the deployed serverless surface until `apps/api/` is ready, but handlers must be thinned to package composition.
- `android/` and `ios/` remain transitional native build scaffolds until deliberately converged into `apps/android/` and `apps/ios/`.
- No generic sink folders.
- No deep imports across package boundaries.
- No product runtime imports from `scripts/ops/`.
- No production code imports from `packages/testing/`.
- No direct `src/` imports from `apps/*` once a package equivalent exists.

## Current top-level repository surface considered by this bundle

- `android`
- `apps`
- `docs`
- `ios`
- `netlify`
- `packages`
- `public`
- `reports`
- `scripts`
- `services`
- `src`
- `test-results`
- `tests`
- `vite-config`

## Current root configuration files considered by this bundle

- `commitlint.config.js`
- `cspell.json`
- `eslint.config.js`
- `index.html`
- `knip.json`
- `lefthook.yml`
- `Makefile`
- `netlify.toml`
- `oxlint.json`
- `package.json`
- `package-lock.json`
- `playwright.config.ts`
- `postcss.config.mjs`
- `README.md`
- `sonar-project.properties`
- `tsconfig.json`
- `tsconfig.node.json`
- `tsconfig.node.tsbuildinfo`
- `vite.config.ts`
- `vitest.config.ts`

## Current source pressure points

- `src/domain/*` remains the largest extraction body.
- `src/features/generator/*` contains the densest application-orchestration split.
- `src/modules/*`, `src/store/*`, and `src/lib/*` are legacy broad-bucket pressure zones that must be dissolved rather than preserved.
- `netlify/functions/qr/*` is large and must become a thin composition layer over `packages/domain/*`, `packages/platform/node`, and `packages/observability/*`.
- `scripts/ops/*` is already the live harness and must be contract-separated internally instead of replaced.

## Required validation command set after each major migration phase

```bash
npm run typecheck
npm run lint
npm run depcruise
npm run test:unit
npm run harness:quick
```

Run the broader checks at phase boundaries:

```bash
npm run harness:full
npm run nightly:dry-run
npm run queue:check
npm run cspell
```

## Intent of this bundle

This bundle does **not** perform the migration by itself.

It lays down the target directories, contract files, package manifests, tsconfig templates, and exact migration doctrine so that another AI can execute the change-set without inventing architecture or skipping roots.
