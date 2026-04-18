# Voice workspace template

This directory holds the direct personal voice-workspace template.

## Scope

This is runtime-local voice session material.

It is not the repo-wide architecture contract.

## Read order inside this workspace

1. repo-wide bootstrap: `AGENTS.md`, `README.md`, `docs/README.md`
2. this directory's `AGENTS.md`
3. local persona and user files for the voice workspace
4. local memory material only when the session is truly the direct voice workspace

## Rules

- Keep voice-session behavior here.
- Keep repo architecture in root docs and `docs/`.
- Do not duplicate repo-wide bootstrap text across voice template files.
