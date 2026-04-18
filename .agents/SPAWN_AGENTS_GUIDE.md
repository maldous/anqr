# spawn_agents guide

Use this file only when you are about to call `spawn_agents`.

## First rule

Prefer direct shell execution for one explicit command.

Use `basher` only when you already know the exact shell command string.

## Required `basher` shape

```json
{
  "agent_type": "basher",
  "params": {
    "command": "git status"
  }
}
```

## Reject these cases

Do not spawn `basher` when any of these are true:

- `params` is missing
- `params.command` is missing
- `params.command` is not a string
- `params.command` is empty
- the command is still natural-language intent instead of a literal shell command
- you are still figuring out what to run

## Use direct shell instead

Prefer direct shell execution when you only need to run a command and inspect the result.

## Other agent types

Other spawned agents usually need a `prompt`. Give the smallest prompt that still states the task, scope, and expected output.
