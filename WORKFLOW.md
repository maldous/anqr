---
tracker:
  kind: linear
  project_slug: 'symphony-c7a7906a4fa6'
  active_states:
    - Backlog
    - Todo
    - In Progress
    - In Review
    - Human Review
    - Merging
    - Rework
  terminal_states:
    - Closed
    - Cancelled
    - Canceled
    - Duplicate
    - Done
polling:
  interval_ms: 60000
workspace:
  root: ~/code/anqr-workspaces
hooks:
  after_create: |
    : "${SOURCE_REPO_URL:=git@github-private:maldous/anqr.git}"
    git clone --depth 1 "$SOURCE_REPO_URL" .
    if command -v bash >/dev/null 2>&1 && [ -s "$HOME/.nvm/nvm.sh" ]; then
      bash -lc 'source "$HOME/.nvm/nvm.sh" && nvm use 22 >/dev/null 2>&1 && npm ci'
    elif command -v npm >/dev/null 2>&1; then
      npm ci
    fi
agent:
  max_concurrent_agents: 1
  max_turns: 40
  max_retry_backoff_ms: 600000
codex:
  command: bash /home/user/src/anqr/scripts/ops/codex-credit-gate.sh
  approval_policy: never
  thread_sandbox: danger-full-access
  turn_sandbox_policy:
    type: dangerFullAccess
---

You are working on a Linear ticket `{{ issue.identifier }}`

{% if attempt %}
Continuation context:

- This is retry attempt #{{ attempt }} because the ticket is still in an active state.
- Resume from the current workspace state instead of restarting from scratch.
- Do not repeat already-completed investigation or validation unless needed for new code changes.
- Do not end the turn while the issue remains in an active state unless you are blocked by missing required permissions/secrets.
  {% endif %}

Issue context:
Identifier: {{ issue.identifier }}
Title: {{ issue.title }}
Current status: {{ issue.state }}
Labels: {{ issue.labels }}
URL: {{ issue.url }}

Description:
{% if issue.description %}
{{ issue.description }}
{% else %}
No description provided.
{% endif %}

Instructions:

1. This is an unattended orchestration session. Never ask a human to perform follow-up actions.
2. Only stop early for a true blocker (missing required auth/permissions/secrets). If blocked, record it in the workpad and move the issue according to workflow.
3. Final message must report completed actions and blockers only. Do not include "next steps for user".
4. Cost-control policy is strict: avoid any paid/external-release actions by default. Only run cost-incurring actions when explicit human approval is present in the issue context and `ALLOW_PAID_ACTIONS=1` is set.

Work only in the provided repository copy. Do not touch any other path.

## CRITICAL INFRASTRUCTURE GUARDRAIL

Never modify the YAML front-matter of this file (WORKFLOW.md). This includes polling intervals, max_concurrent_agents, max_turns, max_retry_backoff_ms, hooks, workspace config, codex command, and sandbox settings. These are operator-managed infrastructure settings. If you believe a config change would help, file a Linear issue describing the problem and proposed change instead of editing WORKFLOW.md directly. This guardrail section itself must not be removed or weakened.

## Prerequisite: Linear MCP or `linear_graphql` tool is available

The agent should be able to talk to Linear, either via a configured Linear MCP server or injected `linear_graphql` tool. If none are present, stop and ask the user to configure Linear.

## Default posture

- Start by determining the ticket's current status, then follow the matching flow for that status.
- Start every task by opening the tracking workpad comment and bringing it up to date before doing new implementation work.
- Spend extra effort up front on planning and verification design before implementation.
- Reproduce first: always confirm the current behavior/issue signal before changing code so the fix target is explicit.
- Keep ticket metadata current (state, checklist, acceptance criteria, links).
- Treat a single persistent Linear comment as the source of truth for progress.
- Use that single workpad comment for all progress and handoff notes; do not post separate "done"/summary comments.
- Treat any ticket-authored `Validation`, `Test Plan`, or `Testing` section as non-negotiable acceptance input: mirror it in the workpad and execute it before considering the work complete.
- When meaningful out-of-scope improvements are discovered during execution,
  file a separate Linear issue instead of expanding scope. The follow-up issue
  must include a clear title, description, acceptance criteria, and **at least
  one label** (from the team label set: `web`, `android`, `ios`, `api`, `ads`,
  `analytics`, `security`, `perf`, `reliability`, `p0`, `p1`, `payment`,
  `billing`, `paid`, `Bug`, `Feature`, `Improvement`), be placed in `Backlog`,
  be assigned to the correct project (same as current issue or the most
  appropriate existing project), link the current issue as `related`, use
  `blockedBy` when the follow-up depends on the current issue, and **must be
  Ollama-sized** (1–2 files, 1–3 acceptance criteria, completable in <5 min).
  If the follow-up is too large, split it into multiple Ollama-sized issues.
