# 03. Target repository layout

The target shape is contract-first, package-first, and app-shell-first.

## Canonical target roots

```text
apps/
  web/
  api/
  mobile/
  android/
  ios/

packages/
  domain/
    qr/
    render/
    payload/
    analyze/
    share/
  application/
    generator/
    analyze/
    gallery/
    onboarding/
    monetization/
  ui/
    web/
    mobile/
    design-tokens/
  platform/
    browser/
    node/
    native/
    worker/
  observability/
    logging/
    telemetry/
    sentry/
  analytics/
    ga4/
    ads/
  testing/
    fixtures/
    fakes/
    contracts/
    parity/
    playwright/
  config/
    eslint/
    tsconfig/
    depcruise/
    build/

scripts/
  ops/
    core/
    orchestration/
    governance/
    integrations/
      linear/
      email/
      sonar/
      model/
    notifications/
    reporting/
    runtime/
      symphony/
```

## Extraction rules

### `apps/*`

Only delivery composition:

- bootstrap
- routing
- shell composition
- page composition
- app-local runtime wiring
- app-local static content rendering
- app-local state and view composition where it is truly delivery-specific

### `packages/*/*`

Only reusable owned contracts:

- domain rules
- application orchestration
- UI primitives/composites
- platform adapters
- observability facades
- analytics facades
- testing fixtures/fakes/contracts/parity harnesses
- shared build/config packages

### `scripts/ops/*`

Only harness/runtime automation. No product runtime imports are allowed into this root.

### `netlify/*`

Thin deployment entrypoints and request composition. Move implementation down into packages.

### `android/`, `ios/`

Remain transitional roots until moved to `apps/android` and `apps/ios`. No product logic should accumulate here.
