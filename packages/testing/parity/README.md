# `@anqr/testing-parity` contract

## Role

Parity corpus and parity runners.

## Package type

This is a non-runtime package.

## Expected legacy inflow

- `browser/api/mobile parity assets and helpers`

## Allowed dependencies

Follow the architecture standards and dependency rules for the owning layer.

## Forbidden

- deep-importing other package internals
- becoming a generic dump
- keeping delivery-specific shell code in this package
- importing from `src/*` after the package owns the code

## Public API rule

Expose only the stable public contract from `src/index.ts`.
