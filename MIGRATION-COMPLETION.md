# ANQR Migration Completion

## Purpose

This document captures the migration state in three explicit buckets:

1. what has been completed
2. what still must be done for the current platform (`web` + current server/API surface)
3. what is intentionally deferred and still must be done later

This is the authoritative completion-oriented summary for the migration from legacy ANQR to a pure hexagonal architecture with an explicit contracts layer.

Important scope distinction:

- the authoritative purity claim currently applies to the current platform graph:
  - `packages/*`
  - `apps/web`
  - `netlify/*`
- it does **not** yet claim that every deferred track in the whole repository is already converged

## Target State

The intended end-state is:

- `packages/domain/*` contains pure domain/runtime-agnostic business logic
- `packages/application/*` contains use cases, orchestration, and ports
- `packages/contracts/*` contains portable shape-only boundary language
- `packages/platform/*` contains adapters and runtime implementations
- shared UI lives in `packages/ui/*`
- `apps/*` are thin delivery shells
- `netlify/*` is a thin delivery surface until a real `apps/api` delivery target is intentionally introduced

## Completed

### Architecture

- The package architecture is now enforced by truth, not migration aspiration.
- The authoritative depcruise gate is split:
  - `npm run depcruise:architecture`
  - `npm run depcruise:contracts`
- the authoritative architecture gate is scoped to the current platform graph:
  - `packages/*`
  - `apps/web`
  - `netlify/*`
- `npm run depcruise` and `npm run depcruise:all` now execute the pure split gates.
- `npm run depcruise:migration` remains only as a legacy mixed reference pass and is not the authoritative architecture gate.

### Pure Hexagonal Boundaries

- `domain -> platform` is blocked.
- `domain -> ui` is blocked.
- `domain -> application` is blocked.
- `domain -> observability` is blocked.
- `domain -> analytics` is blocked.
- `application -> platform` is blocked.
- `application -> ui` is blocked.
- `application -> apps` is blocked.
- `application -> observability` is blocked.
- `application -> analytics` is blocked.
- `apps/web -> domain` is blocked.
- `netlify -> domain` is blocked.
- `packages/apps/netlify -> src/*` are blocked in the authoritative architecture gate.
- `domain/application/platform/ui/apps -> netlify` back-edges are blocked.
- `ui -> platform` is blocked.
- `contracts -> domain/application/platform/ui/apps/netlify/observability/analytics/config/testing/tools` are blocked.
- the currently exposed `platform -> netlify` back-edge has been removed and the tightened authoritative gate is green again

### Contracts Layer

- The contracts layer is real and enforced.
- First-class contract packages now exist:
  - `packages/contracts/generator`
  - `packages/contracts/analyze`
  - `packages/contracts/share`
- `packages/contracts/*` are checked by:
  - depcruise positive allowlist
  - `contracts-check`
- contracts are enforced as shape-only portable boundaries, not runtime glue.

### Package Surface Discipline

- No external deep imports into package internals remain in the authoritative package graph.
- `apps/web` no longer imports raw package source internals.
- `netlify/*` no longer imports raw package source internals.
- The old broad `pathNot` carve-outs in the active package graph are gone.
- The authoritative architecture gate now enforces the real folder-scope package-cycle rule, and it is green.

### Current Validation State

These are green now:

- `npm run typecheck`
- `npm run lint`
- `npm run depcruise`
- `npm run depcruise:architecture`
- `npm run depcruise:contracts`
- `npm run depcruise:all`
- `npm run contracts:check`
- `npm run audit:ast`
- `npm run test:unit`

## Still Required For Current Platform

This section is limited to the current active platform:

- `apps/web`
- current server/API delivery through `netlify/*`

These are not architecture-rule failures. They are remaining delivery/composition work needed before the current platform can be called operationally complete in the strongest sense.

## Strictest Purity Gap Ledger

This section now captures what remains after the strictest current-platform architecture work has landed.

### What is now true for the current platform

For the authoritative current-platform scope:

- `packages/*`
- `apps/web`
- `netlify/*`

the strictest purity rules are now materially enforced and green:

- `domain -X-> contracts`
- `domain -X-> platform/ui/application/apps/netlify/observability/analytics`
- `application -X-> platform/ui/apps/netlify/observability/analytics`
- `apps/web -X-> domain`
- `netlify -X-> domain`
- `packages/apps/netlify -X-> src/*`
- `domain/application/platform/ui/apps -X-> netlify`
- external package deep imports are blocked
- the real folder-scope package-cycle rule is enabled and green
- `npm run depcruise:all` is at true zero dependency violations
- `npm run audit:ast` is clean

### What still remains for the strictest claim

These are the remaining items before the whole repository, not just the current platform graph, can honestly be called strictly pure:

1. Move package public-surface governance from regex-shaped entrypoints toward explicit `package.json` `exports`.
2. Remove or isolate deferred-scope orphan carve-outs so the authoritative gate stays current-platform-only and does not carry future mobile/api/testing/gallery noise.
3. Continue thinning `apps/web` and `netlify/*` so delivery is minimal as well as boundary-compliant.
4. Decide whether any remaining delivery-oriented helper types should move out of packages and into delivery-owned code.
5. Retire the legacy mixed gate once it no longer adds migration value.
6. Finish dissolving root `src/` as an architectural surface in the wider repo, not just via import bans.
7. Remove premature empty scaffolds that imply package architecture which does not exist yet.
8. Re-check workspace/package metadata after scaffold cleanup.

