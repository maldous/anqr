Keep this document updated with progress.

Design Requirement Definition: 100% Pure Hexagonal TypeScript Architecture with Explicit Contracts, Netlify-Hosted Delivery, Executable HTTP Contracts, and MCP Support

Primary objective
- Enforce a strict hexagonal architecture with dependency-cruiser as the authoritative gate.
- Preserve an explicit contracts layer with clean type ownership.
- Make HTTP contracts executable and publishable.
- Host delivery on Netlify.
- Expose MCP capabilities from Netlify-hosted delivery adapters without allowing MCP, web, API, or Netlify delivery code to bypass application and reach domain directly.
- Support professional / enterprise-grade production controls through Netlify and external identity/security providers.

Authoritative design principles
1. dependency-cruiser is the architectural source of truth in CI.
2. The hexagon is expressed as:
   - domain = pure business core
   - application = use cases and ports
   - contracts = explicit boundary language
   - platform = adapters and concrete implementations
   - delivery = web, API, Netlify handlers, MCP server
3. Contracts are split by semantics, not flattened:
   - contracts/core
   - contracts/api
   - contracts/mcp
4. Delivery layers never import domain directly.
5. Application never imports platform directly.
6. Netlify is the outer operational perimeter for HTTP and MCP.
7. Enterprise controls such as auth, rate limiting, WAF, and perimeter protection belong in the delivery/platform perimeter, not in domain.
8. MCP is an outer adapter, not a shortcut into the core.

Netlify hosting model
- Netlify is the primary production hosting/composition platform.
- Netlify Functions (Node/serverless) are the primary host for HTTP APIs and MCP server endpoints.
- Netlify Edge Functions may be used only for lightweight request interception, early auth/rate-limit decisions, geolocation/IP policy, rewrites, and cache-aware routing.
- Do not make Edge Functions the primary MCP execution surface because MCP orchestration and tool execution need more execution headroom than Edge is designed for.
- For long-running AI/tool workflows, use asynchronous/background processing patterns instead of assuming long-lived synchronous request handling.

Netlify enterprise/security requirements
- Use Netlify rate limiting rules at the perimeter for public/API/MCP-facing routes.
- Prefer Netlify Advanced Web Security / WAF / traffic rules when available.
- Use Netlify Organization/Team SSO, strict SSO, SCIM, and RBAC for operator/admin/team access.
- Do not build platform-team auth around deprecated Netlify Identity.
- For end-user or app-level authentication, use an external identity provider (for example Auth0 or equivalent, but must be free) and map identity/claims into application-facing authorization input.
- Use Netlify site protection / perimeter controls for deploy and site access where appropriate, but keep business authorization decisions in application.

AI/MCP hosting requirements
- Implement the MCP server with @modelcontextprotocol/sdk.
- Expose the MCP server over Streamable HTTP from Netlify-hosted Node/serverless delivery.
- Treat MCP clients/agents as remote delivery consumers.
- Prefer stateless or short-lived MCP request handling on Netlify.
- If a tool requires work beyond synchronous serverless limits, convert it to async/background workflow and return a task/result envelope rather than blocking.
- Start with tools/resources/prompts only.
- Treat MCP tasks as explicitly deferred or carefully introduced later if long-running orchestration is truly required.
- Add human-in-the-loop controls for dangerous tool categories.
- Add auditability and capability registration at the MCP delivery layer.

Repository structure
packages/
  contracts/
    core/
    api/
    mcp/

  domain/
    ...

  application/
    generator/
    analyze/
    ...

  platform/
    node/
      server/
      mcp/
      auth/
      rate-limit/
      security/
    browser/
    native/

apps/
  web/
  api/           (optional delivery composition)
  mobile/        (optional delivery composition)

netlify/
  functions/
  edge-functions/
  ...

Contracts structure and purpose
packages/contracts/core
- stable portable nouns
- shared boundary-safe enums
- result envelopes
- non-transport-specific schemas
- canonical shared shapes that are safe across HTTP, MCP, and platform adapters

packages/contracts/api
- ts-rest route contracts
- request/path/query/header/body schemas
- status-specific response schemas
- public API contract definitions
- may import contracts/core only

packages/contracts/mcp
- MCP tool input/output schemas
- prompt argument schemas
- resource descriptor/content metadata schemas
- tool/result envelopes
- may import contracts/core only

