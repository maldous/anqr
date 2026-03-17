# 00. Reading order and operating posture

This migration must be executed as a controlled extraction, not as an opportunistic refactor.

## What the AI must assume

- Legacy code is available and builds.
- Circular dependencies are already resolved.
- Lint is green.
- AST density and one-type-per-file discipline are already enforced.
- Sonar issues are already resolved.
- The task is therefore **structural migration**, not cleanup discovery.

## What the AI must not assume

- Empty `apps/*` and `packages/*/*` directories mean those targets are optional.
- Root configuration is already monorepo-ready.
- `src/modules`, `src/store`, `src/lib`, and `src/hooks` deserve to survive as package names.
- Netlify handlers should remain fat forever.
- The harness should move out of `scripts/ops/`.

## Order of truth

1. Existing canonical standards already in the repo:
   - `docs/standards/architecture-standards.md`
   - `docs/standards/dependency-rules.md`
   - `docs/standards/harness-architecture.md`
   - `docs/standards/testing-standards.md`
   - `docs/standards/observability-standards.md`
   - `docs/standards/security-and-redaction.md`
   - `docs/standards/release-and-versioning.md`
   - `docs/standards/ai-agent-rules.md`
   - `docs/workflows/symphony-execution.md`
2. This migration bundle.
3. Existing code and tree state.
4. Convenience only after the above.

## Required execution posture

- Read first, move second.
- Create package and app contracts before moving implementation.
- Keep compatibility shims until call sites are migrated.
- Keep validation green between phases.
- Prefer many small owned moves over one massive rename storm.
- Delete only after import graph convergence is proven.
