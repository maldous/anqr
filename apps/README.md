# Apps contract

`apps/*` are delivery targets only.

## Allowed responsibilities

- bootstrap
- shell composition
- routing
- page composition
- runtime wiring
- app-local state
- app-local SEO/i18n/content rendering
- delivery-only UI composition

## Forbidden responsibilities

- reusable domain logic
- reusable application orchestration
- reusable platform adapters
- reusable observability facades
- imports from other apps
- imports from `src/*` once a package equivalent exists

## Child targets

- `apps/web`
- `apps/mobile`
- `apps/api`
- `apps/android` (future target)
- `apps/ios` (future target)
