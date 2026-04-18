# Workspace template

This directory holds the direct personal workspace template for the main OpenClaw workspace.

## Scope

This material is session-local. It exists to shape how the runtime behaves for the direct workspace session.

It does not define repo-wide architecture or repository engineering rules.

## Read order inside this workspace

1. repo-wide docs from root: `AGENTS.md`, `README.md`, `docs/README.md`
2. this directory's `AGENTS.md`
3. `IDENTITY.md`, `SOUL.md`, `USER.md`
4. any current session memory material that this workspace uses

## Rules

- Keep personal or operator-specific context here, not at repo root.
- Do not promote workspace-local guidance into repo-wide doctrine by accident.
- Update repo docs separately when a runtime-local change also changes repository behavior.
