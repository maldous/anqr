# 04. Migration plan

## Overview

The migration is intentionally staged.

Use **file moves first** and **symbol splits second**. The inventory shows 200 deterministic direct moves and 54 split-required files in the working set.

Do not attempt a single "big bang" rewrite.

## Phase 0 — Baseline and safeguards

### Goals
- create a dedicated refactor branch
- save a clean AST inventory
- establish automated quality gates before structural change

### Actions
1. Create branch:
   - `git checkout -b refactor/anqr-architecture`
2. Install tooling from `tools/refactor/package-json.snippet.json`
3. Run baseline extractor and save artifacts.
4. Add `dependency-cruiser` config in warning mode.
5. Capture current typecheck and test status.

### Exit criteria
- baseline inventory committed
- typecheck status known
- dependency policy runs in CI without blocking

## Phase 1 — Introduce the target skeleton

### Goals
- create the target directory structure
- add policy files
- keep code behaviour unchanged

### Actions
1. Create the new top-level folders under `src/`.
2. Commit only structural directories, configs, and scripts.
3. Do not move mixed files yet.

### Exit criteria
- target layout exists
- no functional changes

## Phase 2 — Deterministic direct moves

### Goals
- move files that have a clear owner
- reduce noise before touching mixed files

### Scope
This phase covers the `move` actions from `manifests/file-move-manifest.json`.

Examples:
- UI primitives
- content and gallery data
- browser/native adapters
- narrow QR spec/encode/decode files
- exporter/overlay/dither files with clear ownership

### Actions
1. Run `tools/refactor/move-by-manifest.ts` in dry-run mode.
2. Review the proposed moves.
3. Run the real move pass.
4. Run typecheck, lint, and architecture verification.
5. Commit.

### Exit criteria
- all direct-move files relocated
- imports fixed
- typecheck green or known regression list documented

## Phase 3 — Remove broad barrels and aggregate APIs

### Goals
- stop new code from depending on generic top-level re-exports
- create bounded-context public entrypoints only where needed

### Files
- `src/modules/index.ts`
- `src/modules/core/index.ts`
- aggregate `api.ts`, `index.ts`, `types.ts` files marked as split/delete

### Actions
1. Replace cross-context barrels with local bounded-context entrypoints.
2. Update imports to point at explicit owning modules.
3. Delete obsolete barrels only after references are removed.

### Exit criteria
- no global or cross-context barrel remains
- imports resolve to bounded-context roots or concrete files

## Phase 4 — Split the highest-risk mixed files

### Mandatory first split set
1. `src/App.tsx`
2. `src/hooks/useQRGenerator.ts`
3. `src/components/Analyze.tsx`
4. `src/store/qr-store.ts`
5. `src/modules/qr-generator/qr-generator-class.ts`

These five files define the refactor's success. They should be completed before wider generator rework.

### Actions
1. Use the curated split manifests under `manifests/symbol-splits/`.
2. Extract new files by responsibility.
3. Keep original file as a temporary facade only if needed.
4. Delete temporary facades before Phase 6 completion.

### Exit criteria
- shell/application/domain concerns separated
- state and type hubs decomposed
- QR generator orchestration detached from rendering internals

## Phase 5 — Decompose `src/modules/qr-generator/**`

### Goals
Refactor the current `qr-generator` subtree into:
- `src/domain/render/generator/**`
- `src/domain/render/dither/**`
- `src/domain/render/filters/**`
- `src/domain/render/overlay/**`
- `src/domain/render/color/**`
- `src/platform/browser/canvas/**` where appropriate

### Actions
1. Move the direct-move files first.
2. Merge duplicate color and dithering responsibilities.
3. Split shared types into owning subcontexts.
4. Replace `qr-generator` aggregate APIs with bounded-context entrypoints.

### Exit criteria
- no single folder retains mixed render + platform + analysis + cache responsibilities
- each file has a single owner

## Phase 6 — Normalise types, models, and serializers

### Goals
- eliminate type dumping grounds
- colocate models with their owning bounded context

### Actions
1. Move QR-specific enums to `domain/qr/**`.
2. Move payload helpers and serializers to `domain/payload/**`.
3. Leave `state/` owning state shape only.
4. Remove duplicated type aliases and synonym enums.

### Exit criteria
- `store` does not own product taxonomy
- types are no longer acting as cross-context gravity wells

## Phase 7 — Enforce boundaries

### Goals
- make the architecture durable
- prevent regression

### Actions
1. Promote dependency-cruiser warnings to CI errors.
2. Enable eslint boundaries locally.
3. Add architecture checks to pull-request pipeline.
4. Add review checklist items.

### Exit criteria
- boundary violations fail CI
- import cycles remain zero
- new generic sinks are blocked

## Recommended commit strategy

Create small, reviewable commits:

1. `chore(architecture): add target structure and policy`
2. `refactor(content): move generated and gallery content`
3. `refactor(platform): move browser and native adapters`
4. `refactor(ui): move ui primitives and composites`
5. `refactor(qr-spec): move spec/encode/decode direct files`
6. `refactor(app): split App shell`
7. `refactor(generator): split useQRGenerator`
8. `refactor(analyze): split Analyze screen`
9. `refactor(state): split qr-store`
10. `refactor(render): split QRGenerator orchestration`
11. `chore(architecture): enable strict boundary enforcement`

## Stop conditions

Pause and stabilise if any of the following occur:
- import cycles appear
- alias imports are not updated correctly
- a move pass causes broad behavioural regressions
- one split file exceeds its planned scope
- the store split starts changing payload behaviour