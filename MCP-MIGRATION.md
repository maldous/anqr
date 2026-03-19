# ANQR MCP + Migration Consolidation

## Purpose

This document replaces the pending-work portions of:

- `MCP-REQUIREMENTS.md`
- `MIGRATION-COMPLETION.md`
- `MIGRATION-STATUS.md`

It is a one-way consolidation of:

1. what is already complete
2. what still remains for the current in-scope platform
3. what is intentionally deferred
4. what is external/operational rather than code-only

If the older documents are removed, this file should remain sufficient to resume work without losing any identified remaining tasks.

## Current Truth

### Architecture and Governance

These are complete and green now for the authoritative current-platform scope:

- strict hexagonal package architecture is enforced by the split depcruise gates
- contracts layer is explicit and enforced
- `domain -X-> contracts`
- `domain -X-> platform/ui/application/apps/netlify/observability/analytics`
- `application -X-> platform/ui/apps/netlify/observability/analytics`
- `apps/web -X-> domain`
- `netlify -X-> domain`
- `packages/apps/netlify -X-> src/*`
- `domain/application/platform/ui/apps -X-> netlify`
- external deep imports into package internals are blocked
- real folder-scope package-cycle enforcement is enabled and green

### Validation

These are currently green:

- `npm run typecheck`
- `npm run lint`
- `npm run depcruise`
- `npm run depcruise:architecture`
- `npm run depcruise:contracts`
- `npm run depcruise:all`
- `npm run contracts:check`
- `npm run audit:ast`
- `npm run test:unit`
- `npm run openapi:generate`

### HTTP / API / MCP

These are complete in-repo:

- contract-backed HTTP QR API exists
- OpenAPI generation exists
- canonical public host is `https://anqr.link`
- public HTTP contract route is `https://anqr.link/api/contract/qr`
- public MCP route is `https://anqr.link/api/mcp`
- MCP is implemented as a Netlify-hosted Streamable HTTP server
- MCP tools call application entrypoints only
- MCP advanced QR generation reaches practical parity with the guarded server render surface
- HTTPS-only overlays and SSRF protections are implemented
- rate limiting, audit logging, and auth adapter seams exist in `platform/node`
- optional Firebase-backed JWKS auth path exists and is ready to enable later

### Important Scope Distinction

The current purity/completion claim is valid for the current authoritative graph:

- `packages/*`
- `apps/web`
- `netlify/*`

It is not yet a claim that every deferred root in the whole repository is finished.

---

## Remaining Work For Current Platform

These items still remain for the active web + Netlify/API platform, even though the package-architecture migration itself is complete.

### 1. Thin `apps/web` further

`apps/web` is boundary-compliant, but not yet minimal.

Still worth doing:

- move stable shell orchestration out of `apps/web` into package-owned APIs where genuinely reusable
- reduce app-local composition/state coordination in large shell/editor flows
- keep `apps/web` focused on delivery composition, routing, bootstrapping, and app-local concerns

Desired end-state:

- `apps/web` remains a thin shell not just by boundary rules, but also by actual code ownership

### 2. Thin `netlify/*` further

`netlify/*` is now off domain and package internals, but still owns some delivery/server composition.

Still worth doing:

- push more request/response orchestration into package-owned server/application APIs
- reduce localized delivery glue where it no longer buys stability
- keep Netlify handlers as thin delivery wrappers over package-owned logic

Desired end-state:

- `netlify/*` becomes mechanically thin, not only boundary-compliant

### 3. Reduce remaining localized compatibility/server shims

The remaining shims are not broad architectural leaks, but they still exist.

Still worth doing:

- remove compatibility shims where callers are now stable
- collapse server-entry shims where package-owned public surfaces are already sufficient
- preserve only the shims that still protect a meaningful boundary

### 4. Refine application runtime ports

The port/adaptor split is in place, but some ports are broader than necessary.

Still worth doing:

- narrow capability surfaces where current runtime ports are too coarse
- keep ports capability-oriented, not implementation-oriented
- keep browser/native/worker/download/canvas-specific details fully outside application

### 5. Tighten public package surfaces further

Architecture is already strict, but public-surface governance is not yet fully explicit everywhere.

Still worth doing:

- move more packages from regex-shaped entrypoint governance toward explicit `package.json` `exports`
- continue aligning tsconfig aliases with declared exports rather than implicit file shapes
- only do this for packages that truly expose stable public APIs

### 6. Extract more contracts only when justified

The contracts layer is real, but contract extraction should continue only when it improves true boundary clarity.

Still worth doing:

