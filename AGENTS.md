# AGENTS.md

This file is the repo-wide execution contract for AI agents.

## Default read order

1. `AGENTS.md`
2. `README.md`
3. `docs/README.md`
4. `docs/program/01-anqr-1.0-definition.md`
5. nearest owning `README.md`
6. only then any task-specific standard, workflow, or reference doc

For harness work, also read:

1. `docs/harness/00-index.md`
2. `harness/README.md`
3. `harness/ops/README.md`
4. `services/systemd/README.md` when runtime or timer behavior is involved

## Do not load by default

These are not part of the default reading path:

- `docs/archive/**`
- archived plans and migration notes
- historical harness review material
- runtime workspace persona templates
- `.agents/skills/**`

Read them only when the task clearly depends on them.

## Source of truth

Use this priority when documents disagree:

1. code and committed runtime files
2. nearest owning `README.md`
3. `docs/program/01-anqr-1.0-definition.md`
4. `docs/adrs/*`
5. `docs/standards/*`
6. `docs/workflows/*`
7. `docs/reference/*`
8. `docs/archive/*`

## Working rules

- Stay inside the owning surface. Do not generalize from distant docs when a local doc exists.
- Treat plans as implementation history unless they are explicitly promoted into active docs.
- Prefer one authoritative file over parallel explanations.
- Remove duplication instead of layering more bootstrap text on top.
- Keep root docs small. Push detail down to the closest owning path.
- If you change runtime behavior, update the nearest runtime doc and any affected reference doc.
- If you change a standard or workflow, update the active doc in `docs/standards/` or `docs/workflows/`.
- Do not treat runtime workspace persona files as repo-wide architecture guidance.

## Model-specific overlays

These files may add narrow bootstrap rules, but they must not redefine repo architecture:

- `CLAUDE.md`
- `CODEBUFF.md`
- `.codex/README.md`
- `.agents/SPAWN_AGENTS_GUIDE.md`

If any overlay conflicts with this file, follow `AGENTS.md`.

## h5i Integration

This repository uses **h5i** (a Git sidecar for AI-era version control).

Codex should use `h5i context` as shared cross-session memory and `h5i commit` to record AI provenance on code commits.

### Workflow

**At the start of a non-trivial task:**
```bash
h5i codex prelude
# If no workspace exists yet, initialize it once:
h5i context init --goal "<one-line task summary>"
```

**While working:**
```bash
h5i context relevant <file>   # before editing — surfaces prior reasoning + claims that mention this file
h5i codex sync                # after a burst of reads/edits — backfills OBSERVE/ACT traces
h5i context trace --kind THINK "<chosen approach> over <rejected alternative> because <reason>"
h5i context trace --kind NOTE "TODO: … / LIMITATION: … / RISK: …"
```

**After a logical milestone:**
```bash
h5i codex finish --summary "<milestone summary>"
```

### Claims — pin reusable facts

After establishing a non-obvious fact a future session would otherwise re-derive
(where a helper lives, which module owns a concern, a subtle invariant), record
a content-addressed claim pointing at the files that back it. Live claims are
injected into `h5i codex prelude` / `h5i context prompt`, so the next session
treats them as pre-verified — trust them; don't re-read the files.

**Two flavors:**

Cross-cutting fact (~30 tokens, multiple paths):
```bash
h5i claims add "HTTP only src/api/client.py: fetch_user, create_post, delete_post." \
  --path src/api/client.py
```

Per-file orientation (~80 tokens, single path) — replaces the deprecated `h5i summary`:
```bash
h5i claims add "src/api/client.py | HTTP. fetch_user(id: int)→dict GET, create_post(...)→dict POST, delete_post(id: int)→bool DELETE. Logger \`log\` top." \
  --path src/api/client.py
```

Inspect:
```bash
h5i claims list                    # live / stale badges
h5i claims list --group-by-path    # claims grouped by file ("what's known about each file")
h5i claims prune                   # drop stale claims
```

**Caveman style.** Drop articles, copulas, fluff. Keep paths, identifier names, types, numbers exact. Pick the *minimum* evidence-path set: most good claims cite 1 file; >3 is a red flag you're confusing "files I read" with "files that back the claim". Live claim text is re-read on every cached-prefix turn forever — every word costs forever.

### Code commits

```bash
git add <exact paths>
h5i commit -m "…" --agent codex --prompt "…"
```

Add flags when relevant:
- `--tests`  — tests were added or modified
- `--audit`  — security-sensitive or high-risk changes

### Sharing h5i Data

```bash
h5i push   # push all h5i refs to origin
h5i pull   # pull h5i refs from origin
```

