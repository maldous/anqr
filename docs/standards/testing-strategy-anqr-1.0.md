# ANQR 1.0 Testing Strategy

This document defines the preferred testing model for ANQR 1.0 foundation work.

It is aligned to:

- hexagonal architecture
- strict contract boundaries
- the current 1.0 claim in [docs/program/01-anqr-1.0-definition.md](/home/user/src/anqr/docs/program/01-anqr-1.0-definition.md)
- the harness doctrine in [docs/harness/00-index.md](/home/user/src/anqr/docs/harness/00-index.md)
- the architecture rules in [docs/standards/architecture-standards.md](/home/user/src/anqr/docs/standards/architecture-standards.md)

## Objective

The testing objective is to make ANQR progression depend on verified behavior rather than inferred correctness.

The target state is:

- every in-scope file has an explicit test owner
- every boundary has a contract test
- every delivery surface has smoke and end-to-end proof
- every high-risk path has regression protection
- Sonar coverage for in-scope files is driven to 100%
- the harness is validated directly, not trusted implicitly

## Scope

This strategy covers:

- `apps/web`
- `netlify/*`
- `packages/*`
- `scripts/ops/*`
- `services/systemd/*`
- `tests/*`
- `packages/testing/*`
- doctrine and generated-surface validation where docs or generated artifacts are part of a boundary contract

This strategy does not treat the harness itself as the initial executor for test generation or validation planning.

## Principles

- Test by architectural seam, not by folder convenience.
- Keep domain tests pure and fast.
- Test adapters at the boundary they actually implement.
- Treat contracts as executable specifications.
- Prefer deterministic fixtures over live external dependencies.
- Use end-to-end tests sparingly but make them production-truthful.
- Every escaped defect becomes a regression test.
- Coverage is a lagging indicator; contract completeness and failure-mode coverage remain mandatory.

## Hexagonal Test Model

### Contracts

Owned surfaces:

- `packages/contracts/*`
- OpenAPI generation
- MCP tool/resource schemas
- bridge HTTP contracts

Required tests:

- schema validation tests
- serialization and deserialization tests
- backward-compatibility tests for stable external contracts
- negative tests for malformed requests and invalid responses
- generated artifact sync tests

### Domain

Owned surfaces:

- `packages/domain/*`

Required tests:

- unit tests for pure logic
- property-style tests where output spaces are large
- mutation tests for critical algorithms
- golden or fixture-driven regression tests for QR generation, render, and analysis invariants

Forbidden in domain tests:

- network
- filesystem mutation unless isolated through fixtures
- SDK calls
- framework bootstrapping

### Application

Owned surfaces:

- `packages/application/*`

Required tests:

- orchestration unit tests using fakes
- component/service integration tests across ports
- unhappy-path tests for retries, fallback, policy, and validation branching

### Platform / Adapters

Owned surfaces:

- `packages/platform/*`
- `netlify/*`
- `scripts/ops/*`
- `services/systemd/*`

Required tests:

- integration tests against adapter ports
- contract tests for request and response mapping
- file/process/network boundary tests with controlled doubles
- direct harness validation tests for provider routing, queue control, and service contracts

### UI / Delivery

Owned surfaces:

- `apps/web`
- `packages/ui/*`

Required tests:

- component tests for stateful UI seams
- browser integration tests for composed workflows
- end-to-end tests for critical public journeys
- accessibility assertions on key routes and dialogs

## Test Taxonomy

### Unit Testing

Purpose:

- validate pure logic and local policy decisions

Primary tooling:

- `vitest`
- `@vitest/coverage-v8`

Placement:

- colocated `*.spec.ts` or `*.spec.tsx` in package roots
- `tests/unit/*` only for cross-cutting bootstrap and shared concerns

Standard:

- required for all domain logic, selector logic, parser logic, scoring logic, and policy functions

### Component Testing

Purpose:

- validate a UI or adapter component with its immediate collaborators but without full-browser orchestration

Primary tooling:

- `vitest`
- `jsdom`
- testing-library stack where already used

Placement:

- colocated with the component or adapter

Standard:

- required for non-trivial UI sections, Netlify handler wrappers, and harness adapter helpers

### Contract Testing

Purpose:

- verify that both sides of a boundary obey the same schema and semantics

Primary tooling:

- `vitest`
- `zod`
- `@ts-rest/core`
- fixture corpora in `packages/testing/contracts` and `packages/testing/fixtures`

Required contract surfaces:

- HTTP API request and response envelopes
- MCP tool descriptors, inputs, resources, and prompts
- Symphony bridge OpenAI-compatible surface
- Codebuff bridge OpenAI-compatible surface
- provider stats and report JSON structures
- systemd environment and runtime config expectations

Standard:

- every external or cross-package boundary must have a contract test suite before being treated as stable

### Integration Testing

Purpose:

- verify multi-module behavior through real ports inside one process or a controlled local environment

Primary tooling:

- `vitest`
- local fixture servers
- temp directories
- process spawning for harness/runtime tests

Required integration seams:

- package to package interactions
- Netlify function request lifecycle
- Symphony credit gate and bridge routing
- Codebuff bridge rotation and fallback behavior
- Linear and Sonar adapters using mocked transport layers

### End-to-End Testing

Purpose:

- verify user-visible or operator-visible workflows through the real delivery surface

Primary tooling:

- `playwright`
- local service boot scripts

Required E2E suites:

- public web critical flows
- API and MCP boundary verification against the live local stack
- harness-driven issue execution path where suitable
- OpenClaw-driven scenarios that prove:
  - Symphony is the primary model
  - pinned fallback models are visible
  - command execution works through SDK, HTTP, and streaming modes
  - failover behaves sensibly when a provider is degraded

Rule:

- OpenClaw scenarios belong in E2E, not unit or integration layers

### Regression Testing

Purpose:

- lock down previously observed failures

Required sources:

- escaped defects
- flaky provider-routing behavior
- quota and cooldown bugs
- OpenClaw bridge incompatibilities
- generated-contract drift

Rule:

- every incident class gets a named regression test or explicit rationale for why one is impossible

### Smoke Testing For CI

Purpose:

- fail fast on broken fundamentals

Required CI smoke set:

- `npm run typecheck:apps`
- `npm run typecheck:packages`
- `npm run typecheck:netlify`
- `npm run lint:apps`
- `npm run lint:packages`
- `npm run lint:netlify`
- `npm run depcruise:all`
- `npm run contracts:check`
- `npm run audit:ast`
- `npm run test:unit`
- `npm run build:web`
- `npm run harness:quick`

Optional smoke add-ons by surface:

- `npm run test:basic`
- `npm run queue:all:dry-run`
- `npm run symphony:status`

### Security Testing

Purpose:

- validate the system against misuse, leakage, and unsafe boundary behavior

Required categories:

- input validation and schema rejection
- auth and anonymous-posture checks for API and MCP surfaces
- secret redaction in reports, logs, and bridge output
- path traversal and arbitrary file access attempts in harness tools
- unsafe command construction checks
- SSRF and outbound fetch policy checks
- dependency and configuration scanning as separate advisory/security workflows

Standard:

- security tests must focus on contract boundaries and policy enforcement, not only static scanning

### Mutation Testing

Purpose:

- verify unit tests are meaningful on high-value pure logic

Preferred use:

- `packages/domain/*`
- `packages/application/*`
- provider scoring and fallback policy in `scripts/ops/integrations/model/*`

Not preferred initially:

- UI rendering code
- generated artifacts
- thin wrapper files
- heavily I/O-bound harness entrypoints

Adopted standard:

- mutation testing is mandatory for critical pure logic, not for every file indiscriminately

## Tooling Standard

### Baseline

- Unit and integration: `vitest`
- Browser E2E: `playwright`
- Coverage: V8 coverage exported to Sonar-compatible LCOV
- Contracts: `zod`, `@ts-rest/core`, fixture corpora
- Static architecture enforcement: `dependency-cruiser`, AST audit, contract checks

### Additional recommended tooling

- Mutation: `stryker` for selected packages and harness scoring logic
- Property-based testing: `fast-check` for QR and analysis invariants
- API/MCP protocol fixtures: reusable test vectors under `packages/testing/fixtures`
- Mock transport interception for adapter tests: local fetch/server doubles

## Coverage Model

### Coverage policy