### Whole-repo strict-purity finish line

To claim the **entire repository**, not just the current platform, is strictly pure, all of the following must be true:

- the current-platform pure gate stays green
- package public surfaces are explicit and `exports`-defined
- deferred roots no longer contaminate the authoritative architecture gate
- root `src/` is no longer an active architectural dependency surface
- mobile/native delivery has been deliberately converged or explicitly isolated outside the architecture claim
- root testing and tooling surfaces have a final intentional architectural treatment

### 1. Thin `apps/web` further

`apps/web` is now boundary-compliant, but it still owns meaningful composition/state logic.

Still worth doing:

- move stable shell orchestration out of `apps/web` and into package-owned APIs where it is genuinely reusable
- reduce app-local coordination in large shell/editor files
- keep the delivery layer focused on composition, routing, bootstrapping, and app-local concerns only

### 2. Thin `netlify/*` further

`netlify/*` is now off domain and no longer depends on explicit `platform/node/server/*` file imports, but it still contains delivery/server composition logic.

Still worth doing:

- push more stable request/response orchestration into package-owned server/application APIs
- reduce localized compatibility shims where they no longer buy stability
- keep reducing delivery-owned orchestration as the new package-owned server subpaths stabilize
- keep Netlify as a thin delivery surface over package-owned logic

### 3. Reduce remaining compatibility/server shims

The remaining shims are localized, not broad architectural leaks.

Still worth doing:

- remove or collapse shims where call sites are now stable
- keep only the compatibility surfaces that still protect delivery/runtime boundaries meaningfully

### 4. Refine runtime ports

The application/runtime seams are in place.

Still worth doing:

- narrow capability surfaces where current ports are broader than necessary
- keep ports capability-oriented rather than implementation-oriented

### 5. Extract more contracts only when justified

Do not extract contracts just to mirror folders.

Only extract when the vocabulary is:

- portable
- stable
- noun-shaped
- shared across multiple delivery/runtime boundaries

Do not extract:

- workflow glue
- store/state shapes
- adapters
- hooks
- runtime coordination

## Explicitly Deferred

These are intentionally deferred and should not be treated as current-platform incompleteness.

### 1. Mobile import from legacy

`android/` and `ios/` still need to be deliberately imported or converged from:

- `master`
- or `refactor/anqr-architecture`

This is deferred until the current architecture is fully settled for web/current API delivery.

For now:

- keep mobile as a deferred migration track
- do not claim mobile delivery completion yet
- do not prematurely reshape native delivery just to satisfy package symmetry

### 2. Testing package extraction

Do not define extracted testing packages yet just because legacy has Playwright/Appium/tests.

Legacy had:

- root `tests/`
- `playwright.config.ts`
- Appium/WebdriverIO

Legacy did **not** have a real extracted `packages/testing/*` architecture.

So this is deferred:

- no `packages/testing/playwright` extraction yet
- no `packages/testing/fixtures` extraction yet
- no `packages/testing/parity` extraction yet
- no `packages/testing/fakes` extraction yet

Testing remains operationally present, but architectural extraction is intentionally deferred.

### 3. Gallery package extraction

Legacy gallery existed as app-owned feature/runtime code and pipeline targets, not as a real `packages/application/gallery` package.

So this is deferred:

- keep gallery as current app-owned behavior for now
- do not invent `packages/application/gallery` until there is a real reusable application surface to own

### 4. Other premature scaffold packages

Do not keep empty extracted packages just to reserve names for possible future slices.

These should be treated as deferred-at-best, and preferably removed if they are not being implemented now:

- `packages/application/onboarding`
- `packages/application/monetization`
- `packages/analytics/ga4`
- `packages/config/*` extraction stubs
- `packages/ui/mobile`
- `packages/ui/design-tokens`

## What We Have Now

### Truthful Current State

- the current platform architecture is pure at the enforced package-boundary level
- the contracts layer is explicit and enforced
- the authoritative depcruise gate is split and pure
- `domain-no-contract-imports` is now enabled and green
- `npm run depcruise:all` is at true zero dependency violations
- `npm run audit:ast` is clean
- the real folder-scope package-cycle rule is enabled and green
- the current remaining work is mostly:
  - delivery thinning
  - public-surface tightening
  - deferred legacy import

### Not Yet True

- `apps/web` is not yet minimal enough to call a perfect thin shell
- `netlify/*` is not yet minimal enough to call a perfect thin delivery layer
- package public surfaces are not yet fully explicit/exports-defined
- mobile is not yet imported/converged
- testing has not yet been re-architected into final extracted package form
- gallery has not yet been deliberately extracted into a reusable application surface

## Recommended Next Order

1. Finish current platform cleanup first:
   - thin `apps/web`
   - thin `netlify/*`
   - reduce local shims
2. Move package public-surface governance from regex-shaped entrypoints toward explicit `package.json` `exports`.
3. Remove premature empty scaffolds that do not correspond to active implementation work.
4. Freeze the pure architecture and contracts boundary as the baseline.
5. Only then import or converge mobile (`android` / `ios`) from legacy.
6. Only after that, decide whether testing and gallery deserve real package extraction.

## Validation Commands

```bash
npm run typecheck
npm run lint
npm run depcruise
npm run depcruise:architecture
npm run depcruise:contracts
npm run depcruise:all
npm run contracts:check
npm run audit:ast
npm run test:unit
```
