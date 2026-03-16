# ANQR Symphony hardened ops bundle

This bundle is a drop-in replacement for the uploaded `ops.zip` scripts set.

## What changed

The patched bundle introduces a durable local workflow state layer and rewires the main orchestration scripts around it.

### Implemented hardening

- durable machine state in `reports/symphony/state.json`
- durable single-host issue leases with heartbeat/expiry metadata
- strict feed eligibility
  - retry-exhausted issues are blocked from automatic re-feed
  - human-only issues are blocked from automation
  - cooldowns and active leases are respected
- email ingest external-key dedupe using `<!-- external-key:... -->` markers
- email issues default to human-only and backlog, not runnable AI work
- unauthorized email is quarantined with `anqr-rejected` instead of silently consumed
- runner preflight cache by `git HEAD` + validation manifest hash
- runner no longer auto-stashes a dirty worktree
- runner leaves successful local-only work in **In Review**
- runner treats failed push as non-success
- nightly Sonar sync no longer requeues issues to Todo
- nightly exit code now reflects degraded/failing runs
- agent and runner share the same validation implementation
- agent rejects `task_complete` unless validations ran after the last file mutation
- proxy returns `LOCAL_BUSY` as a local-capacity condition instead of 429
- provider failure memory moved to durable reports storage

## New files

- `ops/symphony-state.mjs`
- `ops/symphony-validation.mjs`

## Operational assumptions

This bundle hardens the system for a **single automation host**.

It does **not** implement a distributed multi-host workflow coordinator. If you later run Symphony from more than one machine, move the state/lease store out of local disk and into a shared durable backend.

## Required actions after extraction

1. Extract this bundle over the existing scripts tree.
2. Ensure the automation clone/worktree is dedicated to Symphony.
   - The runner now refuses to run if the worktree is dirty.
3. Ensure the process user can write to:
   - `reports/symphony/`
   - `reports/email-ingest/`
   - `reports/notify/`
4. Restart the affected systemd user units.
5. Watch the first nightly run and first few runner cycles closely.

## Recommended one-time cleanup

Because prior automation runs used comments/titles as machine state, you should review existing open issues for stale machine semantics.

Recommended manual checks:

- issues previously looped between Backlog and Todo
- old `[EMAIL]` issues that should remain human-only
- old issues manually sitting In Progress with no real owner

If you want to reset all local machine state from scratch, stop the automation and remove:

- `reports/symphony/state.json`
- `reports/symphony/provider-failures.json`

Do **not** do that while a runner is active.

## Important behavior changes

### 1. Dirty tree handling

The runner now exits instead of auto-stashing. This is intentional.

### 2. Successful run state

If `RUNNER_AUTO_PUSH=false`, completed work goes to **In Review**, not **Done**.

### 3. Nightly exit status

The nightly script now exits non-zero when degraded/failing. That means the systemd unit may show failed status when blocking/advisory checks fail. This is intentional because the old pipeline hid those conditions.

### 4. Sonar intake

Nightly Sonar sync will still create/update findings, but it will no longer force them back into Todo.

## Validation notes

I ran syntax checks for the patched Node/Python files in the container.

I could not fully integration-test against your live:

- Linear workspace
- SonarQube instance
- notmuch/mbsync mail store
- LiteLLM/Ollama provider chain
- real repository with `.git`

So the bundle is hardened and structurally patched, but the first live run should still be treated as a monitored rollout, not a blind restart.

## v2 hotfix

This bundle includes a hotfix for agent tool execution robustness:

- invalid tool arguments (for example path traversal like `../infra/logging/logger`) now return a tool error to the model instead of crashing the runner
- unexpected `runAgent` exceptions are downgraded into retryable agent failures so the runner can return the issue safely instead of exiting fatally

Observed symptom fixed:

- `Path escapes project root: ../infra/logging/logger` previously terminated `anqr-symphony-runner.service`