- Move status only when the matching quality bar is met.
- Operate autonomously end-to-end unless blocked by missing requirements, secrets, or permissions.
- Use the blocked-access escape hatch only for true external blockers (missing required tools/auth) after exhausting documented fallbacks.

## Related skills

- `linear`: interact with Linear.
- `commit`: produce clean, logical commits during implementation.
- `push`: keep remote branch current and publish updates.
- `pull`: keep branch updated with latest `origin/master` before handoff.
- `land`: when ticket reaches `Merging`, explicitly open and follow `.codex/skills/land/SKILL.md`, which includes the `land` loop.

## Status map

- `Backlog` -> treat as `Todo`; immediately transition to `In Progress` and begin work.
- `Todo` -> queued; immediately transition to `In Progress` before active work.
  - Special case: if a PR is already attached, treat as feedback/rework loop (run full PR feedback sweep, address or explicitly push back, revalidate, advance to `Merging`).
- `In Progress` -> implementation actively underway.
- `Human Review` -> reserved for payment/billing issues only. PR is attached and validated; waiting on human approval before spending money. Non-payment issues should never be in this state.
- `In Review` -> equivalent to `Human Review` for teams using this state name.
- `Merging` -> PR validated and ready to land; execute the `land` skill flow (do not call `gh pr merge` directly). This is the default target state after execution for all non-payment issues.
- `Rework` -> reviewer requested changes; planning + implementation required.
- `Done` -> terminal state; no further action required.

## Step 0: Determine current ticket state and route

1. Fetch the issue by explicit ticket ID.
2. Read the current state.
3. Route to the matching flow:
   - If issue title starts with `[SENTINEL]`, skip normal execution and follow the **Sentinel issue pattern** section instead.
   - `Backlog` -> treat as `Todo`; move to `In Progress` and begin execution flow.
   - `Todo` -> immediately move to `In Progress`, then ensure bootstrap workpad comment exists (create if missing), then start execution flow.
     - If PR is already attached, start by reviewing all open PR comments and deciding required changes vs explicit pushback responses.
   - `In Progress` -> continue execution flow from current scratchpad comment.
   - `Human Review` or `In Review` -> if issue has a payment/billing label (`payment`, `billing`, or `paid`), wait and poll for human decision. Otherwise, treat as mis-routed: move to `Merging` and execute the land skill.
   - `Merging` -> on entry, open and follow `.codex/skills/land/SKILL.md`; do not call `gh pr merge` directly.
   - `Rework` -> run rework flow.
   - `Done` -> do nothing and shut down.
4. Check whether a PR already exists for the current branch and whether it is closed.

- If a branch PR exists and is `CLOSED` or `MERGED`, treat prior branch work as non-reusable for this run.
- Create a fresh branch from `origin/master` and restart execution flow as a new attempt.

5. For `Todo` tickets, do startup sequencing in this exact order:
   - `update_issue(..., state: "In Progress")`
   - find/create `## Codex Workpad` bootstrap comment
   - only then begin analysis/planning/implementation work.
6. Add a short comment if state and issue content are inconsistent, then proceed with the safest flow.

## Step 1: Start/continue execution (Todo or In Progress)

1.  Find or create a single persistent scratchpad comment for the issue:
    - Search existing comments for a marker header: `## Codex Workpad`.
    - Ignore resolved comments while searching; only active/unresolved comments are eligible to be reused as the live workpad.
    - If found, reuse that comment; do not create a new workpad comment.
    - If not found, create one workpad comment and use it for all updates.
    - Persist the workpad comment ID and only write progress updates to that ID.
