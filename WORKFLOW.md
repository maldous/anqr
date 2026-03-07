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
   a. Do NOT create any new `[SENTINEL]` issue.
   b. Review the harness report and recent Symphony logs for errors that need code fixes:
      ```bash
      cat reports/harness/latest.json 2>/dev/null | head -500
      grep -aE 'error|warning|Linear GraphQL request failed' ~/.local/state/symphony-anqr/log/log/symphony.log ~/.local/state/symphony-anqr/log/log/symphony.log.1 2>/dev/null | tail -200
      ```
      The harness report contains automated check results across 22 domains (typecheck, lint, security, dependencies, bundle size, test coverage, etc). For each FAIL or regression in the harness report, create corrective issues.
   c. For each distinct error class that requires a code fix (not transient/retryable errors):
      - Create a `[PARENT]` issue describing the error category.
      - Create one or more `[CHILD]` issues for each specific atomic fix. Each child description MUST contain:
        - Exact file path(s) to change
        - Exact code changes (before/after)
        - A validation command to verify the fix
      - Link every `[CHILD]` to its `[PARENT]` using the `parentId` field in `issueCreate`.
      - Set explicit priority on every issue (2 = high, 3 = medium).
      - Place all created issues in the Symphony project.
      - Include the `reliability` label on every created issue (look up its ID from the team labels query below).
      - Use `linear_graphql` for all issue creation:
        ```graphql
        mutation CreateParent($input: IssueCreateInput!) {
          issueCreate(input: $input) { success issue { id identifier title } }
        }
        ```
        Then for each child, use the parent's returned `id` as `parentId`:
        ```graphql
        mutation CreateChild($input: IssueCreateInput!) {
          issueCreate(input: $input) { success issue { id identifier title } }
        }
        ```
        Variables for parent: `{ "input": { "teamId": "<team-id>", "projectId": "<symphony-project-id>", "title": "[PARENT] <error category>", "description": "<summary of errors observed>", "priority": 2, "labelIds": ["<reliability-label-id>"] } }`
        Variables for child: `{ "input": { "teamId": "<team-id>", "projectId": "<symphony-project-id>", "parentId": "<parent-issue-id>", "title": "[CHILD] <specific fix>", "description": "<exact file paths, code changes, validation command>", "priority": 3, "labelIds": ["<reliability-label-id>"] } }`
      - To get the team ID, Symphony project ID, and reliability label ID, query:
        ```graphql
        query {
          teams(filter: { key: { eq: "ANQ" } }) {
            nodes { id projects { nodes { id name } } labels(first: 50) { nodes { id name } } }
          }
        }
        ```
        Find the label with `name: "reliability"` and use its `id` as `<reliability-label-id>` in the issue creation variables above.
   d. Before creating any issues, query existing open issues in the Symphony project to avoid duplicates:
      ```graphql
      query($projectId: ID!) {
        issues(filter: {
          team: { key: { eq: "ANQ" } },
          project: { id: { eq: $projectId } },
          state: { name: { in: ["Backlog", "Todo", "In Progress", "Pending", "In Review", "Human Review", "Rework"] } }
        }, first: 50) {
          nodes { identifier title state { name } }
        }
      }
      ```
      Skip creating issues for error classes that already have a matching open issue.
   e. Skip errors that are transient/retryable (e.g. rate limits, reconnections, timeouts).
   f. Move this sentinel issue to `Backlog`. Stop here.

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
