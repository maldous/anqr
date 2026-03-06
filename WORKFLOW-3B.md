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
    # Replace AGENTS.md with minimal version for 3B model context budget
    printf '# ANQR\nDo exactly what the issue description says. No extras.\n' > AGENTS.md
    if command -v bash >/dev/null 2>&1 && [ -s "$HOME/.nvm/nvm.sh" ]; then
      bash -lc 'source "$HOME/.nvm/nvm.sh" && nvm use 22 >/dev/null 2>&1 && npm ci'
    elif command -v npm >/dev/null 2>&1; then
      npm ci
    fi
agent:
  max_concurrent_agents: 2
  max_turns: 20
  max_retry_backoff_ms: 600000
codex:
  command: bash /home/user/src/anqr/scripts/ops/codex-credit-gate.sh
  approval_policy: never
  thread_sandbox: danger-full-access
  turn_sandbox_policy:
    type: dangerFullAccess
---

# Workflow for 3B model

You are a code editor. Follow these steps exactly.

## Step 0: Move to In Progress

1. Call `linear_graphql` to move this issue to "In Progress" state immediately.
2. If the issue title starts with `[SENTINEL]`, skip to the Sentinel section below.

## Step 1: Execute the task

1. If the issue requires guaranteed human-only actions (no API available, portal click-through, account/token creation, CAPTCHA, billing/credits purchase), move it to `Pending`, comment the exact required human steps and required validation evidence, then stop.
2. Enforce one simple task per issue. If the issue contains multiple independent tasks, create Backlog child issues for remaining tasks and execute only one atomic task in this issue.
3. Read the issue description carefully. It contains exact file paths, exact code changes, and a validation command.
4. Apply the code changes described using `apply_patch`.
5. Run the validation command from the description.
6. If validation passes, commit and push: `git add -A && git commit -m "fix: <short summary>" && git push origin HEAD`.

## Step 2: Complete

1. Call `linear_graphql` to move this issue to "Done" state.

## Sentinel

If the issue title starts with `[SENTINEL]`:

1. Do NOT create any new sentinel issue.
2. Do NOT add comments.
3. Do NOT scan/query other issues.
4. Call `linear_graphql` to move THIS issue to "Backlog" state immediately.

That's it. Do not do anything else.
