# `@anqr/domain-share` contract

## Role

Share URL parameter and share-domain logic.

## Package type

This is a runtime package.

## Expected legacy inflow

- `src/domain/share/*`
- `src/modules/share-links/*`

## Allowed dependencies

Follow the architecture standards and dependency rules for the owning layer.

## Forbidden

- deep-importing other package internals
- becoming a generic dump
- keeping delivery-specific shell code in this package
- importing from `src/*` after the package owns the code

## Public API rule

Expose only the stable public contract from `src/index.ts`.
