# ANQR 1.0 Foundation README

This file is the **current authoritative bootstrap handbook** for the remaining ANQR 1.0 work on `main`.

It exists to let AI harness engineering continue with minimal human supervision while staying truthful about:

- what is already canonical on `main`
- what is still transitional or duplicated
- what 1.0 currently does and does not claim
- what must be rebuilt intentionally instead of copied from legacy
- what documentation must exist before the harness can safely continue the migration

Until the documentation reboot reaches its cutoff, treat this file as the root control surface.

---

## 0. Foundation decisions locked now

These decisions are now explicit and should be treated as controlling assumptions for foundation work.

### 0.1 Single canonical launch-scope source

**Right now:** `README.md` is the single canonical launch-scope and migration-control document.

**Phase 1 target:** once `docs/program/01-anqr-1.0-definition.md` exists, is complete, and is linked from both `README.md` and `AGENTS.md`, it becomes the single canonical launch-scope document. At that point:

- `README.md` remains the root bootstrap and execution-order document
- `docs/program/01-anqr-1.0-definition.md` becomes the sole launch-scope definition
- `MCP-MIGRATION.md` becomes the preserved migration ledger, not the live launch-scope source

Do **not** split launch truth across multiple active docs.

### 0.1A Canonical read order once `AGENTS.md` exists

This is now settled for foundation:

```text
Human/operator read order  = README.md -> AGENTS.md -> docs/README.md -> relevant docs
Agent read order           = AGENTS.md -> README.md -> docs/README.md -> relevant docs
```

That means:

- `README.md` remains the human/bootstrap overview and top-level map
- `AGENTS.md` becomes the first-read execution contract for AI agents
- both files must cross-link each other
- neither file may silently contradict `docs/program/01-anqr-1.0-definition.md` once that document becomes the launch-scope authority

### 0.2 Current truthful 1.0 platform claim

Use this truth table unless a later documented decision changes it.

```text
Surface                 Current 1.0 claim          Status now
apps/web                IN SCOPE                   canonical current delivery surface
Netlify API + MCP       IN SCOPE                   canonical current API/MCP delivery surface
apps/api                NOT IN CLAIM               reserved/deferred root; do not treat as live runtime
Android                 NOT YET CLAIMED            partially real; not launch-ready by default
iPhone                  NOT YET CLAIMED            partially real; not launch-ready by default
```

That means the **current official foundation claim is web + Netlify/API/MCP only**.

Android and iPhone may later be brought into the 1.0 claim, but they are **not claimable today** merely because files exist.

### 0.3 `apps/api` vs `netlify/*`

This is now settled for foundation:

- `netlify/*` remains the canonical 1.0 delivery surface for the public HTTP QR API and MCP
- `apps/api` is **reserved/deferred**
- no new product/runtime ownership should be split between `apps/api` and `netlify/*`
- `apps/api` only becomes a real surface if a later explicit decision promotes it

### 0.4 Mobile posture for foundation

This is now settled for foundation:

- mobile exists in the repo as **partially real but unresolved**
- mobile is **not part of the current official 1.0 claim**
- foundation must end with one truthful outcome:
  - mobile is converged and added to the claim, or
  - mobile is explicitly excluded from 1.0

Until that decision is executed, do not market, document, or imply mobile launch completion.

### 0.5 Default 1.0 MCP auth posture

This is now settled for foundation:

- the default 1.0 MCP posture is **anonymous/public access with perimeter controls**
- Firebase/JWKS-backed auth remains a **later hardening path**, not the default launch position
- any future authenticated mode must not silently replace the anonymous consumer launch story

### 0.6 Testing strategy

This is now settled for foundation:

- legacy testing architecture must **not** be imported wholesale
- tests on `main` must be rebuilt intentionally around the current package architecture and current launch claim
- parity, E2E, API/MCP, gallery, scan reliability, and mobile verification are still part of the quality story where in scope
- mobile-specific verification is only mandatory if mobile is brought back into the 1.0 claim

### 0.7 Documentation reboot cutoff

This is now settled for foundation:

`migration/*` stops being active doctrine at the first commit where **all** of the following exist and cross-link correctly:

- `README.md`
- `AGENTS.md`
- `docs/README.md`
- `docs/harness/00-index.md`
- `docs/harness/01-operating-model.md`
- `docs/harness/02-runtime-and-services.md`
- `docs/harness/03-workspace-governance.md`
- `docs/harness/05-quality-gates.md`
- `docs/harness/06-evidence-and-reporting.md`
- `docs/program/01-anqr-1.0-definition.md`

