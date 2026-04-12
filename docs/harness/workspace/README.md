# Structurizr Workspace Notes

## Purpose

The `workspace.dsl` file and the `docs/harness` plus `docs/adrs` folders work together.

The workspace must reflect:

- the current runtime topology
- the known architectural faults
- the target production design

## Source priority

When updating the workspace:

1. update docs that describe current truth and target requirements
2. update `workspace.dsl` to match those docs
3. validate relationships, names, and ports against committed runtime code and systemd units

## Current modeling rule

Model current runtime containers and external systems directly.

Do not model desired future services as if they already exist.

Instead, describe target behavior in the documentation and ADRs.

## Suggested local validation flow

Example local workflow:

```bash
docker run --rm -it -p 8080:8080 -v "$PWD":/usr/local/structurizr structurizr/structurizr local
```

Then point Structurizr at the repository root and verify:

- documentation loads from `docs/harness`
- ADRs load from `docs/adrs`
- system context and container views render cleanly
- labels and relationships reflect the current runtime
```
