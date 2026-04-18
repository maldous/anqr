# CODEBUFF.md

Use the normal repo bootstrap:

1. `AGENTS.md`
2. `README.md`
3. `docs/README.md`
4. nearest owning `README.md`

For harness work, also read:

1. `docs/harness/00-index.md`
2. `harness/README.md`
3. `harness/ops/README.md`

## Basher rule

Use direct shell execution for direct shell work.

Only spawn `basher` when `params.command` is an exact, non-empty shell command string.

Valid shape:

```json
{
  "agent_type": "basher",
  "params": {
    "command": "git status"
  }
}
```

If the exact command is not known yet, do not spawn `basher`.

This file is a narrow model-specific overlay. Repo-wide rules live in `AGENTS.md`.
