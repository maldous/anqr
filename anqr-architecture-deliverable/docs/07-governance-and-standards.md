# 07. Governance and standards

## Core principles

### 1. Single owner per file
Every file has one primary owner:
- one feature
- one domain subcontext
- one platform adapter group
- one infra group
- app
- ui
- content

If ownership is unclear, split the file.

### 2. High cohesion, low coupling
Prefer modules that:
- do one job well
- expose a small surface
- depend on a small number of collaborators
- can be described in one sentence

### 3. Explicit dependencies over convenience imports
Use direct imports to the owning module or the bounded-context public API.
Avoid convenience barrels that hide real dependencies.

### 4. Types live with the thing they describe
Do not centralise unrelated types just because they are types.
A type is part of its owning model or service.

### 5. Domain stays framework-neutral
React, browser, worker, and native specifics stay outside domain modules.

## Naming standards

### Good names
- `scan-gate.ts`
- `overlay-complexity.ts`
- `header-gallery-filter.ts`
- `payload-serializers.ts`
- `worker-client.ts`

### Bad names
- `core.ts`
- `helpers.ts`
- `common.ts`
- `types.ts` at an overly broad root
- `utils.ts` at a broad root

## Barrel policy

Allowed:
- one `index.ts` at a bounded-context root if it exposes a small, deliberate public API

Forbidden:
- root barrels spanning multiple bounded contexts
- barrels that simply hide poor ownership
- barrels that re-export from multiple layers

## API surface policy

Every bounded context should have:
- an internal implementation area
- an optional public entrypoint
- a small public surface

Consumers should not reach into deep internals of another bounded context unless explicitly allowed.

## Review policy

Refactor changes must be reviewed for:
- ownership correctness
- dependency correctness
- naming quality
- cohesion
- architecture rule compliance

Do not approve a structural PR solely because the typecheck passes.

## Change management

### Use ADRs for major decisions
Create a short ADR for:
- target architecture adoption
- domain/render split
- state model ownership move
- QR generator decomposition
- boundary policy enforcement

### Keep migration manifests versioned
Treat:
- file move manifest
- split manifests
- policy configs

as versioned architecture assets.

## Enforced standards

### Required
- `dependency-cruiser` in CI
- typecheck on every PR
- architecture inventory refresh after structural passes
- no new generic sinks
- no new file cycles

### Recommended
- eslint boundaries in local lint
- graph snapshots during major moves
- architectural diff review in PR description

## What to reject in review

Reject changes that:
- create a new `core` or `utils` dump
- add domain -> React/browser/native coupling
- move algorithmic logic into feature components
- keep giant files giant after touching them
- replace one generic barrel with another generic barrel