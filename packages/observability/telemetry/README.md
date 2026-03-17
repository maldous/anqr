# `@anqr/observability-telemetry` contract

## Role

Telemetry envelope and event tracking facade.

## Package type

This is a runtime package.

## Expected legacy inflow

- `src/infra/telemetry/*`

## Allowed dependencies

Follow the architecture standards and dependency rules for the owning layer.

## Forbidden

- deep-importing other package internals
- becoming a generic dump
- keeping delivery-specific shell code in this package
- importing from `src/*` after the package owns the code

## Public API rule

Expose only the stable public contract from `src/index.ts`.