From that commit onward:

- `README.md`, `AGENTS.md`, and `docs/*` are the only live doctrine
- `migration/*` becomes archive-only
- `MCP-MIGRATION.md` remains the preserved ledger/reference
- no new operational truth should be added to `migration/*`

### 0.8 Fresh Linear workspace model

This is now settled for foundation:

Use a **hybrid model**.

```text
Projects are by program stream / package family.
Concrete packages are tracked by labels/components, not one project per package.
```

Required project set:

```text
Foundation & Governance
Documentation & Doctrine
Harness & Automation
Web Experience
API & MCP Delivery
QR Engine & Core Packages
Mobile Convergence
Observability & Reliability
Release Readiness
Growth / SEO / Discoverability
Compliance / Privacy
Incidents / Ops
```

Required package/runtime labels:

```text
pkg:contracts
pkg:domain
pkg:application
pkg:platform
pkg:ui
pkg:analytics
pkg:observability
pkg:config
pkg:testing
app:web
app:api
app:mobile
runtime:netlify
runtime:harness
runtime:mobile
runtime:android
runtime:ios
docs
release
incident
human-only
sonar
```

### 0.9 Evidence contract

Every completion artifact must include all of the following:

```text
Summary
Scope class
Touched paths
Decision(s) made
Commands run
Pass/fail result for each command
Changed files
Commit hash
Issue comment text
Artifacts attached/linked
Risk / rollback note
Follow-up work
```

Screenshots, traces, logs, or device evidence are required when relevant:

- UI-visible changes -> screenshots or equivalent visual proof
- API/MCP/auth/rate-limit changes -> request/response examples and logs
- harness/systemd changes -> service status or journal excerpts
- performance work -> benchmark or timing evidence
- mobile work -> build/device evidence

### 0.10 Quality-gate tiers

Foundation must use these distinct gate tiers.

```text
Inner loop        = smallest relevant local gates during implementation
Pre-merge         = full repo or full-scope gates before merge/promotion
Release           = deploy, parity, performance, observability, launch-readiness gates
Mobile-only       = only when mobile remains in the 1.0 claim
Manual/external   = store, billing, ad approval, legal/compliance, prod-control actions
```

### 0.11 Public/static content ownership

This is now settled for foundation:

- `public/*` is for static delivery assets and public-facing generated artifacts
- `docs/*` is for canonical knowledge and doctrine
- generated API/schema artifacts may exist in `public/*` or `docs/api/*`, but are **not** the doctrine source
- business logic, migration truth, and harness doctrine do **not** belong in `public/*`

### 0.12 Harness relation to the product runtime

This is now settled for foundation:

- `scripts/ops/*` and `services/systemd/*` are the **canonical engineering/harness runtime**
- they are **not** part of the same depcruise architecture claim as `packages/*/*`, `apps/web`, and `netlify/*`
- the public product runtime is currently `apps/web` + `netlify/*` + `public/*`
- the harness is required for governed engineering workflow and operational visibility
- the harness is **not** part of the end-user request path for basic QR generation

---

## 1. Primary source inputs reviewed

- `MCP-MIGRATION.md`
- current tree snapshot
- current git history snapshot
- existing standards documents under `docs/standards/*`
- current docs layout under `docs/*`
- current harness/runtime roots under `scripts/ops/*` and `services/systemd/*`

---

## 2. Current repo truth

### 2.1 Exact authoritative architecture statement

The reusable architecture surface is **not** `packages/*` generically.
It is:

```text
packages/<group>/<package>
```

Examples of the real shape already present:

```text
packages/analytics/ads
packages/application/generator
packages/application/analyze
```

Do **not** invent single-level package roots like `packages/foo` as if they were canonical runtime packages.

### 2.2 Current root classification

