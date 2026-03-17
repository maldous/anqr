# Web app contract

This is the primary web delivery target.

## Own here

- web bootstrap
- shell
- routing
- static pages
- web SEO wiring
- app-local i18n wiring
- app-local state
- feature screen composition
- web-specific delivery wiring

## Do not own here

- reusable domain logic
- reusable application orchestration
- reusable platform/browser adapters that should live in packages
- generic UI primitives/composites that should live in `packages/ui/web`

## Primary legacy inflow

- `src/app/*`
- app-specific parts of `src/features/*`
- app-specific parts of `src/content/*`
- app-specific parts of `src/i18n/*`
