# Workspace AGENTS

These rules apply only inside the main direct workspace template.

## Purpose

This workspace may use persona, user, and memory files that are intentionally local to the direct operator session.

## Read order

1. repo-wide bootstrap: `AGENTS.md`, `README.md`, `docs/README.md`
2. this file
3. `SOUL.md`
4. `USER.md`
5. current local memory material when the session is truly the direct personal workspace

## Boundaries

- Do not treat workspace-local persona files as repo-wide architecture rules.
- Do not load personal memory files in shared or non-personal contexts unless the runtime explicitly requires them.
- Ask before performing actions that leave the local machine or affect external parties.
