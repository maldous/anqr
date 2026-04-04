# Repo Skeleton

Recommended clean `main` tree:

```text
apps/
  web/
  api/
  mobile/
  android/
  ios/

packages/
  contracts/
    generator/
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

harness/
  ops/
    lib/
    symphony/

docs/
  program/
  discovery/
  standards/
  adr/
  launch/

tests/
  smoke/
  scenarios/

.github/
```

## Notes

- `apps/*` are delivery targets
- `packages/*` are the reusable architecture
- `packages/contracts/*` are portable shape-only boundaries
- `harness/ops/*` is the local operating engine (systemd timers, CLI scripts)
- `docs/*` is canonical governance and doctrine
