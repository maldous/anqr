# Codebuff Configuration

Codebuff reads two project-level files to optimise its context window and understand the codebase.

## Files

| File                | Purpose                                               |
| ------------------- | ----------------------------------------------------- |
| `docs/knowledge.md` | Project context loaded automatically at session start |
| `.codebuffignore`   | Excludes files from Codebuff's context window         |

`docs/knowledge.md` lives in `docs/`; `.codebuffignore` lives at the repository root.

## knowledge.md

This file is the primary context Codebuff uses to understand the project. It contains:

- Project identity and architecture summary.
- The `docs/` harness model and documentation policy.
- Tech stack, essential commands, and coding conventions.
- Key file locations and things to avoid.

### Rules

- Keep it a **quick-reference**, not a knowledge dump. Link to `docs/` pages for detail.
- Do not duplicate full content from `docs/` — summarise and point.
- Update when the tech stack, commands, or conventions change.
- Keep the "Things to Avoid" section current with active guardrails.

## .codebuffignore

Works like `.gitignore` but controls what Codebuff reads during a session. Every excluded file saves context tokens for actual source code.

### Current exclusion categories

| #   | Category                                                            | Rationale                                      |
| --- | ------------------------------------------------------------------- | ---------------------------------------------- |
| 1   | Binary & media assets (`public/gallery/`, `public/images/`, etc.)   | Codebuff cannot usefully read binary files     |
| 2   | Generated code (`*.generated.ts`, `tests/required.txt`, lock files) | Machine output, not hand-authored              |
| 3   | i18n translations (`src/i18n/static/`, `src/i18n/locales/`)         | 700K+ lines across 40+ locales                 |
| 4   | Gallery & asset scripts (`scripts/generate-gallery*.mjs`, etc.)     | Large, repetitive, rarely edited interactively |
| 5   | Ops automation (`scripts/ops/`)                                     | Systemd-driven, rarely edited via Codebuff     |
| 6   | Operator infrastructure (`WORKFLOW.md`)                             | Must not be edited — operator-managed          |
| 7   | Reference & archive (`docs/reference/`, `docs/archive/`)            | Large, rarely needed during coding             |
| 8   | Android platform (`android/`)                                       | Capacitor/Gradle boilerplate                   |
| 9   | Reports & config noise (`reports/`, `cspell.json`, etc.)            | Generated outputs or large config              |

### Rules

- When adding a large new file or directory, evaluate whether it belongs in `.codebuffignore`.
- Prefer directory-level exclusions over individual file patterns.
- If a Codebuff session needs an excluded file, it can still be read explicitly.
- Review exclusions when the project structure changes significantly.

## Relationship to docs/ harness

These files implement the agent-first model ([agent-first.md](agent-first.md)) for Codebuff specifically:

- `knowledge.md` gives Codebuff the same starting context that `AGENTS.md` + `docs/` gives other agents.
- `.codebuffignore` ensures Codebuff spends its token budget on source code rather than binary assets, translations, or generated data.
- Both files are maintained alongside `docs/` — when canonical docs change, `knowledge.md` should be updated to match.
