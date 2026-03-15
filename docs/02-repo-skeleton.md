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

tools/
  harness/
    email-ingest/
    linear/
    symphony/
    watchdog/
    workflows/
    model-eval/
    reporting/

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
- `tools/harness/*` is the local operating engine
- `docs/*` is canonical governance and doctrine
