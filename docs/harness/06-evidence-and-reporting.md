# Evidence And Reporting

Every substantial completion artifact must include:

- Summary
- Scope class
- Touched paths
- Decision(s) made
- Commands run
- Pass/fail result for each command
- Changed files
- Commit hash
- Issue comment text
- Artifacts attached/linked
- Risk / rollback note
- Follow-up work

## Additional required evidence

- UI-visible changes
  - screenshots or equivalent visual proof
- API/MCP/auth/rate-limit changes
  - request/response examples and logs
- harness/systemd changes
  - service status or journal excerpts
- performance work
  - benchmark or timing evidence
- mobile work
  - build or device proof

## Reports

Generated evidence belongs under `reports/`.

Rules:

- generated outputs may be ignored by default
- preserve a report in git only when the controlling document explicitly requires it
- do not let ignored report artifacts become the only source of truth for a decision

## Commit discipline

Keep evidence truthful. Fake purity is worse than visible debt, and fake green evidence is worse than a failing gate.

## Codebuff execution metrics

When Codebuff is used as the AI provider, execution reports are written to `reports/codebuff/latest-{timestamp}.json`.

### Report structure

```json
{
  "timestamp": "2026-03-21T00:40:23.808Z",
  "task": "Implement feature X for ANQR...",
  "project": "/home/user/src/anqr",
  "exitCode": 0,
  "method": "sdk",
  "account": "user@example.com (paid)",
  "outputLength": 1234,
  "output": "Summary of changes made by the agent...",
  "error": null
}
```

### Metrics captured

| Field | Description |
|-------|-------------|
| timestamp | ISO 8601 timestamp of execution start |
| task | Truncated task description (500 char max) |
| project | Absolute path to the project directory |
| exitCode | 0 = success, 1 = failure, 124 = timeout |
| method | Always "sdk" for Codebuff executions |
| account | Which account succeeded (e.g., "user@example.com (paid)") |
| outputLength | Length of the output string |
| output | Last 5000 characters of the agent's summary output |
| error | Error message if failed, null if successful |

### Account rotation tracking

When multiple CODEBUFF_API_KEY* environment variables are configured, the report captures which account succeeded. This enables:

- Identifying which account was used (paid vs free mode)
- Tracking rate-limit rotation effectiveness
- Auditing spend across accounts

### Failure modes

| exitCode | Meaning | Evidence |
|----------|---------|----------|
| 0 | Success | Check `output` for summary of changes |
| 1 | Error | Check `error` for failure message |
| 124 | Timeout | Check `output` for partial progress (if any) |

### Evidence extraction

For Codebuff executions, extract:

1. **Summary** — from `output` field (last 1000 chars recommended)
2. **Files changed** — run `git diff --stat` after execution
3. **Account used** — from `account` field for audit trail
4. **Error details** — from `error` field if exitCode !== 0
