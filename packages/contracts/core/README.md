# `@anqr/contracts-core`

Portable boundary-safe types shared across all delivery surfaces (HTTP, MCP).

Contains result envelopes, error response shapes, and cross-cutting portable nouns.

## What belongs here

- result envelope types (success / error)
- standard error response shapes
- shared boundary-safe enums that cross API and MCP
- non-transport-specific schemas

## What does not belong here

- HTTP-specific route definitions (use `contracts/api`)
- MCP-specific tool schemas (use `contracts/mcp`)
- domain vocabulary (use `contracts/generator`, `contracts/analyze`, `contracts/share`)

## Dependency rules

- May import: nothing (standalone)
- May NOT import: domain, application, platform, ui, apps, netlify, observability, analytics, config, testing, tools, contracts/api, contracts/mcp
