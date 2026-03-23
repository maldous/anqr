# Testing Standards

Use [testing-strategy-anqr-1.0.md](/home/user/src/anqr/docs/standards/testing-strategy-anqr-1.0.md) as the controlling implementation strategy.

## Layers

### Unit

- pure domain/application logic
- no real network
- no real storage
- no real third-party SDKs

### Integration

- test adapters and boundaries
- use fakes for analytics, ads, telemetry, storage

### Parity

- compare local/browser/app/API paths against shared scenario corpus

### E2E

- Playwright for critical journeys
- semantic selectors first
- `data-testid` only as fallback contract

## Test ID rule

```text
data-testid="<feature>.<screen>.<element>"
```

Examples:

- `generator.sidebar.ecc-select`
- `generator.preview.canvas`
- `analyze.summary.copy-json`
- `gallery.card.download`