- 100% Sonar coverage is the target for all files explicitly placed in scope for this programme
- no file enters the protected scope without an identified test strategy
- exclusions must be explicit, justified, and documented

### Protected scope for 100% coverage

Phase-in order:

1. `packages/contracts/*`
2. `packages/domain/*`
3. `packages/application/*`
4. `netlify/*`
5. `packages/platform/node/*` and `packages/platform/worker/*`
6. `scripts/ops/integrations/model/*`
7. `scripts/ops/orchestration/*`
8. `apps/web` critical-path modules

### Exclusion rules

Allowed exclusions:

- generated files
- declaration files
- compatibility shims scheduled for removal
- thin root re-export files when their target is already covered

Forbidden exclusions:

- complex orchestration modules
- route handlers
- schema definitions
- provider selectors
- policy and security enforcement modules

## Harness-Specific Validation Model

The harness requires direct validation because it is itself an operational system.

Required harness suites:

- provider selection unit tests
- provider cooldown and retry integration tests
- bridge contract tests for `/v1/models`, `/v1/chat/completions`, and streaming
- Codebuff key rotation tests including paid re-probe every 5 hours
- Symphony metrics capture tests
- queue control and dry-run state tests
- service startup and environment contract tests

OpenClaw-specific E2E requirements:

- Symphony primary model selection
- OpenClaw failover model list matches Symphony route inventory
- command execution and tool-use stability
- SSE streaming behavior
- provider degradation and recovery behavior

## Execution Lanes

### Inner loop

- targeted unit and integration suites
- contract checks
- architecture checks

### Pull request / merge lane

- full smoke set
- relevant integration suites
- changed-surface Playwright suites

### Nightly lane

- full integration matrix
- OpenClaw E2E scenarios
- provider degradation simulations
- mutation subset
- security regression subset

### Release lane

- full current-claim E2E set
- OpenAPI and MCP contract verification
- harness bridge contract verification
- reproducible evidence artifact export

## Test Asset Architecture

Use the existing testing package group as the canonical shared foundation:

- `packages/testing/fixtures`
- `packages/testing/fakes`
- `packages/testing/contracts`
- `packages/testing/parity`
- `packages/testing/playwright`

Additional rules:

- fixtures are immutable and named by scenario
- fakes implement ports, not convenience mocks
- parity corpora define cross-runtime truth
- scenario names must describe business or runtime behavior, not implementation details

## CI And Sonar Expectations

- export LCOV on every protected test lane
- fail CI when protected scope coverage drops below target thresholds
- treat new uncovered lines in protected scope as merge-blocking
- keep Sonar synced with Linear, but do not let Sonar titles replace architectural planning

## Required Work Breakdown

The test programme should be implemented in this order:

1. Define protected scope and coverage wiring.
2. Build shared fixtures, fakes, and contract helpers.
3. Cover contracts and pure domain logic first.
4. Cover application and platform adapters.
5. Cover harness model routing and bridge behavior directly.
6. Add OpenClaw and full-stack E2E proof.
7. Add security and mutation layers for critical modules.

## Local Checklist

- [ ] Confirm protected scope file list and exclusions.
- [ ] Wire LCOV export into Sonar for all protected suites.
- [ ] Add colocated unit tests for uncovered domain and application modules.
- [ ] Add contract suites for API, MCP, Symphony bridge, and Codebuff bridge.
- [ ] Add integration tests for Netlify handlers and platform adapters.
- [ ] Add harness integration tests for credit gate, fallback, cooldown, and metrics.
- [ ] Add OpenClaw E2E scenarios for primary routing, fallback, and streaming.
- [ ] Add CI smoke lane enforcing the minimum required commands.
- [ ] Add security regression suites for route policy, file access, secret redaction, and command safety.
- [ ] Add mutation testing to critical pure logic modules.
- [ ] Record every escaped defect as a regression test.
- [ ] Track coverage progress to 100% Sonar for the protected scope.
- [ ] Keep Linear issues and evidence aligned with the current strategy.

## Completion Standard

This strategy is only considered implemented when:

- the protected scope is enumerated in source control
- CI lanes enforce the defined gates
- Sonar consumes real coverage data
- OpenClaw and harness E2E proof exists
- Linear backlog reflects the work as bounded implementation issues
