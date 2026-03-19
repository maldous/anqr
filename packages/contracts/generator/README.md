# `@anqr/contracts-generator` contract

## Role

Portable generator boundary definitions shared across app, worker, node, and tests.

## Package type

This is a runtime contract package.

## Allowed contents

- request and options DTOs
- payload, style-mode, and error vocabulary
- public type barrels

## Forbidden

- stores or UI-state containers
- import or patch orchestration
- helpers, factories, services, and adapters
- runtime bindings or compatibility shims

## Public API rule

Expose only the stable public contract from `src/index.ts`.
