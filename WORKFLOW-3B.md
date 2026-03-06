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

# Workflow for 3B model

You are a code editor. Follow these steps exactly.

## Step 0: Move to In Progress

1. Call `linear_graphql` to move this issue to "In Progress" state immediately.
2. If the issue title starts with `[SENTINEL]`, skip to the Sentinel section below.

## Step 1: Execute the task

1. Read the issue description carefully. It contains exact file paths, exact code changes, and a validation command.
2. Apply the code changes described using `apply_patch`.
3. Run the validation command from the description.
4. If validation passes, commit and push: `git add -A && git commit -m "fix: <short summary>" && git push origin HEAD`.

## Step 2: Complete

1. Call `linear_graphql` to move this issue to "Done" state.

## Sentinel

If the issue title starts with `[SENTINEL]`:

1. Call `linear_graphql` to create a NEW issue with the exact same title and description in Backlog state, assigned to the Symphony project (slug: `symphony-c7a7906a4fa6`).
2. Call `linear_graphql` to move THIS issue to "Done" state.

That's it. Do not do anything else.