```text
Path                    Status                               Notes
packages/*/*            canonical architecture surface       reusable package-owned logic
apps/web                canonical delivery surface           current web shell
netlify/*               canonical delivery surface           current API/MCP perimeter and handlers
scripts/ops/*           canonical harness/ops surface        operationally canonical, outside depcruise app/package claim
services/systemd/*      canonical harness runtime surface    operationally canonical, outside depcruise app/package claim
public/*                canonical static/public surface      assets and public generated artifacts only
docs/*                  canonical knowledge surface target   useful today, disordered, must be rebooted cleanly
src/*                   transitional residue                 never regains architecture authority
apps/api                reserved/deferred                   not a claimed runtime for 1.0 foundation
apps/mobile             partially real transitional          shared mobile shell candidate
apps/android            partially real duplicate            transitional candidate to converge or delete
apps/ios                partially real duplicate            transitional candidate to converge or delete
android/*               partially real canonical candidate   preferred native Android candidate if mobile stays in scope
ios/*                   partially real canonical candidate   preferred native iOS candidate if mobile stays in scope
tests/*                 intentional rebuild surface          do not import legacy wholesale
reports/*               generated evidence/output           not a source-of-truth authoring surface
migration/*             active only until cutoff            becomes archive-only after Phase 1 exit
```

### 2.3 Architecture gates vs operational canon

The green depcruise gates govern the current architecture claim for:

```text
packages/*/*
apps/web
netlify/*
```

They do **not** by themselves prove or govern:

```text
scripts/ops/*
services/systemd/*
android/*
ios/*
apps/mobile
apps/android
apps/ios
```

Those surfaces need their own doctrine, runbooks, and validation rules.

### 2.4 Current mobile-root decision direction

Foundation work should use this convergence direction unless new evidence forces change:

```text
Canonical native candidates:   android/ and ios/
Canonical shared mobile shell: apps/mobile
Transitional duplicates:       apps/android and apps/ios
```

That is a **target decision for convergence**, not a claim that the convergence is already complete.

---

## 3. Documentation reboot model

### 3.1 What exists now

```text
README.md                         exists now and is canonical bootstrap control surface
MCP-MIGRATION.md                  exists now and is the preserved migration ledger
docs/README.md                    exists now but must be rewritten
docs/standards/*                  exists now and should largely survive
docs/discovery/*                  exists now and should be reviewed and rewritten as needed
docs/program/*                    exists now and should be reviewed and rewritten as needed
docs/workflows/*                  exists now and should be reviewed and rewritten as needed
docs/api/*                        exists now and should be reviewed/generated as needed
docs/adr/*                        exists now and should survive where still valid
migration/*                       exists now but is temporary active doctrine only until cutoff
```

### 3.2 Missing today but required during foundation

```text
AGENTS.md
CLAUDE.md (optional thin shim)
.codex/README.md or equivalent thin Codex bootstrap
CODEBUFF.md or equivalent thin CodeBuff bootstrap
docs/harness/*
docs/archive/README.md
docs/generated/README.md
```

### 3.3 Archive/rewrite/remove targets

These are not authoritative end-state doctrine.

```text
migration/*
docs/00-chatgpt-project-setup.md
docs/01-bootstrap-actions.md
docs/02-repo-skeleton.md
docs/03-linear-reboot-plan.md
docs/play.txt
stale charts/diagrams created for bootstrap only
any docs that still describe src/* as canonical ownership
any docs that still describe tools/harness as current runtime
```

### 3.4 Migration file mapping into the new doctrine

```text
migration/00-reading-order.md                -> README.md + AGENTS.md + docs/harness/00-index.md
migration/01-root-inventory.md               -> README.md + docs/discovery/01-service-runtime-matrix.md
migration/02-root-config-changes.md          -> docs/discovery/02-environments-and-secrets.md + ADRs as needed
migration/03-target-layout.md                -> README.md + docs/standards/architecture-standards.md
migration/04-src-to-target-mapping.md        -> docs/archive/* once no longer operationally needed
migration/05-harness-engineering.md          -> docs/harness/*
migration/06-netlify-and-api-migration.md    -> docs/program/* + docs/workflows/* + docs/api/*
migration/07-native-public-docs-and-runtime-state.md -> docs/program/* + docs/discovery/* + docs/workflows/*
migration/08-quality-gates-and-evidence.md   -> docs/harness/05-quality-gates.md + docs/harness/06-evidence-and-reporting.md
migration/09-compatibility-shims.md          -> ADR or archive only depending on live need
migration/10-sequenced-run-sheet.md          -> README.md phase order + docs/workflows/* where enduring
migration/11-done-criteria.md                -> README.md definition of complete
migration/AI-EXECUTION-PROMPT.md             -> AGENTS.md + .codex/* + CODEBUFF.md, then archive
```

### 3.5 What survives the reboot

