# spawn_agents Tool Guide

## Usage Pattern

```json
{
  "agents": [
    {
      "agent_type": "basher",
      "prompt": "What to extract from the command output",
      "params": {
        "command": "actual terminal command here"
      }
    }
  ]
}
```

## Agent Types and Required Params

| Agent Type | Required | Optional |
|---|---|---|
| `basher` | **`params.command`** (string) | `prompt`, `params.rawOutput`, `params.timeout_seconds` |
| `file-picker` | `prompt` (string) | `params.directories` (string[]) |
| `researcher-web` | `prompt` (string) | — |
| `researcher-docs` | `prompt` (string) | — |
| `thinker` | `prompt` (string) | — |
| `thinker-gpt` | `prompt` (string) | — |
| `opus-agent` | `prompt` (string) | `params.filePaths` (string[]) |
| `gpt-5-agent` | `prompt` (string) | `params.filePaths` (string[]) |
| `editor` | — (inherits conversation) | — |
| `code-reviewer` | `prompt` (string) | — |
| `tmux-cli` | `prompt` (string) | `params.command` (string) |
| `browser-use` | `prompt` (string) | `params.url` (string) |
| `harness-helper` | — | `prompt` |
| `context-pruner` | — (auto-spawned) | `params.maxContextLength`, `params.userBudget`, `params.assistantToolBudget` |

## ⚠️ basher: The #1 Source of Errors

**`params.command` is REQUIRED and must be a non-empty string.**

The most common spawn_agents failure is spawning `basher` without `params.command`. This causes:
```
Invalid params for agent basher: expected string, received undefined
```

### ❌ WRONG — Missing params entirely
```json
{ "agent_type": "basher", "prompt": "check git status" }
```

### ❌ WRONG — Empty params object
```json
{ "agent_type": "basher", "prompt": "check git status", "params": {} }
```

### ❌ WRONG — Command in prompt instead of params
```json
{ "agent_type": "basher", "prompt": "git status" }
```

### ✅ CORRECT — Command in params.command
```json
{
  "agent_type": "basher",
  "prompt": "Check if there are uncommitted changes",
  "params": { "command": "git status" }
}
```

## Other Common Pitfalls

### Passing params as a string
```json
// ❌ WRONG
{ "agent_type": "basher", "params": "ls -la" }

// ✅ CORRECT
{ "agent_type": "basher", "params": { "command": "ls -la" } }
```

### Agents array must be an array
```json
// ❌ WRONG — single object
{ "agents": { "agent_type": "basher", "params": { "command": "ls" } } }

// ✅ CORRECT — array of objects
{ "agents": [{ "agent_type": "basher", "params": { "command": "ls" } }] }
```

### editor does NOT take prompt or params
```json
// ❌ WRONG — editor inherits conversation context, not a prompt
{ "agent_type": "editor", "prompt": "fix the bug in foo.ts" }

// ✅ CORRECT — no prompt or params needed
{ "agent_type": "editor" }
```

## Working Examples

### Single basher
```json
{
  "agents": [
    {
      "agent_type": "basher",
      "prompt": "Check git status",
      "params": { "command": "git status" }
    }
  ]
}
```

### Multiple agents in parallel
```json
{
  "agents": [
    {
      "agent_type": "basher",
      "prompt": "Run typecheck",
      "params": { "command": "npm run typecheck:all" }
    },
    {
      "agent_type": "basher",
      "prompt": "Run linter",
      "params": { "command": "npm run lint:all" }
    },
    {
      "agent_type": "code-reviewer",
      "prompt": "Review the changes to symphony-agent-router.mjs"
    }
  ]
}
```

### Research + file discovery
```json
{
  "agents": [
    {
      "agent_type": "file-picker",
      "prompt": "Find files related to authentication and session management",
      "params": { "directories": ["src", "packages"] }
    },
    {
      "agent_type": "researcher-docs",
      "prompt": "How does Next.js middleware handle authentication?"
    }
  ]
}
```

### Deep thinking agents
```json
{
  "agents": [
    {
      "agent_type": "opus-agent",
      "prompt": "Analyze the provider cascade logic and suggest improvements",
      "params": { "filePaths": ["scripts/ops/integrations/model/symphony-credit-gate.mjs"] }
    }
  ]
}
```

### harness-helper (no params needed)
```json
{
  "agents": [
    {
      "agent_type": "harness-helper",
      "prompt": "Help debug the bridge provider fallback"
    }
  ]
}
```

### editor (inherits context, no prompt)
```json
{
  "agents": [
    { "agent_type": "editor" }
  ]
}
```

## Quick Reference: What Goes Where

| What you want to do | agent_type | Where the command/question goes |
|---|---|---|
| Run a terminal command | `basher` | `params.command` |
| Find files | `file-picker` | `prompt` |
| Search the web | `researcher-web` | `prompt` |
| Read library docs | `researcher-docs` | `prompt` |
| Think about a problem | `thinker` | `prompt` |
| Implement code changes | `editor` | nowhere (inherits context) |
| Review code changes | `code-reviewer` | `prompt` |
| General problem solving | `opus-agent` | `prompt` + optional `params.filePaths` |
| Complex reasoning | `gpt-5-agent` | `prompt` + optional `params.filePaths` |
| Interactive CLI testing | `tmux-cli` | `prompt` + optional `params.command` |
| Browser testing | `browser-use` | `prompt` + optional `params.url` |
| Harness/bridge help | `harness-helper` | optional `prompt` |
| Prune conversation context | `context-pruner` | nowhere (auto-spawned, optional `params`) |