- extract additional contract packages or contract-owned nouns only where the vocabulary is:
  - portable
  - stable
  - noun-shaped
  - shared across delivery/runtime boundaries
- avoid extracting contracts just to mirror folders or package names
- keep workflow/use-case glue out of contracts
- keep store/state shapes out of contracts
- keep hooks/components/adapters out of contracts
- keep runtime coordination and delivery glue out of contracts

### 7. Delivery-owned helper type cleanup

Some helper types may still live in packages even if they are only meaningful to a delivery surface.

Still worth doing:

- review remaining delivery-oriented helper types in `apps/web` and `netlify/*`
- move them out of packages and into delivery-owned code where they are not truly portable
- preserve package ownership only for types that are genuinely reusable across boundaries

### 8. Simplify package surfaces rather than preserving migration-era indirection

The remaining cleanup should prefer clearer stable package surfaces over keeping obsolete migration-era indirection alive.

Still worth doing:

- simplify package entrypoints where compatibility layers are no longer useful
- remove stale alias-driven surface complexity where explicit package APIs now exist
- keep surface cleanup focused on real public ownership, not preserving legacy migration paths

### 9. Retire the mixed migration gate when it has no value left

Still worth doing:

- remove or archive the legacy mixed depcruise migration pass once it no longer helps with any residual cleanup

---

## Remaining MCP / API Work

This section is specific to MCP, the public HTTP API, and Netlify-hosted perimeter concerns.

### 1. Configure real Netlify perimeter controls in deployed environments

This is not a code-only task. It still needs to happen operationally.

Still required:

- real Netlify rate-limiting rules for:
  - `/api/contract/qr`
  - `/api/mcp`
- real traffic rules / WAF / perimeter hardening for those routes where available
- verification that deployed route behavior matches the route-policy declarations in code

Current in-repo status:

- route policy declarations exist
- rate-limit policy declarations exist
- `netlify.toml` scaffolding exists
- actual deployed Netlify perimeter rules are still pending

### 2. Decide and set the production MCP auth posture

This is partly operational, not just code.

Two supported launch paths now exist:

- public launch:
  - leave `MCP_AUTH_MODE` unset or disabled
  - rely on rate limiting, audit logging, HTTPS-only overlays, DNS/IP rejection, redirect re-validation, timeout limits, content-length limits, content-type validation, and magic-byte validation
  - this keeps MCP usable from ChatGPT or other remote clients without requiring account auth up front
- Firebase-authenticated launch:
  - set `MCP_AUTH_MODE=firebase`
  - set `MCP_FIREBASE_PROJECT_ID=anqr-link`
  - optionally set `MCP_JWT_SCOPE=...`

Still required:

- choose one production mode explicitly
- set the real Netlify environment variables for that mode
- test deployed auth behavior end-to-end

### 3. Keep MCP/API documentation in sync with the real deployed surface

This is mostly done, but remains an ongoing requirement.

Still required whenever the surface changes:

- regenerate OpenAPI
- ensure MCP docs mention the public routes, not internal Netlify function URLs
- keep schema `.describe(...)` coverage complete on new contract fields

### 4. Future MCP breadth

MCP now covers the practical guarded QR generation surface, but future expansion is still possible.

Optional further work:

- more prompts/resources around advanced generation patterns
- additional capability documents for enterprise/automation clients
- async/background tool envelopes if truly long-running MCP jobs are introduced later

This is not a blocker for current completion.

### 5. Async/background execution policy for long-running MCP/API work

This remains a real design and implementation backlog item, not just a vague future possibility.

Still required:

- define when MCP/API requests must remain synchronous
- define when work must move to Netlify background/asynchronous execution
- add explicit task/result envelopes where long-running MCP or HTTP jobs are introduced
- keep application unaware of Netlify/MCP transport/runtime concerns while doing so

Operational note:

- legacy branches already used foreground/background function patterns
- the current paid Netlify plan supports longer-running execution paths where needed
- async/background execution should be introduced deliberately, not by letting synchronous handlers grow without limits

---

## Deferred Whole-Repo Work

These items are intentionally deferred and should not be confused with unfinished current-platform architecture work.

### 1. Mobile import/convergence from legacy

Still required later:

- deliberately import or converge `android/` and `ios/` from:
  - `master`
  - or `refactor/anqr-architecture`
- decide the final relationship between:
  - `android/`
  - `ios/`
  - `apps/mobile`
  - Capacitor/native delivery

Current status:

- legacy mobile assets exist in old branches
- current repo is not yet claiming mobile delivery completion

### 2. Root `src/` final treatment

