# `packages/contracts`

## Role

Portable, stable boundary definitions shared across runtimes.

## What belongs here

- request/result DTOs
- options, payload, error, and style-mode types
- public contract barrels

## What does not belong here

- stores or UI-state containers
- import, patch, update, or workflow orchestration
- helpers, factories, services, or adapters
- runtime bindings, IO, parsing, or device integration
- compatibility shims or adapter-specific aliases

## Dependency direction

`application`, `state`, `platform`, `apps`, and tests may depend on contracts.

Contracts must not depend back on runtime behavior layers.

## Naming rule

Contract files are noun-oriented and shape-oriented.

- `generate-qr.request.ts`
- `qr-options.contract.ts`
- `qr-error.contract.ts`

Not:

- `qr-store.ts`
- `url-import.ts`
- `apply-qr-patch.ts`
- `qr-state-compat.ts`

## Public API rule

External consumers import contracts through the package root entrypoint only.
