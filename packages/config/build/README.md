# `@anqr/config-build` contract

## Role

Shared Vite/build presets.

## Package type

This is a non-runtime package.

## Expected legacy inflow

- `vite-config/* and build-time shared config`

## Allowed dependencies

Follow the architecture standards and dependency rules for the owning layer.

## Forbidden

- deep-importing other package internals
- becoming a generic dump
- keeping delivery-specific shell code in this package
- importing from `src/*` after the package owns the code

## Public API rule

Expose only the stable public contract from `src/index.ts`.
