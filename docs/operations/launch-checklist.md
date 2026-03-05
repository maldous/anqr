# Launch Checklist (Canonical)

This page tracks operational launch checks. Historical detail from earlier exhaustive lists is archived.

## Required Gates

- Build/test pipeline succeeds from a clean checkout.
- Core routes and API endpoint health checks pass in production.
- Critical observability and security headers are verified.
- Deployment targets (web + mobile where applicable) are validated.

## Canonical Commands

- `make all`
- `make quality`
- `make test`
- `make deploy`
- `make validate:services`

## Archive

- Detailed historical checklist snapshot: [`docs/archive/tbd-launch-checklist-2026-02-18.md`](../archive/tbd-launch-checklist-2026-02-18.md)
