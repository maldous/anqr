# 02. Exact root configuration changes

This file is the authoritative checklist for root-level config changes.

## 2.1 `package.json`

Convert the root package into a **workspace orchestrator**.

### Keep

- current root scripts as compatibility entrypoints during migration
- current dependency set unless a dependency is proven package-local
- npm as package manager
- harness scripts callable from root

### Add

- `workspaces` covering:
  - `apps/*`
  - `packages/*/*`
- split validation scripts:
  - `typecheck:src`
  - `typecheck:apps`
  - `typecheck:packages`
  - `typecheck:harness`
  - `typecheck:netlify`
  - `typecheck:tests`
  - `typecheck:all`
- split lint scripts:
  - `lint:src`
  - `lint:apps`
  - `lint:packages`
  - `lint:harness`
  - `lint:netlify`
  - `lint:all`
- split depcruise scripts:
  - `depcruise:src`
  - `depcruise:packages`
  - `depcruise:netlify`
  - `depcruise:all`
- contract script:
  - `contracts:check`
- phased build scripts:
  - `build:web`
  - `build:packages`
  - `build:all`

### Change

- `build` should stop assuming a single root `src/`-only application.
- `quality` should become the composition of the split checks.
- `dev` and `preview` should ultimately route through `apps/web`.

### Do not do

- do not delete the current root commands in the first migration pass
- do not break systemd or operator habits while contracts are being established

## 2.2 `tsconfig.json`

Turn root `tsconfig.json` into a **solution coordinator** with project references.

### Add these new root files

- `tsconfig.base.json`
- `tsconfig.src.json`
- `tsconfig.apps.json`
- `tsconfig.packages.json`
- `tsconfig.harness.json`
- `tsconfig.netlify.json`
- `tsconfig.tests.json`

### Target behavior

- root `tsconfig.json` contains references only
- legacy `src` keeps compiling while extraction is in progress
- packages compile independently
- apps compile independently
- netlify compiles independently
- harness compiles independently

## 2.3 `tsconfig.node.json`

Narrow to true node/tooling concerns.

### Remove from its long-term ownership

- web app concerns
- package runtime concerns
- broad catch-all responsibilities

### Keep under node/tooling scope

- `vite.config.ts`
- `vitest.config.ts`
- `playwright.config.ts`
- root build/tooling helpers
- node-only scripts

## 2.4 `eslint.config.js`

Extend architecture boundaries across:

- `apps/*`
- `packages/*/*`
- `netlify/*`
- `harness/ops/*`

### Requirements

- preserve strict `src/` transitional rules
- add package ownership recognition
- forbid package deep imports
- forbid `apps/*` importing from `src/*` once a package exists
- forbid production imports from `packages/testing/*`
- forbid product imports from `harness/ops/*`

## 2.5 `.dependency-cruiser.cjs`

Preserve current `src/` governance and add cross-root governance.

### Required additions

- `apps/* -> packages/*/*` only
- `packages/*/*` must not import `src/*`
- `netlify/*` may import only approved package layers
- `harness/ops/*` must not be imported by apps/packages/src
- support a measured transition window where `src/*` may still import leaf packages

## 2.6 `vitest.config.ts`

Expand coverage and test includes to:

- `packages/**/*.(spec|test).ts?(x)`
- `apps/**/*.(spec|test).ts?(x)`
- `tests/unit/**/*`

Do not force all package tests into one giant unbounded run forever; package-level scripts should exist too.

## 2.7 `playwright.config.ts`

Shift web server ownership toward `apps/web`.

### Long-term target

- `apps/web` owns preview/build
- root config becomes a thin wrapper or is retired

## 2.8 `netlify.toml`

Keep `netlify/functions` and `netlify/edge-functions` as the deployment surface until `apps/api` exists.

### During migration

- handlers remain in `netlify/`
- implementation logic is extracted into packages
- build target ultimately points at `apps/web`

## 2.9 `sonar-project.properties`

During transition:

- keep scanning `src`
- keep scanning `netlify`
- keep scanning `scripts`
- scan `apps` and `packages`
- remove `src` only after the extraction is complete

## 2.10 `Makefile`

Add explicit phase-safe targets:

- `typecheck-all`
- `lint-all`
- `depcruise-all`
- `contracts-check`
- `verify-migration`

## 2.11 `lefthook.yml`

Keep pre-commit and validation parity while scopes expand. The hook surface must not silently stop checking new package/app files.

## 2.12 `knip.json`, `cspell.json`, `commitlint.config.js`

Update these only after target paths exist, but do not leave them ignorant of the new package/app roots.
