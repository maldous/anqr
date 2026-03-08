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
  max_turns: 20
  max_retry_backoff_ms: 600000
  retry_base_ms: 15000
  slot_contention_delay_ms: 30000
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

1. Run:
   ```bash
   node scripts/ops/linear-update-state.mjs --issue <THIS_ISSUE_IDENTIFIER> --state "In Progress"
   ```

## Step 1: Execute the task

1. If the issue title starts with `[PARENT]`, this is a tracking issue — do not execute it. Run:
   ```bash
   node scripts/ops/linear-update-state.mjs --issue <THIS_ISSUE_IDENTIFIER> --state "Pending"
   node scripts/ops/linear-comment.mjs --issue <THIS_ISSUE_IDENTIFIER> --body "[PARENT] tracking issue — not directly executable by automation."
   ```
   Then stop.
2. If the issue requires guaranteed human-only actions (no API available, portal click-through, account/token creation, CAPTCHA, billing/credits purchase), run:
   ```bash
   node scripts/ops/linear-update-state.mjs --issue <THIS_ISSUE_IDENTIFIER> --state "Pending"
   node scripts/ops/linear-comment.mjs --issue <THIS_ISSUE_IDENTIFIER> --body "Requires human action: <describe exact steps and validation evidence needed>"
   ```
   Then stop.
3. If the task requires subjective judgment, strategy, UX design, or document writing (no concrete code changes possible), escalate to Pending the same way as step 2.
4. Enforce one simple task per issue. If the issue contains multiple independent tasks, create Backlog child issues for remaining tasks and execute only one atomic task in this issue.
   **To create child issues, use the CLI helper instead of raw GraphQL:**
   ```bash
   node scripts/ops/create-child-issue.mjs \
     --parent ANQ-<N> \
     --title "[CHILD] <short title>" \
     --description "<description>" \
     --priority 2 \
     --label reliability
   ```
   The script prints the new issue identifier on success. Use this for any issue creation/linking tasks.
5. Check the issue description to determine task type:
   - **Code change** (description contains specific file paths and code changes): continue to step 6.
   - **Audit/analysis task** (description asks to query issues, check metadata, produce a report): use the CLI toolkit:
     ```bash
     node scripts/ops/linear-list-issues.mjs --open --format json > /tmp/issues.json
     # Analyze the JSON output, then update issues as needed:
     node scripts/ops/linear-update-issue.mjs --issue ANQ-<N> --title "..."
     ```
     After completing the analysis, skip to step 9 (commit and push).
6. Read the issue description carefully. Apply the code changes described using `apply_patch`.
7. Run the validation command from the description.
8. If validation passes, update `CHANGELOG.md`: prepend a line under today's date heading with `- <type>: <short summary>`. If today's date heading does not exist, add it after the preamble. Example: `- fix: reset canvas smoothing state`.
9. Commit and push: `git add -A && git commit -m "fix: <short summary>" && git pull --rebase origin master && git push origin master`.

## Error handling

If any command exits with a non-zero status or produces an error:

1. Post the error as a comment:
   ```bash
   node scripts/ops/linear-comment.mjs --issue <THIS_ISSUE_IDENTIFIER> --body "Command failed: <paste the error output>"
   ```
2. Move to Pending:
   ```bash
   node scripts/ops/linear-update-state.mjs --issue <THIS_ISSUE_IDENTIFIER> --state "Pending"
   ```
3. Stop — do not retry the failed command.

## Step 2: Post evidence and complete

1. Gather evidence: the commit hash (`git rev-parse --short HEAD`), list of files changed (`git diff --name-only HEAD~1`), and validation command output (pass/fail).
2. Post an evidence comment on the Linear issue using the CLI helper:
   ```bash
   node scripts/ops/linear-comment.mjs --issue <THIS_ISSUE_IDENTIFIER> --body "## Evidence
   - **Commit:** \`<hash>\`
   - **Files changed:** <file list>
   - **Validation:** \`<command>\` → passed
   - **CHANGELOG:** updated"
   ```
3. Move the issue to Done:
   ```bash
   node scripts/ops/linear-update-state.mjs --issue <THIS_ISSUE_IDENTIFIER> --state "Done"
   ```

## Linear CLI Reference

Use these CLI helpers instead of raw `linear_graphql` calls. They resolve all IDs automatically from human-readable names.

| Script                    | Purpose                      | Example                                            |
| ------------------------- | ---------------------------- | -------------------------------------------------- |
| `linear-update-state.mjs` | Move issue to a state        | `--issue ANQ-106 --state "In Progress"`            |
| `linear-comment.mjs`      | Post a comment               | `--issue ANQ-106 --body "Evidence..."`             |
| `linear-list-issues.mjs`  | Query issues (JSON output)   | `--open --format json` or `--state Backlog,Todo`   |
| `linear-update-issue.mjs` | Update title/priority/labels | `--issue ANQ-106 --title "New title" --priority 2` |
| `create-child-issue.mjs`  | Create a child issue         | `--parent ANQ-151 --title "[CHILD] ..."`           |

All scripts live in `scripts/ops/` and require `LINEAR_API_KEY`. For audit/hygiene tasks, pipe `linear-list-issues.mjs` output to process issues, then call `linear-update-issue.mjs` for each fix.