Contract purity rules
- contracts/core -> contracts/core only
- contracts/api -> contracts/core only
- contracts/mcp -> contracts/core only
- contracts/api -X-> contracts/mcp
- contracts/mcp -X-> contracts/api
- contracts/* -X-> domain/application/platform/ui/apps/netlify/observability/analytics/config/testing
- contracts may depend only on:
  - their allowed contract layer
  - Zod
  - tslib
  - ts-rest types/helpers only inside contracts/api
- contracts must not contain:
  - IO
  - network clients
  - browser globals
  - stores/hooks/components
  - telemetry/logging side effects
  - env reads
  - auth implementations
  - rate limiting logic
  - Netlify runtime objects

Type ownership model
Preferred strict model
- domain -X-> contracts/*
- domain owns business types and business vocabulary
- application/adapters map domain <-> contracts/core/api/mcp

Acceptable pragmatic fallback only if explicitly documented
- domain may import contracts/core only
- domain -X-> contracts/api
- domain -X-> contracts/mcp

Recommendation
- Use the strict model unless there is a compelling existing-repo reason not to.

HTTP/API design
- Use ts-rest for all stable HTTP API boundaries worth typing and publishing.
- Define route contracts in packages/contracts/api.
- Use Zod as the project-standard schema language.
- Generate OpenAPI from contracts/api.
- Keep route handlers in platform/delivery code.
- Route handlers call application entrypoints, never domain directly.
- Web and other TypeScript consumers may use typed clients derived from ts-rest contracts.

MCP design
- Implement MCP servers with @modelcontextprotocol/sdk under packages/platform/node/mcp.
- Expose MCP over Netlify-hosted Streamable HTTP endpoints.
- MCP server code owns:
  - transport
  - auth integration
  - capability registration
  - audit hooks
  - rate-limit integration
  - task/background delegation
- MCP handlers call application entrypoints only.
- MCP contracts live in packages/contracts/mcp.
- MCP must not introduce a parallel business layer or bypass application.

Netlify runtime split
Use Netlify Edge Functions for:
- lightweight request classification
- geolocation/IP policy checks
- early rewrites/redirects
- lightweight cache policy decisions
- perimeter checks where Edge limitations are acceptable

Use Netlify Functions / Node serverless for:
- ts-rest HTTP handlers
- MCP server endpoints
- authenticated business requests
- tool execution orchestration
- integration with application ports
- any work requiring more than trivial CPU

Use Background Functions / async workloads for:
- long-running tool execution
- non-blocking AI jobs
- slow provider interactions
- bulk processing
- resumable task workflows

dependency-cruiser enforcement
domain
- -> domain only
- -X-> platform
- -X-> ui
- -X-> apps
- -X-> netlify
- -X-> platform/node/mcp
- -X-> observability
- -X-> analytics
- -X-> contracts/api
- -X-> contracts/mcp
- optionally -X-> contracts/core in strict mode

application
- -> domain
- -> contracts/core only
- -X-> contracts/api
- -X-> contracts/mcp
- -X-> platform
- -X-> ui
- -X-> apps
- -X-> netlify
- -X-> observability
- -X-> analytics
- -X-> platform/node/mcp

contracts/core
- -> contracts/core + zod + tslib only

contracts/api
- -> contracts/core + zod + tslib + ts-rest contract primitives only

contracts/mcp
- -> contracts/core + zod + tslib only

platform
- -> application
- -> contracts
- -> domain only where adapter implementation genuinely requires domain types or mapping
- -X-> apps
- -X-> netlify delivery code unless intentionally composing delivery packages

apps/web
- -> application
- -> platform
- -> contracts
- -X-> domain

netlify/functions and netlify edge-functions
- -> application
- -> platform/node/server or platform/node/mcp or platform/security adapters
- -> contracts
- -X-> domain

platform/node/mcp
- -> application
- -> contracts/mcp
- -> platform/security/rate-limit/auth adapters
- -X-> domain direct consumption from delivery code

Platform enterprise adapter requirements
packages/platform/node/auth
- adapter for external IdP/session/JWT verification
- maps authenticated identity into application-safe authorization input
- supports optional Firebase Auth / Google Secure Token JWKS validation for a free-tier IdP path

packages/platform/node/rate-limit
- adapter for Netlify route/rules integration and local fallback logic where needed
- owns per-endpoint rate-limit policy declarations
- no domain logic

packages/platform/node/security
- adapter for Netlify-specific perimeter concerns
- header/cors/security policy mapping
- audit hooks and request context shaping

Observability/security split
- domain/application must remain free of observability implementations.
- platform/delivery may emit logs/metrics/traces.
- security and auth implementation live in platform/delivery.
- business authorization decisions still belong in application, based on identity claims passed inward as data.

Public surface rules
- no arbitrary deep imports
- imports must go through declared package entrypoints
- package.json exports define public surfaces
- contracts cross-import only via public entrypoints
- package-level cycles are hard errors
- architecture rules must not be weakened with broad allowlists or broad pathNot carve-outs

TypeScript/package requirements
- strict mode required
- project references where useful
- package.json exports required
- declaration-safe public surfaces for contracts
- avoid path aliases that bypass package boundaries
- keep MCP/API contracts package-first and import-safe

Operational requirements
- Netlify perimeter rate limiting for API and MCP routes
- external identity provider for end-user auth
- Netlify SSO/SCIM/RBAC for operator/team access
- audit logs for MCP tool invocation and privileged API actions
- explicit route classification:
  - public
  - authenticated
  - admin/operator
  - AI tool
- capability-level controls for MCP tools
- cost controls for AI routes and tools
- bounded sync execution budgets
- async fallback for long-running tasks
- no assumption of infinite streaming or long-lived sessions on Netlify serverless delivery

Adoption sequence

Phase 1
- keep dependency-cruiser as authoritative
- introduce contracts/api for one narrow HTTP surface
- add Zod schemas
- add ts-rest contract
- generate OpenAPI
- implement Netlify-hosted function handler that calls application only

### Phase 1 progress

**Completed:**
- [x] `packages/contracts/core` created — result envelopes (`ApiResult<T>`), error response shapes (`ApiErrorResponse`), cross-cutting portable nouns
- [x] `packages/contracts/api` created — ts-rest route contract for QR generation (`qrApiContract`) using `@ts-rest/core`
- [x] `packages/contracts/mcp` scaffold created — `McpToolDescriptor` placeholder type for Phase 2
- [x] `@ts-rest/core` installed as production dependency
- [x] `zod` installed as explicit production dependency
- [x] `@ts-rest/open-api` installed for contract-derived OpenAPI generation
- [x] `contracts-check.mjs` updated to support schema-carrying contract packages (api, mcp) — allows `export const` and non-type imports from zod/@ts-rest/core
- [x] `.dependency-cruiser.contracts.cjs` updated — allowlist now includes zod and @ts-rest; `contract-api-no-mcp-imports` and `contract-mcp-no-api-imports` rules added
- [x] `.dependency-cruiser.architecture.cjs` and `.dependency-cruiser.cjs` updated with api<->mcp isolation rules
- [x] `tsconfig.base.json` path aliases added for `@/contracts/core`, `@/contracts/api`, `@/contracts/mcp`
- [x] Zod query parameter schema added to `contracts/api` (`qrApiQuerySchema`)
- [x] Zod response schemas added to `contracts/api` (`qrApiSuccessSchema`, `qrApiErrorSchema`)
- [x] OpenAPI generation added via `npm run openapi:generate`
- [x] OpenAPI artifact generated at `docs/api/qr-api.openapi.json`
- [x] Narrow Netlify-hosted HTTP handler added at `netlify/functions/api-qr` using the ts-rest contract and calling application only
- [x] Narrow application entrypoint added for delivery-safe QR rendering (`renderBasicServerQROutput`)

**Phase 1 status:**
- Complete for the current repository scope

Phase 2
- introduce contracts/mcp for one safe MCP surface
- implement MCP server with @modelcontextprotocol/sdk on Netlify Functions
- expose a small number of safe tools/resources/prompts
- add auth, rate limit, and audit integration

### Phase 2 progress

**Completed:**
- [x] `@modelcontextprotocol/sdk` v1.27.1 installed as production dependency
- [x] `packages/contracts/mcp/src/qr-generate-tool.contract.ts` created — Zod schema for QR generation tool input (data, size, errorCorrection, foreground, background, format, margin)
- [x] `packages/contracts/mcp/src/qr-generate-advanced-tool.contract.ts` created — Zod schema for full-featured QR generation with HTTPS-only overlays and animation controls
- [x] `packages/contracts/mcp/src/qr-capabilities-resource.contract.ts` created — resource contract for supported QR formats, limits, and safety constraints
- [x] `packages/contracts/mcp/src/qr-generate-prompt.contract.ts` created — prompt argument contract for common QR generation intents
- [x] MCP/API Zod contract fields now carry `.describe(...)` metadata so generated OpenAPI and MCP tool schemas are self-describing
- [x] `packages/contracts/mcp/src/index.ts` updated — exports `qrGenerateInputSchema` and `QrGenerateInput` type
- [x] `packages/platform/node/src/mcp/` created — MCP server factory with `createMcpServer()`
- [x] `packages/platform/node/src/mcp/tools/generate-qr-tool.ts` created — safe `generate_qr` tool that calls `renderBasicServerQROutput` from application layer
- [x] `packages/platform/node/src/mcp/tools/generate-qr-advanced-tool.ts` created — advanced `generate_qr_advanced` tool that calls the full guarded server render pipeline from application layer
- [x] Advanced MCP tool input expanded to practical parity with the current guarded QR HTTP/server render surface, including overlays, animation, styling, safety, watermark, metadata, dither, and output controls
- [x] `packages/platform/node/src/mcp/resources/register-qr-capabilities-resource.ts` created — MCP resource exposing supported formats, limits, and safety constraints
- [x] `packages/platform/node/src/mcp/prompts/register-qr-generate-prompt.ts` created — MCP prompt template for common QR generation intents
- [x] `packages/platform/node/src/mcp/audit-mcp-request.ts` created — delivery-layer audit helper for MCP requests, backed by platform security sink + structured logs
- [x] `netlify/functions/mcp.ts` created — Netlify Function entry point for MCP endpoint
- [x] `netlify/functions/mcp/handler.ts` created — stateless handler using `WebStandardStreamableHTTPServerTransport`
- [x] `netlify/functions/mcp/bootstrap.ts` created — canvas polyfills and Sentry initialization
- [x] `packages/platform/node/src/auth/` created — external-IdP-oriented bearer/JWKS auth adapter for MCP delivery
- [x] `packages/platform/node/src/rate-limit/` created — rate-limit adapter for MCP delivery with bounded in-process fallback policy
- [x] `packages/platform/node/src/security/` created — durable MCP audit sink backed by Netlify Blobs
- [x] MCP delivery now depends on platform auth/rate-limit/security adapters instead of local Netlify-only helper files
- [x] `tsconfig.base.json` updated — `@/platform/node/mcp` path alias added

**Architecture decisions:**
- MCP server uses stateless mode (`sessionIdGenerator: undefined`) for Netlify serverless
- `enableJsonResponse: true` for simple request/response without SSE streaming
- Uses `WebStandardStreamableHTTPServerTransport` (Web Standard Request/Response) matching Netlify Functions v2 API
- Tool handler calls application entrypoints only — never domain directly
- Safe tool: no overlay URLs (SSRF risk), no file system access, limited parameter surface
- Advanced tool: HTTPS-only overlay URLs, private/link-local/loopback/metadata IP rejection, redirect re-validation, content-length + timeout + content-type + magic-byte validation
- SVG output returned as text content; raster formats returned as base64 image content
- New McpServer created per request for stateless serverless isolation

**Public MCP endpoint:** `https://anqr.link/api/mcp` (Streamable HTTP)

**Public typed HTTP API endpoint:** `https://anqr.link/api/contract/qr`

**Registered tools:**
| Tool | Description | Safety |
|------|-------------|--------|
| `generate_qr` | Generate QR code from data string | Safe — no overlays, no FS access, bounded size |
| `generate_qr_advanced` | Generate QR codes with overlays and animation formats | Guarded — HTTPS-only overlays, DNS/IP rejection, redirect re-validation, bounded fetch size/timeout, content-type + magic-byte checks |

**Phase 2 status:**
- Complete for the current repository scope

**Follow-on operational work moved out of Phase 2:**
- Netlify perimeter rate-limit rules should still be configured at deploy time for public/API/MCP-facing routes
- MCP auth should be pointed at a real external IdP/JWKS endpoint in environment configuration
- Additional MCP resources/prompts/tools remain optional expansion, not a blocker for initial Phase 2 completion

**Launch posture and free-tier recommendation:**
- Public launch does not require MCP auth to be enabled on day one; rate limiting, audit logging, HTTPS-only overlays, DNS/IP rejection, redirect re-validation, timeout limits, content-length limits, and content-type/magic-byte validation already provide a safe baseline
- This keeps the MCP endpoint usable from ChatGPT or other remote clients without forcing paid identity infrastructure up front
- When authenticated MCP access becomes necessary, prefer Firebase Auth as the first real IdP/JWKS path because it has a free tier and maps cleanly onto JWT/JWKS validation
- Legacy ANQR mobile config already points at Firebase project `anqr-link`, so the default Firebase issuer/audience shape is:
  - issuer: `https://securetoken.google.com/anqr-link`
  - audience: `anqr-link`
  - JWKS: `https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com`
- Recommended env vars for optional Firebase-backed MCP auth:
  - `MCP_AUTH_MODE=firebase`
  - `MCP_FIREBASE_PROJECT_ID=anqr-link`
  - optional `MCP_JWT_SCOPE=<scope>` if scope-based gating is later required

Phase 3
- add Netlify enterprise/perimeter rules for API and MCP routes
- add external IdP integration
- align package exports with depcruise public-surface rules
- harden depcruise around contracts/api and contracts/mcp

### Phase 3 progress

**Completed:**
- [x] `packages/platform/node/package.json` now declares explicit public exports for `.`, `./server`, `./server/netlify-qr`, `./server/netlify-qr-render-background`, `./mcp`, `./auth`, `./rate-limit`, and `./security`
- [x] `packages/platform/node/src/auth` now supports optional Firebase Auth / Google Secure Token JWKS configuration using the legacy ANQR Firebase project shape (`anqr-link`) while remaining launch-optional
- [x] `packages/application/generator/package.json` now declares explicit public exports for `.` and `./server`
- [x] `packages/application/analyze/package.json` now declares an explicit public export for `.`
- [x] `tsconfig.base.json` aligned with explicit platform-node subpath entrypoints (`@/platform/node/auth`, `@/platform/node/rate-limit`, `@/platform/node/security`)
- [x] `.dependency-cruiser.architecture.cjs` tightened with `platform-node-entrypoint-only` so consumers must use declared platform-node public entrypoints instead of arbitrary internal barrels
- [x] Netlify MCP delivery now imports MCP audit/server APIs via the declared `@/platform/node/mcp` entrypoint instead of deep file paths
- [x] contracts gate remains green with explicit schema-carrying package enforcement for `contracts/api` and `contracts/mcp`
- [x] Public typed HTTP contract moved to external route `/api/contract/qr` instead of internal `/.netlify/functions/*` URL shape
- [x] Netlify route policy scaffolding added for `/api/contract/qr` and `/api/mcp` in `netlify.toml`
- [x] Public documentation and generated OpenAPI now target `https://anqr.link` as the canonical API/MCP host
- [x] Platform-owned route classification and rate-limit policy declarations added under `packages/platform/node/src/security` and `packages/platform/node/src/rate-limit`

**Remaining for Phase 3:**
- [ ] Configure real Netlify perimeter rate limiting / traffic rules / WAF for API and MCP routes in deployed environments
- [ ] Set production Netlify environment variables for the chosen auth posture:
  - public launch: leave `MCP_AUTH_MODE` unset/disabled
  - Firebase-authenticated mode: set `MCP_AUTH_MODE=firebase` and `MCP_FIREBASE_PROJECT_ID=anqr-link`
- [ ] Expand package `exports` discipline further for any additional packages that later become stable public surfaces beyond the current contracts, platform-node, and application MCP/API entrypoints

**Phase 3 status:**
- In progress

Phase 4
- add async/background execution for long-running tools
- add task/result envelopes where required
- keep application pure and unaware of Netlify/MCP transport/runtime concerns

Explicit non-goals
- Do not replace dependency-cruiser with ts-rest, Zod, MCP, or Netlify features.
- Do not let application depend on contracts/api or contracts/mcp.
- Do not let delivery code import domain directly.
- Do not let application regain platform dependencies.
- Do not use Netlify Identity for new auth architecture.
- Do not host primary MCP orchestration in Edge Functions.
- Do not put auth/rate-limit/WAF logic into domain or contracts.
- Do not flatten contracts/core, contracts/api, and contracts/mcp into one generic shared-types bucket.
```

## Netlify-specific notes:

1. Primary MCP/API runtime = Netlify Functions, not Edge Functions.
2. Edge Functions are perimeter helpers, not the main orchestration host.
3. External auth provider is required for durable app/user auth.
4. Netlify enterprise/security features are perimeter controls, not substitutes for application authorization.
5. dependency-cruiser remains the final architecture authority.

The key reasons are the current platform constraints and features: Edge Functions have tight CPU and header-timeout limits; Functions can stream but with a 10-second stream cap; Background Functions can run up to 15 minutes; Netlify supports perimeter rate limiting and enterprise security controls; Netlify Identity is deprecated; MCP’s official TS SDK supports Streamable HTTP and stdio; and the AI Gateway has account-scoped TPM limits with enterprise extensions and recommends rate-limiting the functions or edge functions that call it. ([Netlify Docs][3])

The legacy master branch accommodated this, with the API supporting Foreground and Background Functions as required for longer duration QR code generation (nb, we have a Netlify paid plan with the longer timeouts). 
