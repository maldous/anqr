# `@anqr/application-gallery` contract

## Role

Gallery workflow orchestration and navigation contracts.

## Package type

This is a runtime package.

## Expected legacy inflow

- `non-presentational gallery workflow logic from src/features/gallery/*`
- `selected content contracts from src/content/gallery/*`

## Allowed dependencies

Follow the architecture standards and dependency rules for the owning layer.

## Forbidden

- deep-importing other package internals
- becoming a generic dump
- keeping delivery-specific shell code in this package
- importing from `src/*` after the package owns the code

## Public API rule

Expose only the stable public contract from `src/index.ts`.
