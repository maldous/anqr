# AGENTS.md - AI Agent Execution Contract

This file is the **first-read execution contract** for AI agents working on ANQR 1.0.

## Read order for AI agents

1. **AGENTS.md** (this file) — your execution rules
2. [README.md](/home/user/src/anqr/README.md) — bootstrap truth and scope
3. [docs/README.md](/home/user/src/anqr/docs/README.md) — documentation index
4. [docs/program/01-anqr-1.0-definition.md](/home/user/src/anqr/docs/program/01-anqr-1.0-definition.md) — launch scope
5. [docs/harness/00-index.md](/home/user/src/anqr/docs/harness/00-index.md) — harness doctrine
6. Relevant standards, workflows, or issue context

## Core execution rules

### Task sizing

- One bounded task per issue
- Decompose oversized work into child issues
- Keep tasks independently verifiable
- Use 1-3 clear acceptance criteria

### Validation commands

For product work (`packages/*/*`, `apps/web`, `netlify/*`):

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
npm run test:unit
npm run build:web
```

For harness/ops work (`scripts/ops/*`, `services/systemd/*`):

```bash
npm run harness:quick
npm run queue:all:dry-run
npm run symphony:status
```

Add Playwright when touching UI:

```bash
npm run test:basic      # for critical flows
npm run test:advanced   # for gallery/export
```

### Evidence requirements

Every completion must include:

- Summary of changes
- Scope class (docs-harness / current-platform / launch-convergence / operational-external)
- Touched paths
- Decisions made
- Commands run with pass/fail results
- Changed files
- Commit hash
- Risk/rollback note
- Follow-up work

Extra artifacts required for:

- UI changes → screenshots
- API/MCP changes → request/response examples
- Harness/systemd changes → service status or journal output
- Performance work → benchmark data
- Mobile work → build + device proof

### Escalation rules

**Must escalate to humans:**

- Paid spend or billing changes
- Production controls
- Store submissions
- Signing material
- Org-level security/admin changes
- Privacy/compliance posture changes
- Changing the default anonymous MCP posture
- Adding mobile to the launch claim

**Safe for automation:**

- Documentation updates
- Code changes within scope
- Refactors
- Validation runs
- Non-costing config cleanups
- Issue decomposition
- Backlog hygiene

### Scope boundaries

**Current official 1.0 claim:**

- `apps/web` — canonical web delivery
- `netlify/*` — canonical API/MCP delivery
- `packages/*/*` — canonical reusable architecture
- `public/*` — static/public assets

**Reserved/deferred:**

- `apps/api` — not part of current claim
- Android — not yet claimed for 1.0
- iPhone — not yet claimed for 1.0

**Harness (separate from product architecture):**

- `scripts/ops/*` — canonical harness runtime
- `services/systemd/*` — canonical operator automation

### Quality gates

**Blocking checks** (must pass before merge):

- `typecheck` — TypeScript compilation
- `lint` — oxlint violations
- `test-unit` — unit test correctness
- `depcruise` — architecture boundaries
- `ast-density` — one declaration per file

**Advisory checks** (tracked but not blocking):

- `cspell-coverage` — spelling
- `docs-freshness` — stale documentation
- `sonar-audit` — quality insights
- `ollama-health` — environment-dependent
- `litellm-routing` — environment-dependent

### Harness workflow

The maintained control flow:

```
harness-report → linear-guardian → queue control → symphony runner → notify
```

Supporting jobs:

- nightly ops pass
- email ingest
- Sonar sync and audit
- provider credit/routing checks

**Important:** Temporary working scripts (e.g., one-off issue creation scripts, test scripts) must be placed in git-ignored directories to ensure concurrent operations do not conflict. Use `scripts/ops/.workspace/` (already in `.gitignore`) for such temporary files.

### Provider routing

The harness uses a cascading provider model with failure cooldown:

1. **codex** (gpt-5.4) — primary, uses OpenAI credits
2. **groq**, **mistral**, **gemini** — free tier providers
3. **codebuff** (SDK-based) — autonomous agent with paid → free mode fallback
4. **codebuff-bridge** (HTTP) — OpenAI-compatible gateway for OpenClaw integration
5. **ollama-local** — local fallback

Codebuff uses a single API key with automatic mode selection:

- `CODEBUFF_API_KEY` — single account (paid mode first, free mode fallback)

**Codebuff bridge:** `http://127.0.0.1:4318` (OpenAI-compatible gateway)

- Exposes Codebuff SDK via OpenAI-compatible HTTP API
- Supports streaming responses (SSE)
- Automatic paid → free mode fallback with periodic re-validation
- Configured via `.openclaw/models.json` for OpenClaw integration

### Degraded mode

The harness remains usable when:

- Provider routing is degraded
- Queue runs in dry-run mode
- Public MCP/API continues without authenticated hardening

When degraded, **say so explicitly** instead of pretending full capability.

### Documentation ownership

- `docs/program/*` — product definition, scope, program policy
- `docs/harness/*` — harness operating model, runtime, governance
- `docs/standards/*` — engineering standards
- `docs/workflows/*` — operator workflows
- `docs/archive/*` — historical context only
- `docs/generated/*` — generated artifacts (not doctrine source)
- `migration/*` — archive-only (no new operational truth)

### Workspace governance

Use the hybrid Linear model:

- Projects by stream/package family
- Concrete packages tracked by labels
- Required states: Backlog, Todo, In Progress, In Review, Blocked, Human Review, Done, Canceled
- Use `Human Review` for approvals, secrets, legal, store, billing
- Use `Blocked` only for external blockers
- Preserve evidence in issue body or linked artifacts

### Bootstrap contract

**Reduced capability** (developer machine):

- git, bash, node, npm, python3, curl, jq, zip
- repo checkout + `npm install`
- Can run local validation, edit source, generate docs
- Cannot run scheduled harness, provider-routed automation, or mobile builds

**Full harness capability:**

- All reduced capability requirements
- `services/systemd/anqr-ops.env` or secret-managed equivalent
- systemd user service access (`systemctl --user`) or documented runner mechanism
- AI provider credentials
- Linear credentials
- Netlify/Sentry/Sonar credentials when in scope

**Mobile/release capability** (human-only unless delegated):

- Android SDK / adb / Gradle
- iOS/Xcode toolchain
- fastlane/bundler
- Store credentials and signing material

### Truth rules

- Do not claim a gate passed unless it actually ran
- Do not claim mobile is launch-ready because roots exist
- Do not treat `apps/api` as live unless explicitly promoted
- Do not import legacy wholesale — rebuild intentionally
- Keep launch truth in one place (docs/program/01-anqr-1.0-definition.md)

### Handover block format

Use this structure for task handover:

````markdown
## Task

<one bounded objective>

## Scope class

- docs-harness / current-platform / launch-convergence / operational-external

## Required context

- README.md, AGENTS.md, docs/README.md, relevant docs

## Touched paths

- <path>

## Constraints

- architecture / privacy / cost / human-only / launch-claim constraints

## Verification

```bash
<commands>
```
````

## Expected evidence

- summary, decisions, results, changed files, commit, artifacts, rollback note, follow-ups

## Escalate if

- paid spend, prod auth changes, store/signing work, operator secrets, launch scope changes
```

---

For human/operator read order, see [README.md](/home/user/src/anqr/README.md).