The intended survivors are:

```text
README.md
MCP-MIGRATION.md
docs/README.md
docs/standards/*
docs/discovery/*
docs/program/*
docs/workflows/*
docs/api/*
docs/adr/*
new docs/harness/*
AGENTS.md
thin tool bootstraps only
```

### 3.6 Final retention/deletion rule

A file may be deleted only when all three are true:

1. its enduring knowledge has been rewritten into canonical doctrine
2. any required historical context is preserved under `docs/archive/*` or `MCP-MIGRATION.md`
3. the replacement is linked from `README.md` or `docs/README.md`

---

## 4. Launch scope and runtime truth

### 4.1 Current launch-scope statement

For ANQR 1.0 foundation, the current live launch story is:

```text
Web product on apps/web
Public HTTP QR API on Netlify
Public MCP surface on Netlify
Anonymous QR generation preserved
```

### 4.2 Explicitly not yet claimed

The following are **not** yet part of the official 1.0 claim unless later proven and documented:

```text
apps/api as a separate launch runtime
Android launch readiness
iPhone launch readiness
Store submission readiness
Mobile ad/runtime compliance
```

### 4.3 Launch-scope ownership after Phase 1

After the documentation reboot cutoff:

```text
README.md                           = root operating handbook
AGENTS.md                           = agent bootstrap and rules
docs/program/01-anqr-1.0-definition.md = single launch-scope source
docs/harness/*                      = harness doctrine
docs/standards/*                    = architecture and engineering standards
MCP-MIGRATION.md                    = preserved migration ledger/reference
```

---

## 5. What is intentionally not imported from legacy

Another agent must not confuse "legacy parity" with "copy everything".

Do **not** import these wholesale:

- legacy testing architecture as-is
- stale migration doctrine
- obsolete release scripts
- old package scaffolds that do not match the current package model
- duplicate mobile roots without a convergence decision
- pre-hex `src/*` ownership models
- any harness/runtime references that still point to removed `tools/harness` paths
- secrets, signing material, or operator-only configuration

What should be imported or rebuilt deliberately instead:

- launch-critical behavior
- QR parity/scannability evidence
- real current mobile/native assets only if mobile stays in scope
- current API/MCP behavior and docs
- release-significant operational knowledge
- valid store metadata/assets only if mobile stays in scope

---

## 6. Testing and quality policy

### 6.1 Core testing rule

The test story on `main` is an **intentional rebuild**.

- keep what already proves the current architecture and current launch claim
- rewrite what is still valuable but architecture-misaligned
- do not pull legacy test suites forward just to inflate coverage or claim parity

### 6.2 Gate tiers

#### Always-run inner loop

Run the smallest relevant set while implementing:

```bash
npm run typecheck
npm run lint
npm run depcruise
npm run depcruise:architecture
npm run depcruise:contracts
npm run contracts:check
npm run audit:ast
npm run test:unit
```

Use the touched-scope subset where reasonable, then the broader set when the change grows.

#### Pre-merge

For **current in-scope 1.0 work** touching `packages/*/*`, `apps/web`, `netlify/*`, or `public/*`, the expected base pre-merge command set is:

```bash
npm run typecheck:apps
npm run typecheck:packages
npm run typecheck:netlify
npm run lint:apps
npm run lint:packages
npm run lint:netlify
npm run depcruise:all
npm run contracts:check
npm run audit:ast
npm run openapi:generate
npm run test:unit
npm run build:web
```

Conditional add-ons are required as follows:

```text
web UI or critical-flow change         -> npm run test:basic
gallery/render/export flow change      -> npm run test:advanced
release-candidate or broad regression   -> npm run test
harness-only change                     -> move to harness validation set; do not substitute for product pre-merge
mobile change                           -> use Mobile-only gates; not part of current in-scope base set
```

`npm run harness:quick`, `npm run queue:all:dry-run`, and `npm run symphony:status` remain required for harness/ops work, but they are **not** part of the default product pre-merge set for the current web + Netlify 1.0 claim.

#### Release gates

These are launch-facing and cannot be hand-waved:

- web critical-flow verification
- API/MCP route verification
- parity/scannability evidence
- gallery/render/export verification
- performance budget verification
- Sentry/release observability verification
- Netlify deployed perimeter verification
- analytics/ads/legal verification where retained

#### Mobile-only gates

These are required only if mobile remains in the 1.0 claim:

- native build proof
- camera/import/export/share verification
- physical-device smoke
- package size budget
- store-readiness artifacts
- native service/plugin wiring proof

#### Manual/external gates

These are always human-controlled:

- production billing or spend changes
- store submissions and promotions
- signing-key handling
- organization security/admin changes
- legal/compliance acceptance
- ad-network approvals

### 6.3 Test families to own explicitly

```text
unit tests
API/MCP integration tests
web critical-flow E2E/smoke tests
QR parity/scannability verification
gallery/regression checks
performance and memory checks
mobile smoke/device tests if mobile stays in scope
```

---

## 7. Fresh-machine harness bootstrap contract

This section defines the minimum boot contract for a new machine.

### 7.1 Reduced capability boot

Required:

```text
git
bash
node + npm compatible with the repo
python3
curl
jq
zip/unzip
repo checkout
npm install completed
```

Reduced capability means the machine can:

- read and rewrite docs
- edit source
- run local static validation
- generate OpenAPI locally
- perform architecture/package work

Reduced capability does **not** imply:

- scheduled harness execution
- provider-routed automation
- email ingest
- Linear sync
- production verification
- store/mobile release work

### 7.2 Full harness capability boot

Requires everything in reduced capability plus:

```text
access to the harness env source (for example services/systemd/anqr-ops.env or its secret-managed equivalent)
systemd access or an equivalent documented runner mechanism
AI provider credentials used by the harness routing stack
Linear credentials
notification/email credentials if those flows remain enabled
Netlify/Sentry/Sonar and similar operator credentials when those workflows are in scope
optional Ollama / LiteLLM / local model-router components when local routing is enabled
```

### 7.3 Mobile/release-only capability boot

Human-only unless explicitly delegated with the required secrets and tooling:

```text
Android SDK / adb / Gradle toolchain
iOS/Xcode toolchain
fastlane/bundler where applicable
store credentials and signing material
mobile service config requiring protected secrets
```

### 7.4 Environment sources

Foundation docs must classify environment inputs into:

```text
local developer env
CI env
Netlify env
harness/systemd env
mobile/native env
operator-only protected env
```

### 7.5 Required ports

A truthful authoritative port table does **not yet exist** in the rebooted docs.
That is a required Phase 1 deliverable.

Until `docs/harness/02-runtime-and-services.md` defines ports explicitly:

- do not hardcode undocumented port assumptions into doctrine
- do not claim fresh-machine reproducibility for local services that depend on unspecified ports
- any task depending on a local service port must record the actual source of truth used

### 7.6 "Degraded but usable" definition

The system is considered degraded but usable when:

- local code/doc work can continue
- core validation can run
- package/web/netlify code changes can be prepared
- the harness scheduler or external integrations may be offline
- production or provider-backed automation is unavailable

It is **not** degraded-but-usable when the repo cannot be validated locally at all.

---

## 8. Fresh Linear workspace model

### 8.1 Hard decision

Use this hybrid model:

```text
Projects = program streams / package families
Labels   = concrete packages, runtimes, authority, and routing
```

Do **not** create one project per concrete package unless a future scale issue proves it necessary.

### 8.2 Required project set

```text
Foundation & Governance
Documentation & Doctrine
Harness & Automation
Web Experience
API & MCP Delivery
QR Engine & Core Packages
Mobile Convergence
Observability & Reliability
Release Readiness
Growth / SEO / Discoverability
Compliance / Privacy
Incidents / Ops
```

### 8.3 Required states

```text
Backlog
Ready
Todo
In Progress
Blocked
In Review
Done
Archived
```

### 8.4 Required labels

```text
pkg:contracts
pkg:domain
pkg:application
pkg:platform
pkg:ui
pkg:analytics
pkg:observability
pkg:config
pkg:testing
app:web
app:api
app:mobile
runtime:netlify
runtime:harness
runtime:mobile
runtime:android
runtime:ios
docs
release
incident
human-only
sonar
```

### 8.5 Required authority levels

```text
observe
propose
implement
verify
promote
communicate-external
spend-money
```

### 8.6 Required descriptor semantics

```text
[PARENT]
[CHILD]
[HUMAN]
[LOCAL-SLICE]
[HARNESS]
[Sonar]
```

### 8.7 Workspace rules