2.  If arriving from `Todo`, do not delay on additional status transitions: the issue should already be `In Progress` before this step begins.
3.  Immediately reconcile the workpad before new edits:
    - Check off items that are already done.
    - Expand/fix the plan so it is comprehensive for current scope.
    - Ensure `Acceptance Criteria` and `Validation` are current and still make sense for the task.
4.  Start work by writing/updating a hierarchical plan in the workpad comment.
5.  Ensure the workpad includes a compact environment stamp at the top as a code fence line:
    - Format: `<host>:<abs-workdir>@<short-sha>`
    - Example: `devbox-01:/home/dev-user/code/symphony-workspaces/MT-32@7bdde33bc`
    - Do not include metadata already inferable from Linear issue fields (`issue ID`, `status`, `branch`, `PR link`).
6.  Add explicit acceptance criteria and TODOs in checklist form in the same comment.
    - If changes are user-facing, include a UI walkthrough acceptance criterion that describes the end-to-end user path to validate.
    - If changes touch app files or app behavior, add explicit app-specific flow checks to `Acceptance Criteria` in the workpad (for example: launch path, changed interaction path, and expected result path).
    - If the ticket description/comment context includes `Validation`, `Test Plan`, or `Testing` sections, copy those requirements into the workpad `Acceptance Criteria` and `Validation` sections as required checkboxes (no optional downgrade).
7.  Run a principal-style self-review of the plan and refine it in the comment.
8.  Before implementing, capture a concrete reproduction signal and record it in the workpad `Notes` section (command/output, screenshot, or deterministic UI behavior).
9.  Run the `pull` skill to sync with latest `origin/master` before any code edits, then record the pull/sync result in the workpad `Notes`.
    - Include a `pull skill evidence` note with:
      - merge source(s),
      - result (`clean` or `conflicts resolved`),
      - resulting `HEAD` short SHA.
10. Compact context and proceed to execution.

## PR feedback sweep protocol (required)

When a ticket has an attached PR, run this protocol before advancing to `Merging` (or `Human Review` for payment issues):

1. Identify the PR number from issue links/attachments.
2. Gather feedback from all channels:
   - Top-level PR comments (`gh pr view --comments`).
   - Inline review comments (`gh api repos/<owner>/<repo>/pulls/<pr>/comments`).
   - Review summaries/states (`gh pr view --json reviews`).
3. Treat every actionable reviewer comment (human or bot), including inline review comments, as blocking until one of these is true:
   - code/test/docs updated to address it, or
   - explicit, justified pushback reply is posted on that thread.
4. Update the workpad plan/checklist to include each feedback item and its resolution status.
5. Re-run validation after feedback-driven changes and push updates.
6. Repeat this sweep until there are no outstanding actionable comments.

## Blocked-access escape hatch (required behavior)

Use this only when completion is blocked by missing required tools or missing auth/permissions that cannot be resolved in-session.

- GitHub is **not** a valid blocker by default. Always try fallback strategies first (alternate remote/auth mode, then continue publish/review flow).
- Do not stop progress for GitHub access/auth until all fallback strategies have been attempted and documented in the workpad.
- If a non-GitHub required tool is missing, or required non-GitHub auth is unavailable, move the ticket to `Human Review` with a short blocker brief in the workpad that includes:
  - what is missing,
  - why it blocks required acceptance/validation,
  - exact human action needed to unblock.
- This is the only non-payment reason an issue should enter `Human Review`.
- Keep the brief concise and action-oriented; do not add extra top-level comments outside the workpad.

## Step 2: Execution phase (Todo -> In Progress -> Merging)

1.  Determine current repo state (`branch`, `git status`, `HEAD`) and verify the kickoff `pull` sync result is already recorded in the workpad before implementation continues.
2.  If current issue state is `Todo`, move it to `In Progress`; otherwise leave the current state unchanged.
3.  Load the existing workpad comment and treat it as the active execution checklist.
    - Edit it liberally whenever reality changes (scope, risks, validation approach, discovered tasks).
4.  Implement against the hierarchical TODOs and keep the comment current:
    - Check off completed items.
    - Add newly discovered items in the appropriate section.
    - Keep parent/child structure intact as scope evolves.
    - Update the workpad immediately after each meaningful milestone (for example: reproduction complete, code change landed, validation run, review feedback addressed).
    - Never leave completed work unchecked in the plan.
    - For tickets that started as `Todo` with an attached PR, run the full PR feedback sweep protocol immediately after kickoff and before new feature work.
