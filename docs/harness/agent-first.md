# Agent-First Harness Model

This repository follows an agent-first harness model:

- `AGENTS.md` is a concise map, not the full knowledge base.
- Canonical project knowledge lives in `docs/`.
- Legacy markdown outside `docs/` exists for compatibility only and should link to canonical pages.

## Working Contract

1. Confirm issue state and update tracking before implementation.
2. Capture reproduction evidence before making changes.
3. Sync with latest `origin/master` before edits.
4. Execute against an explicit checklist.
5. Validate with deterministic commands and record outcomes.
6. Keep issue metadata and workpad aligned with actual state.
7. Post evidence to the Linear issue before marking Done (see [Evidence Policy](../workflow/execution-workflow.md#evidence-policy)).

## Documentation Policy

- New durable knowledge belongs in `docs/`.
- Historical logs belong in `docs/archive/`.
- Do not duplicate canonical content across multiple legacy files.

## Harness Engineering Feedback Loop

Treat operator feedback and production incidents as harness inputs, not ad-hoc notes.

1. Capture the observed failure mode or operator correction as a durable rule in `docs/`.
2. Convert the rule into automation when possible (guardian checks, workflow constraints, timers).
3. Validate behavior with deterministic evidence (service logs, issue state snapshots, command outputs).
4. Keep state/priority/labels synchronized continuously via scheduled hygiene jobs.
5. Prefer system-level prevention over one-off manual correction.

### Cross-Platform Testing Feedback Loop

QR rendering parity across browser, API, iOS, and Android is enforced by layered testing:

1. **Unit tests** (Vitest) validate platform-specific logic in isolation (AdMob, native toast, web-only assets, banner height, deep links).
2. **Playwright API tests** verify the `/api/qr` Netlify Function produces correct images for all parameter combinations.
3. **Playwright parity tests** compare browser canvas output against API output pixel-by-pixel using `pixelmatch`.
4. **Appium E2E tests** verify iOS and Android native apps render correctly in their respective WebView contexts.
5. **OS gates** in the Makefile prevent running iOS tests on Linux or Android tests on macOS.

All Playwright tests run against `netlify dev` (port 8888) so both the Vite app and Netlify Functions are available in the same test run.

### Operational Invariants

- One simple task per issue.
- Oversized issues must be split into child issues before execution.
- Every `[CHILD]` issue must be linked to a `[PARENT]` issue via Linear parent/child relationship (title prefix alone is not sufficient).
- Human-only work (no API, external portal/manual click-through, token/account creation) must move to `Pending` with explicit unblock steps and required validation evidence.
- Catastrophic AI retry failures that are not truly human-only must move to `Todo` (AI retry lane), not `Pending`.
- Descriptor prefixes must be explicit and consistent (`[PARENT]`, `[CHILD]`, `[HUMAN]`, `[EMAIL]`, `[CI]`, `[HARNESS]`).
- Priority must be explicit for every actionable issue.
- Exactly one issue must be `In Progress` at any time, aligned with the highest-priority actionable work. See [Board Hygiene](board-hygiene.md) for enforcement rules.
- **Done requires proof.** Every issue moved to Done must have a comment with commit hashes, validation command output, and explicit pass/fail verdict. Evidence of failure, workarounds, or dismissive one-liners do not qualify. See [Evidence Policy](../workflow/execution-workflow.md#evidence-policy).

### Request Triage Default

When an operator asks for action, decide using this default:

1. Create/route a Linear task by default.
2. Execute immediately only when deferring would be harmful or inappropriate for task routing (for example: production outage mitigation, live misconfiguration correction, broken scheduler/service health, or urgent metadata hygiene blocking execution).
3. After immediate execution, still create/update a tracking issue if follow-up work remains.

## Linear Issue CLI Tools

Standalone CLI scripts for creating Linear issues without writing raw GraphQL:

- **Create issue:** `node scripts/ops/create-issue.mjs --title "..." [--priority 1-4] [--label name] [--team ANQ]`
- **Create child:** `node scripts/ops/create-child-issue.mjs --parent ANQ-123 --title "..."`
- **Show usage:** `make issue:create` / `make issue:create:child`

Both require `LINEAR_API_KEY`. The standalone script also accepts `--parent` for optional parent linking.

## Agent-Specific Configuration

- Codebuff: [`codebuff-config.md`](codebuff-config.md) — `knowledge.md` and `.codebuffignore` conventions.
- Codex: `.codex/skills/` — Linear, commit, push, pull, and land skills.
