# 03. Boundary rules

## Purpose

The target structure only becomes durable if it is enforced automatically.

Use two forms of policy:

1. **Authoritative CI policy**
   - `dependency-cruiser`
2. **Developer feedback in-editor / on lint**
   - `eslint-plugin-boundaries` (optional but recommended)

`dependency-cruiser` is the source of truth because it is better suited to architecture fitness functions and repo-wide dependency validation.

## Allowed dependency matrix

### Legend

- ✅ allowed
- 🚫 forbidden
- ⚠ allowed only through narrow public APIs / reviewed exceptions

| From \ To | app |  ui | features | state | domain | platform | infra | content |
| --------- | --: | --: | -------: | ----: | -----: | -------: | ----: | ------: |
| app       |  ✅ |  ✅ |       ✅ |    ✅ |     🚫 |       ✅ |    ✅ |      ✅ |
| ui        |  🚫 |  ✅ |       🚫 |    🚫 |     🚫 |       🚫 |     ⚠ |      🚫 |
| features  |  🚫 |  ✅ |       🚫 |    ✅ |     ✅ |       ✅ |    ✅ |      ✅ |
| state     |  🚫 |  🚫 |       🚫 |    ✅ |     ✅ |       🚫 |    ✅ |      🚫 |
| domain    |  🚫 |  🚫 |       🚫 |    🚫 |     ✅ |       🚫 |     ⚠ |      🚫 |
| platform  |  🚫 |  🚫 |       🚫 |    🚫 |     ✅ |       ✅ |    ✅ |      🚫 |
| infra     |  🚫 |  🚫 |       🚫 |    🚫 |     🚫 |       🚫 |    ✅ |      🚫 |
| content   |  🚫 |  🚫 |       🚫 |    🚫 |     🚫 |       🚫 |    🚫 |      ✅ |

## Additional semantic rules

### Rule 1: domain is framework-agnostic

`src/domain/**` must not import:

- `react`
- `react-dom`
- `@capacitor/*`
- browser-only components
- app/feature/ui modules

### Rule 2: platform owns environment APIs

Only `src/platform/**` may directly import or use:

- `navigator.*`
- `window.*`
- `document.*`
- `CanvasRenderingContext2D` factories and browser integration helpers
- native shell libraries such as AdMob or Capacitor plugins
- dedicated worker entrypoints

### Rule 3: features orchestrate; they do not implement algorithms

`src/features/**` may call domain services but must not become the permanent home of QR algorithms, payload encoders, matrix math, dithering kernels, or decoder internals.

### Rule 4: ui is deliberately dumb

`src/ui/**` must remain presentational and generic.
No QR math.
No payload serialization.
No storage.
No platform adapters.

### Rule 5: content is excluded from architecture analysis

Treat `src/content/**`, especially generated and static localisation content, as resources.
Keep them out of dependency fitness calculations unless they contain executable logic.

### Rule 6: only narrow public entrypoints

No top-level shared barrel that aggregates unrelated modules.
Any `index.ts` is a bounded-context entrypoint only.

## Exception process

Boundary exceptions must be:

- rare
- documented in code with a comment
- listed in `docs/08-risk-register.md` or an ADR
- time-bounded where possible

Do not create silent exceptions by weakening global rules.

## Required architecture fitness functions

CI must fail on:

1. file import cycles
2. disallowed layer dependencies
3. domain importing React/browser/native modules
4. platform importing feature or UI modules
5. new broad barrels under `src/`
6. new `utils.ts` or `core/` sinks at top-level bounded-context roots
7. unresolved imports after move passes

CI should report, but not necessarily fail initially, on:

1. fan-in hotspots above a chosen threshold
2. symbol-dense files above a chosen threshold
3. files with top-level side effects outside approved locations
4. files classified as split candidates

## Approved top-level side-effect locations

Allow side effects only in:

- `src/app/boot/**`
- `src/app/i18n/**`
- explicitly documented platform bootstrap files
- deliberate worker entry files

All other side effects should be treated as suspect and reviewed.

## Boundary enablement sequence

1. Introduce new directories.
2. Apply direct moves.
3. Remove broad barrels.
4. Split the critical mixed files.
5. Enable dependency-cruiser in warning mode.
6. Fix violations.
7. Promote to error in CI.
