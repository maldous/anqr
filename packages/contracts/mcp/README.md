# `@anqr/contracts-mcp`

MCP tool, resource, and prompt contracts.

Contains typed MCP tool input/output schemas, resource descriptors, and prompt argument shapes.

## What belongs here

- MCP tool input/output schemas (Zod)
- prompt argument schemas
- resource descriptor/content metadata schemas
- tool/result envelopes

## What does not belong here

- HTTP route definitions (use `contracts/api`)
- MCP server implementation (use `platform/node/mcp`)
- domain runtime code
- transport or auth logic

## Registered schemas

| Schema | Purpose |
|--------|---------|
| `qrGenerateInputSchema` | Input schema for the `generate_qr` MCP tool |
| `McpToolDescriptor` | Generic tool descriptor interface |

## Dependency rules

- May import: contracts/core, zod, tslib
- May NOT import: contracts/api, domain, application, platform, ui, apps, netlify, observability, analytics, config, testing, tools