5.  Run validation/tests required for the scope.
    - Mandatory gate: execute all ticket-provided `Validation`/`Test Plan`/ `Testing` requirements when present; treat unmet items as incomplete work.
    - Prefer a targeted proof that directly demonstrates the behavior you changed.
    - You may make temporary local proof edits to validate assumptions (for example: tweak a local build input for `make`, or hardcode a UI account / response path) when this increases confidence.
    - Revert every temporary proof edit before commit/push.
    - Document these temporary proof steps and outcomes in the workpad `Validation`/`Notes` sections so reviewers can follow the evidence.
    - If app-touching, run `launch-app` validation and capture/upload media via `github-pr-media` before handoff.
6.  Re-check all acceptance criteria and close any gaps.
7.  Before every `git push` attempt, run the required validation for your scope and confirm it passes; if it fails, address issues and rerun until green, then commit and push changes.
8.  Attach PR URL to the issue (prefer attachment; use the workpad comment only if attachment is unavailable).
    - Ensure the GitHub PR has label `symphony` (add it if missing).
9.  Merge latest `origin/master` into branch, resolve conflicts, and rerun checks.
10. Update the workpad comment with final checklist status and validation notes.
    - Mark completed plan/acceptance/validation checklist items as checked.
    - Add final handoff notes (commit + validation summary) in the same workpad comment.
    - Do not include PR URL in the workpad comment; keep PR linkage on the issue via attachment/link fields.
    - Add a short `### Confusions` section at the bottom when any part of task execution was unclear/confusing, with concise bullets.
    - Do not post any additional completion summary comment.
11. Before advancing, poll PR feedback and checks:
    - Read the PR `Manual QA Plan` comment (when present) and use it to sharpen UI/runtime test coverage for the current change.
    - Run the full PR feedback sweep protocol.
    - Confirm PR checks are passing (green) after the latest changes.
    - Confirm every required ticket-provided validation/test-plan item is explicitly marked complete in the workpad.
    - Repeat this check-address-verify loop until no outstanding comments remain and checks are fully passing.
    - Re-open and refresh the workpad before state transition so `Plan`, `Acceptance Criteria`, and `Validation` exactly match completed work.
12. Determine the target state and advance:
    - **Payment issues** (issue has a label matching `payment`, `billing`, or `paid`, case-insensitive): move to `Human Review` and wait for human approval before any cost-incurring action.
    - **All other issues** (default): move directly to `Merging` and proceed to Step 3 (autonomous path) to land the PR.
    - **Blocked exception**: if blocked by missing required non-GitHub tools/auth per the blocked-access escape hatch, move to `Human Review` with the blocker brief and explicit unblock actions.
13. For `Todo` tickets that already had a PR attached at kickoff:
    - Ensure all existing PR feedback was reviewed and resolved, including inline review comments (code changes or explicit, justified pushback response).
    - Ensure branch was pushed with any required updates.
    - Then advance per the target-state rule in step 12.

## Step 3: Merge handling (autonomous) and Human Review (payment issues only)

### Autonomous path (default for all non-payment issues)

1. When the issue reaches `Merging`, open and follow `.codex/skills/land/SKILL.md`, then run the `land` skill in a loop until the PR is merged. Do not call `gh pr merge` directly.
2. After merge is complete, move the issue to `Done`.
3. If the land skill encounters rework-worthy feedback (CI failures, review comments), address it inline — fix, commit, push, and continue the land loop. Do not move back to `In Progress`.

### Payment issue path (Human Review)

This path applies **only** to issues with a label matching `payment`, `billing`, or `paid`.

1. When the issue is in `Human Review` or `In Review`, do not code or change ticket content.
2. Poll for updates as needed, including GitHub PR review comments from humans and bots.
3. Treat any new actionable comment on the issue/PR as a rework trigger:
   - Automatically move the issue to `Rework`.
   - Add/refresh checklist items in the workpad for each actionable comment.
   - Start rework execution without waiting for additional human instruction.
4. Only keep the issue in `Human Review`/`In Review` when comments are informational-only or explicitly approving.
5. If approved, human moves the issue to `Merging`.
6. When the issue reaches `Merging`, follow the autonomous path above (land skill loop → `Done`).

