# `packages/contracts`

## Role

Portable, stable boundary definitions shared across runtimes.

## Package structure

| Package | Purpose | May import |
|---------|---------|------------|
| `contracts/core` | Result envelopes, error shapes, cross-cutting portable nouns | nothing (standalone) |
| `contracts/generator` | QR generation option/config vocabulary | contracts/core |
| `contracts/analyze` | QR analysis result vocabulary | contracts/core |
| `contracts/share` | Share/embed vocabulary | contracts/core |
| `contracts/api` | ts-rest HTTP route contracts, Zod request/response schemas | contracts/core + domain vocab contracts + zod + @ts-rest/core |
| `contracts/mcp` | MCP tool/resource/prompt schemas | contracts/core + domain vocab contracts + zod |

## Key isolation rules

- `contracts/api` and `contracts/mcp` must NOT import each other (parallel delivery surfaces)
- No contract package may import domain, application, platform, ui, apps, netlify, observability, analytics, config, or testing
- Domain vocabulary contracts (generator, analyze, share) are pure type-only
- Schema-carrying contracts (api, mcp) may use zod and @ts-rest/core

## What belongs here

- request/result DTOs
- options, payload, error, and style-mode types
- result envelopes and error shapes
- ts-rest route contracts (in contracts/api)
- MCP tool schemas (in contracts/mcp)
- public contract barrels

## What does not belong here

- stores or UI-state containers
- import, patch, update, or workflow orchestration
- helpers, factories, services, or adapters
- runtime bindings, IO, parsing, or device integration
- compatibility shims or adapter-specific aliases
- auth, rate-limit, or security implementations

## Dependency direction

`application`, `state`, `platform`, `apps`, `netlify`, and tests may depend on contracts.

Contracts must not depend back on runtime behavior layers.

## Naming rule

Contract files are noun-oriented and shape-oriented.

- `qr-options.contract.ts`
- `qr-error.contract.ts`
- `qr-api.contract.ts`
- `result-envelope.contract.ts`

Not:

- `qr-store.ts`
- `url-import.ts`
- `apply-qr-patch.ts`
- `qr-state-compat.ts`

## Public API rule

External consumers import contracts through the package root entrypoint only.
