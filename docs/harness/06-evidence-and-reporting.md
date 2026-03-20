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