## Step 4: Rework handling

1. Treat `Rework` as a full approach reset, not incremental patching.
2. Re-read the full issue body and all human comments; explicitly identify what will be done differently this attempt.
3. Close the existing PR tied to the issue.
4. Remove the existing `## Codex Workpad` comment from the issue.
5. Create a fresh branch from `origin/master`.
6. Start over from the normal kickoff flow:
   - If current issue state is `Todo`, move it to `In Progress`; otherwise keep the current state.
   - Create a new bootstrap `## Codex Workpad` comment.
   - Build a fresh plan/checklist and execute end-to-end.

## Completion bar before Merging

- Step 1/2 checklist is fully complete and accurately reflected in the single workpad comment.
- Acceptance criteria and required ticket-provided validation items are complete.
- Validation/tests are green for the latest commit.
- PR feedback sweep is complete and no actionable comments remain.
- PR checks are green, branch is pushed, and PR is linked on the issue.
- Required PR metadata is present (`symphony` label).
- If app-touching, runtime validation/media requirements from `App runtime validation (required)` are complete.

## Guardrails

- If a task consistently times out or fails (e.g., provider response timeout, agent run timeout), break it into smaller, manageable subtasks. Create separate Linear issues for each subtask with clear, independent acceptance criteria. Link subtasks with `blockedBy` if dependencies exist. Do not keep retrying a failing task without decomposition.
- **Ollama-sized issue requirements**: All issues must be sized for the smallest available model (Ollama/qwen2.5-coder:7b). Each issue should target 1–2 files, have 1–3 explicit acceptance criteria checkboxes, require no complex architectural decisions, and be completable in a single agent run (<5 minutes). If an issue is too large, decompose it into subtasks before work begins. Issues requiring human/external action (account setup, legal review, physical devices) should be clearly marked as non-automatable in the description.
- If the branch PR is already closed/merged, do not reuse that branch or prior implementation state for continuation.
- For closed/merged branch PRs, create a new branch from `origin/master` and restart from reproduction/planning as if starting fresh.
- If issue state is `Backlog`, treat it as `Todo` and move to `In Progress` before beginning work.
- Do not edit the issue body/description for planning or progress tracking.
- Use exactly one persistent workpad comment (`## Codex Workpad`) per issue.
- If comment editing is unavailable in-session, use the update script. Only report blocked if both MCP editing and script-based editing are unavailable.
- Temporary proof edits are allowed only for local verification and must be reverted before commit.
- If out-of-scope improvements are found, create a separate Backlog issue rather
  than expanding current scope, and include a clear
  title/description/acceptance criteria, **at least one label**, correct project
  assignment, a `related` link to the current issue, `blockedBy` when the
  follow-up depends on the current issue, and **must be Ollama-sized** (1–2
  files, 1–3 acceptance criteria, completable in <5 min).
- Do not advance to `Merging` unless the `Completion bar before Merging` is satisfied.
- For payment issues in `Human Review`, do not make changes; wait and poll.
- If state is terminal (`Done`), do nothing and shut down.
- Keep issue text concise, specific, and reviewer-oriented.
- If blocked and no workpad exists yet, add one blocker comment describing blocker, impact, and next unblock action.
- Do not run paid/external-release commands (`make deploy`, `make indexnow`, `make android:upload`, store submission, paid API scans) unless explicit approval is documented and `ALLOW_PAID_ACTIONS=1` is set.
- Issues involving cost-incurring actions must have a `payment`, `billing`, or `paid` label to trigger Human Review. All other issues are merged autonomously.
- If using Codebuff for auxiliary work, use `codebuff --free` only; do not use paid modes.
- When Codex credits are exhausted, the credit gate wrapper (`scripts/ops/codex-credit-gate.sh`) cascades through fallback providers: first OpenRouter (`google/gemini-2.0-flash-001` via the Responses API — cheap, high quality), then local Ollama (`qwen2.5-coder:7b` — free, zero cost, preferred because all tasks are Ollama-sized), then Gemini free tier, then Groq free tier (last resort due to known Codex integration issues). The Linear guardian skips lead enforcement (credit-aware via Symphony dashboard check). Systemd-driven free-tier ops (Groq, Gemini, Hugging Face, Ollama, typechecks, tests) also continue indefinitely. When credits reset, the credit gate automatically switches back to the full cloud model.
- **Symphony project feeding**: Symphony only picks up issues from its own Linear project. The sentinel issue pattern is responsible for keeping the Symphony project stocked with 5–10 open automatable issues at all times. If Symphony has no open issues, it will idle. Issues must be moved into the Symphony project to be picked up for autonomous work.

