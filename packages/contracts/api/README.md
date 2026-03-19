# `@anqr/contracts-api`

HTTP API route contracts defined with ts-rest.

Contains typed route definitions and response shapes for the ANQR HTTP API surface.

## What belongs here

- ts-rest route contracts
- request/query/path/header schemas (Zod, Phase 1b)
- status-specific response schemas
- public API contract definitions

## What does not belong here

- MCP tool schemas (use `contracts/mcp`)
- domain runtime code
- route handlers or server implementations
- auth, rate-limit, or platform logic

## Dependency rules

- May import: contracts/core, contracts/generator, contracts/analyze, contracts/share, @ts-rest/core, zod, tslib
- May NOT import: contracts/mcp, domain, application, platform, ui, apps, netlify, observability, analytics, config, testing, tools
