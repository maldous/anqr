# `@anqr/analytics-ads` contract

## Role

Ads facade and approved ad adapter surface.

## Package type

This is a runtime package.

## Expected legacy inflow

- `ad ownership now spread across native/app delivery roots`

## Allowed dependencies

Follow the architecture standards and dependency rules for the owning layer.

## Forbidden

- deep-importing other package internals
- becoming a generic dump
- keeping delivery-specific shell code in this package
- importing from `src/*` after the package owns the code

## Public API rule

Expose only the stable public contract from `src/index.ts`.