Imports from root `src/` are blocked in the authoritative architecture gate, but the root still exists as residue.

Still required:

- finish dissolving or isolating root `src/` as a repository surface
- decide whether any remaining root `src/` files are:
  - temporary residue to delete
  - transitional artifacts to archive
  - permanent non-authoritative support files

### 3. Testing architecture finalization

Testing is operationally present, but the final extracted architecture is intentionally deferred.

Still required later:

- decide the final architecture for:
  - root `tests/`
  - `playwright.config.ts`
  - Appium/WebdriverIO setup
- do not invent `packages/testing/*` just to mirror a future possibility
- only extract testing packages if there is a real reusable package surface to own

### 4. Gallery extraction decision

Legacy gallery was app-owned, not a real `packages/application/gallery` package.

Still required later:

- decide whether gallery should remain app-owned
- or only extract it if a true reusable application surface emerges

### 5. Premature scaffold cleanup

Still required:

- remove or fill empty/reserved scaffolds that do not yet correspond to active implementation
- re-check package/app metadata after scaffold cleanup
- avoid preserving fake package architecture for slices that are not actually implemented yet

Concrete current candidates still needing a final decision include:

- `packages/application/onboarding`
- `packages/application/monetization`
- `packages/application/gallery`
- `packages/analytics/ads`
- `packages/testing/*`
- `packages/config/*`
- `apps/api`
- `apps/mobile`
- any other current empty or reserved package/app roots that do not yet correspond to active implementation

### 6. Whole-repo purity claim

Before the entire repository can honestly be called strictly pure, all of the following still need to be true:

- current-platform purity remains green
- public package surfaces are explicit where they need to be
- deferred roots are either converged, isolated, or removed
- root `src/` is no longer an active architectural surface
- mobile/native delivery is either converged or explicitly outside the claim
- root testing/tooling surfaces have their final intentional architecture

---

## Operational / External Work

These items are identified and important, but cannot be fully completed through local code edits alone.

### Netlify

Still required:

- configure deployed route-level rate limiting
- configure deployed traffic rules / WAF where available
- verify public route behavior for:
  - `https://anqr.link/api/contract/qr`
  - `https://anqr.link/api/mcp`

### Identity / JWT / JWKS

Still required:

- choose production auth posture
- set real Netlify env vars accordingly
- test deployed JWKS resolution and token verification if Firebase auth is enabled

### API / MCP operational policy

Still required:

- classify deployed routes explicitly as:
  - public
  - authenticated
  - admin/operator
  - AI tool
- define capability-level controls for MCP tools
- define cost controls for AI routes and MCP tool usage
- define bounded synchronous execution budgets
- define async fallback policy for long-running requests

### End-user / app-level identity posture

Still required if broader authenticated product surfaces remain in scope:

- decide the external identity-provider posture for end-user or app-level auth
- keep this separate from MCP-specific auth mode
- map verified identity and claims into application-facing authorization input
- preserve the rule that business authorization decisions stay in application, not in delivery or platform perimeter code

### Organizational / Team Security

Still required where relevant:

- Netlify SSO / RBAC / SCIM / org access hardening
- any launch/operator security posture outside the app runtime itself

---

## Recommended Next Order

### If continuing current-platform refinement

1. Thin `apps/web`
2. Thin `netlify/*`
3. Remove localized shims that no longer buy stability
4. Narrow runtime ports where they are broader than necessary
5. Move more public package surfaces to explicit `exports` where justified

### If continuing MCP/API rollout

1. Choose launch auth posture:
   - public MCP for launch
   - or Firebase-authenticated MCP
2. Configure Netlify perimeter rules for `/api/contract/qr` and `/api/mcp`
3. Set production Netlify env vars
4. Verify deployed API/MCP end-to-end from the real `https://anqr.link` host

### If continuing deferred repository convergence later

1. Remove premature scaffolds
2. Decide final root `src/` treatment
3. Converge mobile from legacy
4. Decide final testing architecture
5. Decide whether gallery remains app-owned or becomes a real package

---

## Validation Baseline

Use this set as the baseline local verification pass while continuing the work:

```bash
npm run typecheck
npm run lint
npm run depcruise:all
npm run contracts:check
npm run audit:ast
npm run openapi:generate
npm run test:unit
```

---

## Deletion Readiness

If the old migration documents are removed, the following will still be captured here:

- what is complete in architecture
- what remains for current-platform delivery refinement
- what remains for MCP/API operational rollout
- what is deferred for whole-repo convergence
- what is external and deploy-time only

That is the intended purpose of this file.