- one bounded task per issue
- oversized work decomposes into child issues
- one primary project per issue
- concrete package ownership goes in labels/components
- human-only tasks are explicitly tagged and excluded from automation
- every issue must define verification and evidence expectations
- completion requires recorded evidence, not just status movement

---

## 9. Evidence and reporting contract

Every AI or operator completion note must use this format.

~~~md
## Summary
<what changed>

## Scope class
- docs-harness / current-platform / launch-convergence / operational-external

## Touched paths
- <path>

## Decisions made
- <decision>

## Commands run
```bash
<command 1>
<command 2>
```

## Results
- PASS/FAIL: <command> -> <result>

## Changed files
- <file>

## Commit
- <hash>

## Artifacts
- screenshots / logs / traces / request-response samples / device proof

## Risk / rollback
- <note>

## Follow-up
- <next work>
~~~

### 9.1 When extra artifacts are mandatory

```text
UI or UX change                    -> screenshot or video proof
API/MCP/auth/perimeter change      -> request/response examples + logs
harness/systemd change             -> service status / timer status / journal proof
performance change                 -> benchmark, trace, or timing proof
mobile/native change               -> build proof + device proof
release claim change               -> doc update + validation evidence + signoff note
```

---

## 10. Ordered migration plan

The remaining migration work must happen in this order.

### Phase 0 — Freeze and capture the current state

- [ ] capture current validation evidence
- [ ] capture current tree snapshot
- [ ] capture current repo-surface inventory
- [ ] capture current docs inventory
- [ ] capture current harness/runtime inventory
- [ ] export the Linear history needed for traceability
- [ ] perform secret and signing-material review
- [ ] record current platform truth exactly as in this README

Suggested evidence set:

```bash
npm run typecheck
npm run lint
npm run depcruise:all
npm run contracts:check
npm run audit:ast
npm run openapi:generate
npm run test:unit
npm run harness:quick
npm run queue:all:dry-run
npm run symphony:status
```

### Phase 1 — Reboot the documentation surface

This is the highest-priority foundation work.

- [ ] keep `README.md` as root bootstrap handbook
- [ ] create `AGENTS.md`
- [ ] create optional `CLAUDE.md` thin shim
- [ ] create `.codex/*` thin bootstrap
- [ ] create `CODEBUFF.md` thin bootstrap
- [ ] rewrite `docs/README.md`
- [ ] create `docs/harness/00-index.md`
- [ ] create `docs/harness/01-operating-model.md`
- [ ] create `docs/harness/02-runtime-and-services.md`
- [ ] create `docs/harness/03-workspace-governance.md`
- [ ] create `docs/harness/04-provider-routing.md`
- [ ] create `docs/harness/05-quality-gates.md`
- [ ] create `docs/harness/06-evidence-and-reporting.md`
- [ ] create `docs/harness/07-secrets-redaction-and-operator-access.md`
- [ ] create `docs/harness/08-runbooks.md`
- [ ] create `docs/harness/09-archive-policy.md`
- [ ] create `docs/archive/README.md`
- [ ] create `docs/generated/README.md`
- [ ] create or rewrite `docs/program/01-anqr-1.0-definition.md`
- [ ] cross-link all canonical docs
- [ ] mark `migration/*` archive-only once the cutoff rule is satisfied

Phase 1 exit criteria:

- a new agent can determine what to read first without guessing
- launch scope exists in one place only
- harness runtime has a documented home
- evidence rules are documented
- workspace governance is documented
- archive vs doctrine vs generated is explicit

### Phase 2 — Bootstrap the fresh workspace

- [ ] create or reset the Linear workspace according to Section 8
- [ ] create the required projects
- [ ] create the required labels
- [ ] define state usage rules
- [ ] define issue sizing rules
- [ ] define human-only routing
- [ ] import/export only the Linear history that must survive
- [ ] publish the workspace governance doc

### Phase 3 — Classify and stabilize the harness runtime

- [ ] classify all `scripts/ops/*` surfaces as required / optional / archival
- [ ] classify all `services/systemd/*` units as required / optional / archival
- [ ] document the maintained control flow:
  - harness-report -> guardian -> queue control -> runner -> notify
- [ ] document provider routing and fallback
- [ ] document env sources and redaction rules
- [ ] document degraded-mode behavior
- [ ] document port expectations truthfully
- [ ] decide what remains blocking versus advisory

Required inventory to classify:

