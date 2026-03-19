# ANQR 1.0 Dependency Rules

## Layer dependency direction

Dependencies must follow the layer direction only.

| Layer         | May depend on                                 | Must not depend on                                            |
| ------------- | --------------------------------------------- | ------------------------------------------------------------- |
| **app/**      | features, ui, state, infra, platform, content | domain (directly)                                             |
| **ui/**       | ui, narrow styling helpers                    | domain, platform, state, features, app                        |
| **features/** | ui, state, domain, platform, infra, content   | other features' implementation details                        |
| **state/**    | domain, infra                                 | ui, app, platform                                             |
| **domain/**   | other domain modules, infra abstractions      | React, browser APIs, native APIs, worker APIs, app/components |
| **platform/** | domain, infra                                 | ui, features, app                                             |
| **infra/**    | cross-cutting only                            | business/domain logic                                         |
| **content/**  | static/generated resources only               | almost no executable logic                                    |

## Cross-root dependency direction

Dependencies between root directories follow a strict direction.

| Root            | May depend on                                                    | Must not depend on                                   |
| --------------- | ---------------------------------------------------------------- | ---------------------------------------------------- |
| **apps/\***     | packages/\*                                                      | other apps, src/ (post-extraction), tools/, netlify/ |
| **packages/\*** | other packages (following layer rules)                           | apps/, src/, tools/, netlify/                        |
| **netlify/\***  | packages/domain, packages/platform/node, packages/observability  | apps/, src/ (post-extraction), tools/                |
| **tests/\***    | packages/\*, apps/\* (as test subjects)                          | tools/                                               |
| **tools/\***    | no production constraints (operational tooling)                  | —                                                    |
| **src/\***      | packages/\* (progressive adoption), src/ layers (existing rules) | apps/                                                |

During transition, `src/` may import from both `src/` layers and `packages/*`. As extraction progresses, `src/` internal imports are replaced with `packages/*` imports until `src/` is fully dissolved.

## Contract package rule

`packages/contracts/*` defines shape only.

Good contract contents:

- request/result DTOs
- options, payload, error, event, and style-mode types
- public type barrels

Not contracts:

- stores or store aliases
- patch/update/import workflows
- helper functions or default factories
- runtime validation with side effects
- adapters or runtime-specific bindings

Required dependency direction:

- application/state/platform/apps/tests -> contracts
- contracts -X-> application/state/platform/apps

**Practical rule of thumb:**

- Import downward/inward, never upward/outward
- Import from the owning context's narrow public entry, not random siblings
- No feature-to-feature implementation imports
- No UI-to-domain leakage
- No platform code inside domain
- No "shared junk drawer"

## No generic cross-cutting sinks

Avoid new `core`, `common`, `helpers`, `misc`, `utils`, `types` folders as shared dumping grounds.

Only allow those names when tightly scoped inside a bounded context:

- ✅ `domain/qr/encode/types.ts`
- ❌ `src/types/` as a cross-context barrel

## Public API narrowing

Each bounded context can have one small root entrypoint:

- `src/domain/qr/encode/index.ts`
- `src/platform/browser/clipboard/index.ts`

**Do not recreate:**

- `src/modules/index.ts`
- Broad cross-context barrels
- Global `api.ts` aggregators

## Single owner per file

Every file belongs to exactly one of:

- app
- ui
- one feature
- one domain subcontext
- one platform adapter group
- one infra group
- content

Unclear ownership means the file should be split.

## Enforcement tooling

The repo carries (or will carry) both enforcement mechanisms:

| Tool                 | Scope                                                           |
| -------------------- | --------------------------------------------------------------- |
| `dependency-cruiser` | Import graph, circular dependencies, forbidden dependency rules |
| `eslint-boundaries`  | Layer and folder boundary policing                              |

Current state:

- `.dependency-cruiser.cjs` — active, with `src/`-scoped governance rules
- `eslint.config.js` — active, with `eslint-plugin-boundaries` for layer boundary policing

## Operational expectation

Clean graph compliance is part of **done-ness**, not optional hygiene.

Refactor checkpoints explicitly track "0 dependency-cruiser violations" — any new violation introduced by a change must be resolved before merge.

Inherited violations from pre-existing structure are documented as warnings, tracked separately from new regressions.

## Historical cleanup direction

Older broad facade and shared patterns were deliberately removed:

- Deprecated facade files deleted
- Shared/global modules reduced
- Imports rewritten toward specific bounded modules

The standard is toward **explicit, direct, bounded imports** — not umbrella barrels or compatibility layers.
