# Release and Versioning

## Rules

- one release ID per build
- same release ID across web/api/mobile where relevant
- Sentry release uses the same release ID
- sourcemaps/symbols uploaded in CI
- environment names are standardized
- feature flags are centralized

## Branch model

- `master` = frozen legacy
- `refactor/anqr-architecture` = extraction/reference
- `main` = ANQR 1.0 clean foundation
