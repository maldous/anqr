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

You are an automated agent. Work on the Linear ticket below.

{% if attempt %}
Retry #{{ attempt }}. Continue from current workspace state. Do not start over.
{% endif %}

Ticket: {{ issue.identifier }} — {{ issue.title }}
Status: {{ issue.state }}
Labels: {{ issue.labels }}

{% if issue.description %}
{{ issue.description }}
{% else %}
No description.
{% endif %}

---

**Do these steps in order:**

1. Move this issue to state `In Progress` right now.

2. If the title starts with `[SENTINEL]`:
   a. Create a new issue with title `[SENTINEL] Review progress, create issues, and continue`, state `Backlog`, same labels and same project as this issue, with this description: `Self-replicating heartbeat. Steps: (1) create a copy of this issue in Backlog, (2) post a workpad comment, (3) move this issue to Done. Do NOT create PRs, do NOT run paid actions, do NOT query/audit issues.`
   b. Add a comment on this issue: `Sentinel heartbeat complete.`
   c. Move this issue to `Done`. Stop here.

3. If this is a regular issue (not sentinel):
   a. The description above contains exact file paths and exact code changes. Follow them exactly.
   b. After making the changes, run the validation command from the description.
   c. If validation passes, commit your changes with a short message starting with `fix:` or `feat:`.
   d. Add a comment on this issue: `Done. Changes committed.`
   e. Move this issue to `Done`.

**Rules:**
- Never edit WORKFLOW.md
- Never run `make deploy`, `make android`, or `make indexnow`
- Never create pull requests or branches
- Work only in the provided repository copy
