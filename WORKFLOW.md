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

1. If the status is `Done`, `Cancelled`, or `Closed`, do nothing and stop.

2. Move this issue to state `In Progress` right now.

3. If the title starts with `[SENTINEL]`:
   a. Do NOT create any new sentinel issue.
   b. Do NOT add comments.
   c. Do NOT scan/query other issues.
   d. Move this issue to `Backlog`. Stop here.

4. If this is a regular issue (not sentinel):
   a. The description above contains exact file paths and exact code changes. Follow them exactly.
   b. After making the changes, run the validation command from the description.
   c. If validation passes, commit your changes: `git add -A && git commit -m "fix: <short summary>"`
   d. Push your changes: `git push origin master`
   e. Add a comment on this issue: `Done. Changes committed and pushed.`
   f. Move this issue to `Done`.

**Rules:**

- Never edit WORKFLOW.md
- Never run `make deploy`, `make android`, or `make indexnow`
- Never create pull requests or branches
- Work only in the provided repository copy