```text
scripts/ops/harness-report.mjs
scripts/ops/linear-guardian.mjs
scripts/ops/symphony-queue-control.mjs
scripts/ops/symphony-runner.mjs
scripts/ops/symphony-agent.mjs
scripts/ops/symphony-credit-gate.mjs
scripts/ops/nightly-ops-pass.mjs
scripts/ops/email-ingest.mjs
scripts/ops/lib/notify.mjs
provider bootstrap/config files
services/systemd/*
```

### Phase 4 — Current platform refinement on the real 1.0 claim

This phase is limited to the current official scope:

```text
apps/web
netlify/*
packages/*/*
public/*
```

- [ ] maintain strict package architecture
- [ ] keep Netlify handlers thin
- [ ] keep anonymous QR generation intact
- [ ] maintain OpenAPI/MCP contract sync
- [ ] preserve gallery, export/share, analyze, observability, and analytics where in scope
- [ ] keep performance budgets visible
- [ ] keep public routes truthful and documented

### Phase 5 — API/MCP and Netlify perimeter completion

- [ ] configure real deployed perimeter controls
- [ ] verify public route behavior
- [ ] keep docs in sync with deployed public routes
- [ ] implement the default anonymous/public posture with perimeter controls
- [ ] keep Firebase/JWKS as an optional later hardening path only
- [ ] keep `apps/api` deferred unless explicitly promoted
- [ ] document the final 1.0 API/MCP posture

### Phase 6 — Mobile convergence decision and execution

- [ ] decide whether mobile is brought into the 1.0 claim or excluded
- [ ] if retained, converge to:
  - `android/`
  - `ios/`
  - `apps/mobile`
- [ ] classify `apps/android` and `apps/ios` as remove / collapse / retain with reason
- [ ] verify native service/plugin wiring if mobile remains in scope
- [ ] verify download/share/camera flows if mobile remains in scope
- [ ] verify size/performance/store-readiness if mobile remains in scope
- [ ] if mobile is excluded, update all docs and remove claim ambiguity

### Phase 7 — Intentional testing rebuild and launch-grade validation

- [ ] define canonical ownership for tests on `main`
- [ ] keep or rebuild only tests that prove the current launch claim
- [ ] restore web/API critical-flow verification
- [ ] restore parity/scannability verification
- [ ] restore performance and memory verification
- [ ] restore observability/release validation
- [ ] add mobile verification only if mobile is in scope

### Phase 8 — Archive cleanup and final handover

- [ ] move replaced migration/bootstrap docs to archive status
- [ ] remove stale charts and bootstrap-only diagrams
- [ ] publish final docs map
- [ ] publish final launch claim truth table
- [ ] publish final environment and service matrix
- [ ] publish final workspace governance
- [ ] publish final operator runbooks
- [ ] confirm no remaining live doctrine exists outside the canonical surface

---

## 11. Comprehensive migration backlog families

Nothing below should be forgotten just because the architecture split reached green.

### 11.1 Documentation and doctrine

- [ ] root bootstrap docs
- [ ] launch-scope doc
- [ ] harness docs
- [ ] archive policy
- [ ] generated-artifact policy
- [ ] workflow/runbook cleanup
- [ ] doc cross-linking

### 11.2 Harness engineering

- [ ] workspace governance
- [ ] provider routing
- [ ] queue/runner/guardian flow
- [ ] env and redaction rules
- [ ] degraded-mode rules
- [ ] evidence and reporting contract
- [ ] operator runbooks

### 11.3 Current platform product work

- [ ] web delivery
- [ ] Netlify delivery
- [ ] QR generator correctness
- [ ] gallery
- [ ] analyze flows
- [ ] export/share
- [ ] observability
- [ ] analytics/ads as retained
- [ ] performance budgets

### 11.4 API/MCP and perimeter

- [ ] public route truth
- [ ] OpenAPI sync
- [ ] deployed perimeter controls
- [ ] rate-limit posture
- [ ] auth posture
- [ ] request/runtime limits
- [ ] background/asynchronous execution rules where needed

### 11.5 Mobile/native

- [ ] mobile claim decision
- [ ] native root convergence
- [ ] shared mobile shell decision
- [ ] native service config review
- [ ] camera/share/export flows
- [ ] package size and performance
- [ ] store readiness if in scope

### 11.6 Testing and quality

- [ ] intentional test rebuild
- [ ] unit tests
- [ ] API/MCP integration
- [ ] E2E/smoke
- [ ] parity/scannability
- [ ] performance/memory
- [ ] release verification
- [ ] mobile device verification if in scope

