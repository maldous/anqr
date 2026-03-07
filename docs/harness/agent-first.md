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

### Operational Invariants

- One simple task per issue.
- Oversized issues must be split into child issues before execution.
- Every `[CHILD]` issue must be linked to a `[PARENT]` issue via Linear parent/child relationship (title prefix alone is not sufficient).
- Human-only work (no API, external portal/manual click-through, token/account creation) must move to `Pending` with explicit unblock steps and required validation evidence.
- Descriptor prefixes must be explicit and consistent (`[SENTINEL]`, `[PARENT]`, `[CHILD]`, `[HUMAN]`).
- Priority must be explicit for every actionable issue.
- There must always be at least one issue in `In Progress`.
- With two-slot orchestration, keep exactly two `In Progress` issues: one `[SENTINEL]` plus one highest-priority actionable work issue.
- **Done requires proof.** Every issue moved to Done must have a comment with commit hashes, validation command output, and explicit pass/fail verdict. Evidence of failure, workarounds, or dismissive one-liners do not qualify. See [Evidence Policy](../workflow/execution-workflow.md#evidence-policy).

### Request Triage Default

When an operator asks for action, decide using this default:

1. Create/route a Linear task by default.
2. Execute immediately only when deferring would be harmful or inappropriate for task routing (for example: production outage mitigation, live misconfiguration correction, broken scheduler/service health, or urgent metadata hygiene blocking execution).
3. After immediate execution, still create/update a tracking issue if follow-up work remains.

## Agent-Specific Configuration

- Codebuff: [`codebuff-config.md`](codebuff-config.md) — `knowledge.md` and `.codebuffignore` conventions.
- Codex: `.codex/skills/` — Linear, commit, push, pull, and land skills.
