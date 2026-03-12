# ANQR Architecture Refactor Package v2

This package supersedes the first-pass move tooling.

## What changed

The original first-pass move strategy had three defects:

1. it rewrote alias prefixes for moved `index.ts` files as though entire directories had moved
2. it did not preserve old import paths for dynamic imports and existing consumers
3. it allowed two moves into the first pass that were not safe at that stage:
   - `src/i18n/index.ts`
   - `src/modules/animation/parsing.ts`

This v2 package corrects those defects.

## Included files

- `tools/refactor/move-by-manifest-v2.ts`
- `tools/refactor/rescue-v1-run.ts`
- `manifests/file-move-manifest.safe.json`
- `manifests/file-move-manifest.full.json`
- `docs/09-runbook.md`
- `docs/11-root-cause-and-remediation.md`
- `tools/refactor/package-json.snippet.json`

## Operating model

### Safe direct moves

Use `file-move-manifest.safe.json` for the first pass.

This pass:

- moves only direct-move files that are safe at this stage
- preserves old paths by generating compatibility shims
- does **not** globally rewrite consumers to new aliases
- fixes triple-slash reference paths inside moved files

### Full manifest

`file-move-manifest.full.json` is retained only as the source of truth for later phases and for rescue tooling.
Do **not** use it for the first direct-move pass.

## Recommended sequence

1. if you already ran the old move pass, run the rescue script first
2. verify the branch compiles again
3. reset to a clean architectural baseline on the branch
4. rerun the direct moves using the safe manifest and compatibility shims
5. only after the codebase is green, proceed to symbol splits

Read `docs/09-runbook.md` and execute it exactly.
