# Launch Checklist (Canonical)

This page tracks operational launch checks. Historical detail from earlier exhaustive lists is archived.

## Required Gates

- Build/test pipeline succeeds from a clean checkout.
- Core routes and API endpoint health checks pass in production.
- Critical observability and security headers are verified.
- Deployment targets (web + iOS + Android where applicable) are validated.
- Cross-platform QR parity tests pass (browser ↔ API visual comparison).

## Canonical Commands

### Web + API

- `make web:quality` — Web/frontend static quality gate
- `make api:quality` — API endpoint checks plus OpenAPI lint/validation when a spec exists
- `make all` — Full 16-step production pipeline
- `make quality` — 19-check quality gate pipeline
- `make test` — Quality gates + unit + Playwright E2E + API tests (uses `netlify dev`)
- `make test:api` — API endpoint tests + browser↔API visual parity
- `make deploy` — Netlify production deploy with Sentry sourcemaps
- `make validate:services` — Third-party service health checks

### iOS (macOS only)

- `make ios:quality` — Linux-safe Swift quality checks (`swiftformat --lint`, `swiftlint`, `semgrep`)
- `make ios:build` — Build debug app for iOS Simulator
- `make test:appium:ios` — Appium E2E tests (requires Xcode + Simulator)
- `make ios:archive` — Signed release archive
- `make ios:beta` — Upload to TestFlight (requires `ALLOW_PAID_ACTIONS=1`)

### Android (Linux only)

- `make android:quality` — Android native compile/lint plus Semgrep, with Kotlin-only tools when Kotlin sources exist
- `make android:build` — Build debug APK
- `make test:appium:android` — Appium E2E tests (requires emulator/device)
- `make android:release` — Release AAB for Play Store

## Archive

- Detailed historical checklist snapshot: [`docs/archive/tbd-launch-checklist-2026-02-18.md`](../archive/tbd-launch-checklist-2026-02-18.md)
