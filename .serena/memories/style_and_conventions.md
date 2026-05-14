# Code Style and Conventions

## TypeScript
- Strict TypeScript throughout
- ESM modules (`"type": "module"` in package.json)
- No raw SDK calls outside approved adapters/facades
- No deep-imports into another package's internals — use each package's root `index.ts`
- Domain packages must be runtime-agnostic

## Architecture layers (packages)
1. `packages/contracts/` — portable boundary definitions (no runtime deps)
2. `packages/domain/` — pure domain logic (qr, render, payload, analyze, share)
3. `packages/application/` — orchestration (generator, analyze, gallery, etc.)
4. `packages/ui/` — React components (web, mobile, design-tokens)
5. `packages/platform/` — environment adapters (browser, node, native, worker)
6. `packages/observability/` — logging/telemetry/sentry facade
7. `packages/analytics/` — GA4, ads facade
8. `packages/testing/` — test fixtures, fakes, parity helpers (non-runtime)
9. `packages/config/` — shared tooling config (non-runtime)

`apps/` depend on `packages/`; never on `src/` post-extraction.

## Agent rules
- Respect package ownership and authority boundaries
- Add logs only through observability facade
- Add analytics only through analytics facade
- Add/update tests for changed public contracts
- Make rollback and risk explicit for non-trivial changes
- Never introduce broad generic sink folders

## Formatting
- oxfmt for formatting (run `npm run format`)
- oxlint for linting (run `npm run lint`)
- lefthook enforces: oxlint, typecheck, cspell on pre-commit; commitlint on commit-msg
- Pre-commit hooks bypassed for automation commits: `ANQR_AUTOMATION_COMMIT=1`

## Commit messages
- Conventional commits: `type(scope): message`
- Use `h5i commit -m "..."` not `git commit` — embeds AI session provenance