## Sentinel issue pattern

A **sentinel issue** is a special self-replicating issue with the title prefix `[SENTINEL]`. When an agent picks up a sentinel issue, it must follow this flow instead of the normal execution flow:

1. **Review all issues**: Query Linear for every issue in the project. Summarize progress across all states (Backlog, Todo, In Progress, Human Review, Done, etc.).
2. **Audit quality**: Check for stale issues (In Progress for too long without updates), duplicate work, issues that should be closed, and gaps in coverage.
3. **Enforce Ollama sizing**: Review every open issue (Backlog, Todo, In Progress) and verify it meets Ollama-sized requirements (1–2 files, 1–3 acceptance criteria, completable in <5 minutes). Decompose any issue that is too complex into smaller subtasks. Close the oversized parent and create focused child issues.
4. **Project hygiene**: Audit all Linear projects for health and accuracy:
   - Verify every open issue is assigned to the correct project.
   - Update project health status (`onTrack`, `atRisk`, `offTrack`) based on issue progress.
   - Check if any project should be split (too many issues or mixed concerns) or merged (overlapping scope).
   - Determine if new projects are needed for emerging work areas.
   - Ensure project descriptions accurately reflect current scope.
   - Verify issue priorities are consistent with project goals.
5. **Feed the Symphony project**: Symphony only picks up issues from its own project (`symphony-c7a7906a4fa6`). Review all open Ollama-sized issues across all projects and move the highest-priority automatable ones into the Symphony project. Ensure there are always at least 5–10 open issues in the Symphony project so Symphony never runs idle. Do not move issues that require human action (account setup, external services, legal review).
6. **Create new issues**: Based on the audit and project goals (world-class QR code generator — see `knowledge.md`), create new Backlog issues for any identified gaps, improvements, or maintenance tasks. Each new issue must have a clear title, description, acceptance criteria, **at least one label** from the team label set, and be **assigned to the correct project**. All new issues must be Ollama-sized.
7. **Update workpad**: Record the audit summary, issues created, issues moved to Symphony, project health updates, and any recommendations in the workpad comment.
8. **Self-replicate**: Before completing, create a **new copy** of this sentinel issue in `Backlog` with the same title, **same description** (use the canonical sentinel description below), **and labels**. Assign it to the Symphony project. This ensures the cycle continues indefinitely.
9. **Complete**: Move the current sentinel issue to `Done`.

### Sentinel dead man's switch

The `linear-guardian.mjs` script (runs every 15 minutes via systemd timer) checks the Symphony project for an open `[SENTINEL]` issue. If none exists (e.g., the sentinel failed before self-replicating), the guardian automatically creates a new one. This ensures the autonomous loop never dies permanently.

### Canonical sentinel description

When self-replicating (step 8) or when the dead man's switch creates a sentinel, use this exact description:

```
## Purpose

This is a **sentinel issue** — a self-replicating orchestration task that ensures the ANQR project has a continuous pipeline of high-quality, Ollama-sized work.

## Instructions

Follow the `Sentinel issue pattern` section in WORKFLOW.md exactly. Do not deviate from the steps defined there.

## Constraints

- Do NOT create PRs or branches. This is a pure audit/orchestration task.
- Do NOT run paid actions.
- WORKFLOW.md is the single source of truth for the sentinel pattern.
- When self-replicating, use this exact title and description.
```

Sentinel issues do **not** create PRs or branches. They are pure orchestration/audit tasks.

## Workpad template

Use this exact structure for the persistent workpad comment and keep it updated in place throughout execution:

````md
## Codex Workpad

```text
<hostname>:<abs-path>@<short-sha>
```

### Plan

- [ ] 1\. Parent task
  - [ ] 1.1 Child task
  - [ ] 1.2 Child task
- [ ] 2\. Parent task

### Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2

### Validation

- [ ] targeted tests: `<command>`

### Notes

- <short progress note with timestamp>

### Confusions

- <only include when something was confusing during execution>
````
