# Knowledge

## Agent Spawning Rules

### Basher Agent Schema (Non-Negotiable) [PERMANENT RULE]

When spawning the `basher` agent, you must always use this exact schema and no other:

```json
{
  "agent_type": "basher",
  "params": {
    "command": "<shell command>"
  }
}
```

**Requirements:**

- `params.command` is mandatory
- `params.command` must be a non-empty string
- never put the shell command in `prompt`
- never use `cmd`, `script`, `task`, or any alternate field
- never emit a `basher` agent without `params.command`
- if you do not know the exact command, do not spawn `basher`

**Validation before every basher spawn:**

- `typeof params.command === "string"`
- `params.command.trim().length > 0`

**Enforcement:** Reject any basher spawn that does not match this exact schema

### Basher Session Start Contract [MUST RUN EVERY FRESH SESSION]

Before any `spawn_agents` use in native Codebuff/Freebuff:

1. read `knowledge.md`
2. load this basher rule into working memory
3. restate the rule in one sentence
4. produce one valid basher payload example
5. reject any basher payload missing `params.command`
6. if uncertain, use `run_terminal_command` directly instead of spawning `basher`

**Required self-check before first real basher spawn:**

```json
{ "agent_type": "basher", "params": { "command": "pwd" } }
```

If the agent cannot produce that exact structure, it must not spawn `basher` in that session.

### Basher Refusal Rules

Refuse basher spawns when any of the following are true:

- `params` is missing
- `params.command` is missing
- `params.command` is not a string
- `params.command.trim()` is empty
- the requested action is still only a natural-language task description
- the exact shell command has not yet been constructed

**Natural-language task text is never a valid basher command.** Examples that must be rejected:

- `Check git status`
- `Commit and push changes`
- `Show me what changed in knowledge.md`

Convert those into exact shell commands first, or do not use `basher`.

### Basher Preference Rule

For a single direct shell action, prefer `run_terminal_command`.

Use `basher` only when there is an actual reason to delegate agent work. Do not spawn `basher` just to run one obvious shell command.

## Environment Files and Installation

### Env Files (Secrets)

The project has three env file locations that must stay in sync. They are **empty templates in git** but **populated with real secrets on the host**:

| System Location                       | Loaded By                                           |
| ------------------------------------- | --------------------------------------------------- |
| `~/.config/systemd/user/anqr-ops.env` | All systemd services via `EnvironmentFile=`         |
| `~/.config/symphony/anqr.env`         | Executor and router services via `EnvironmentFile=` |
| `~/.openclaw/.env`                    | OpenClaw Gateway (reads from its own config dir)    |

The repo template is `services/systemd/anqr-ops.env` — committed with empty values as a key inventory. Real secrets are never committed.

Key tokens that must be present in all three:

- `OPENCLAW_GATEWAY_TOKEN` — authenticates harness services with the OpenClaw Gateway (value from `~/.openclaw/openclaw.json` → `gateway.auth.token`)
- `LINEAR_WEBHOOK_SECRET` — HMAC signature verification for Linear webhooks
- All provider API keys (`GROQ_TOKEN`, `GEMINI_TOKEN`, `MISTRAL_TOKEN`, etc.)

### Systemd Service Files

`services/systemd/*.service` and `*.timer` are the source of truth. They must be **symlinked** (not copied) into `~/.config/systemd/user/`:

```bash
cd /home/user/src/anqr
for f in services/systemd/*.service services/systemd/*.timer; do
  ln -sf "$(realpath "$f")" ~/.config/systemd/user/"$(basename "$f")"
done
systemctl --user daemon-reload
```

After any change to a `.service` or `.timer` file in the repo, run `systemctl --user daemon-reload` — the symlinks ensure the live config always matches the repo.

### OpenClaw Config

`harness/ops/runtime/openclaw-config/` is the source of truth for OpenClaw Gateway configuration. Key files must be synced to `~/.openclaw/`:

```bash
cd harness/ops/runtime/openclaw-config
for f in openclaw.json config.json models.json clawdbot.json exec-approvals.json; do
  cp "$f" ~/.openclaw/"$f"
done
```

Note: `~/.openclaw/` also contains runtime state (`.env`, `lcm.db`, `tasks/`, `cron/`, backups) that is NOT in the repo.

### After Updating Env or Config

All three env files must have `chmod 600` (owner-only) since they contain secrets. After updating env files or openclaw config, restart affected services:

```bash
chmod 600 ~/.config/systemd/user/anqr-ops.env ~/.config/symphony/anqr.env ~/.openclaw/.env
systemctl --user restart anqr-symphony-executor@{1..8}.service anqr-discord-router.service anqr-linear-webhook.service
```

## Current Architecture

- **8 Worktree Executors** on ports 4321-4328 (wt1-wt4 for Linear, wt5-wt8 for Discord)
- **No single bridge** - each worktree runs its own `symphony-openai-bridge.mjs`
- **Codebuff integrated** into Symphony executors (per ADR-0003) - no separate bridge
- **Router** (port 4319) routes requests to available worktrees
- **Linear Webhook Receiver** (port 18791) handles Linear webhook events
- **Linear Reconciler** daemon ensures level-triggered backlog pickup every 90s
- **Health-aware dispatch** filters out quarantined/diverged worktrees
- **Divergence detection** in recovery daemon auto-resets diverged worktrees
- **Evidence-locked closure** — issues only close after push + integration + evidence comment

## Best Practices

Always test code

### Validation Concurrency

- **Vitest runs single-threaded:** `vitest.config.ts` sets `fileParallelism: false`, `maxWorkers: 1`, `minWorkers: 1`. Never increase these — the host cannot handle parallel vitest workers across 8 worktrees.
- **flock serialization:** Heavy validation commands (vitest, typecheck) are wrapped with `flock -w 120 9 ... 9>/tmp/anqr-*.lock` in `symphony-validation.mjs`. This ensures only one vitest or typecheck process runs system-wide at a time, even when multiple executors trigger validation simultaneously.
- **Lock files:** `/tmp/anqr-vitest.lock` and `/tmp/anqr-typecheck.lock` are the global serialization points. Do not delete these while executors are running.
- **Timeout budget:** Validation timeouts are 240s (120s lock wait + 120s execution). If you see timeout failures, check whether another executor is holding the lock.

### Git Automation Hooks

- `ANQR_AUTOMATION_COMMIT=1` skips pre-commit hooks (oxlint, typecheck, cspell, ast-density) in `lefthook.yml`.
- `ANQR_AUTOMATION_PUSH=1` skips pre-push hooks (typecheck) in `lefthook.yml`.
- These are set in `anqr-symphony-executor@.service` so automation commits bypass expensive hooks that validation already ran.

### Worktree Branch Strategy

- Executors push to `origin/symphony/wtN` branches, never to `origin/main`.
- The single `symphony-integrator` service serially promotes queued branches to main.
- Failed commits/pushes stay attached to the same worktree (sticky repair) via finalization state in `symphony-state.mjs`.