### 11.7 Operational/external

- [ ] Netlify production controls
- [ ] Sentry/release checks
- [ ] analytics/ad verification where retained
- [ ] consent/legal verification where retained
- [ ] external service inventory
- [ ] secret ownership
- [ ] production environment matrix

---

## 12. AI handover contract

Any AI agent taking work in this repo must follow this contract.

### 12.1 Read order

Once `AGENTS.md` exists, use this split read order:

```text
Humans/operators: README.md -> AGENTS.md -> docs/README.md -> relevant docs
AI agents:        AGENTS.md -> README.md -> docs/README.md -> relevant docs
```

For AI agents, that means:

1. read `AGENTS.md`
2. read `README.md`
3. read `docs/README.md`
4. read `docs/standards/*`
5. read `docs/harness/*`
6. read the relevant issue or runbook
7. only then touch source files

### 12.2 Planning note

The agent must state:

- goal
- scope class
- touched paths
- whether the task is automation-safe or human-only
- verification plan
- rollback note

### 12.3 Allowed without extra approval

- documentation updates
- code changes
- refactors
- validation runs
- non-costing config cleanups
- issue decomposition
- backlog hygiene

### 12.4 Must be escalated / human-only

- paid spend
- billing/subscription changes
- production billing controls
- store submissions/promotions
- signing material handling
- org-level security/admin changes
- privacy/compliance posture changes
- changing the default anonymous MCP posture
- adding mobile to the launch claim without proof

### 12.5 Task sizing rule

Automation-sized work should usually be:

- independently verifiable
- 1 to 3 clear acceptance criteria
- small enough to validate in one pass
- decomposed if it spans unrelated roots or runtime classes

### 12.6 Canonical validation commands

Use the smallest relevant set first, then the broader set when the change is substantial.

For the current in-scope product surface (`packages/*/*`, `apps/web`, `netlify/*`, `public/*`):

```bash
npm run typecheck:apps
npm run typecheck:packages
npm run typecheck:netlify
npm run lint:apps
npm run lint:packages
npm run lint:netlify
npm run depcruise:all
npm run contracts:check
npm run audit:ast
npm run openapi:generate
npm run test:unit
npm run build:web
```

Add the relevant Playwright tier when applicable:

```bash
npm run test:basic
npm run test:advanced
npm run test
```

For harness/ops work, add:

```bash
npm run harness:quick
npm run queue:all:dry-run
npm run symphony:status
```

### 12.7 Required handover block

Use this exact structure.

~~~md
## Task
<one bounded objective>

## Scope class
- docs-harness / current-platform / launch-convergence / operational-external

## Required context
- README.md
- AGENTS.md
- docs/README.md
- relevant docs/runbooks/issues

## Touched paths
- <path>

## Constraints
- architecture / privacy / cost / human-only / launch-claim constraints

## Verification
```bash
<commands>
```

## Expected evidence
- summary
- decisions
- results
- changed files
- commit
- artifacts
- rollback note
- follow-ups

## Escalate if
- paid spend is required
- prod auth/privacy posture changes are required
- store/signing work is required
- operator secret access is required
- launch scope is being reduced or expanded
~~~

---

## 13. Recommended immediate next actions

This is the correct immediate order from here.

1. finish the documentation reboot
2. create `AGENTS.md` and the thin tool bootstraps
3. create `docs/harness/*`
4. export/preserve the required Linear history
5. create the fresh Linear workspace using the hybrid model
6. classify and document the harness runtime
7. only then continue current-platform product work
8. resolve the mobile claim truthfully before any 1.0 launch claim expansion

---

## 14. Definition of migration complete

The migration is complete only when all of the following are true:

- the documentation reboot cutoff has been reached
- there is one live doctrine surface and one archive surface
- launch scope lives in one place only
- the harness runtime is classified and documented
- the fresh workspace exists with explicit governance and evidence rules
- current web + Netlify/API/MCP scope is launch-ready and truthful
- `apps/api` is either explicitly deferred or explicitly promoted by decision
- mobile is either converged and proven or explicitly excluded from the 1.0 claim
- tests are intentionally rebuilt and match the claim
- the environment/service matrix is explicit
- public/static ownership is explicit
- archive/generated/canonical surfaces are clearly separated

Until then, this README remains the source of truth for foundation work.
