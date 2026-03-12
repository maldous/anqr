# 11. Root Cause and Remediation

## Root cause summary

The original direct-move package failed because it coupled three risky behaviours into one pass.

### 1. Incorrect alias-prefix rewriting for moved `index.ts` files

The original move tool treated a single-file `index.ts` move as though the containing directory had moved.

That created incorrect rewrites like:

```text
@/i18n/static  ->  @/app/i18n/static
```

Only `src/i18n/index.ts` had moved.
`src/i18n/static/**` had **not** moved.

This was architecturally incorrect and caused unresolved modules.

### 2. No compatibility layer for unchanged consumers

The original move tool physically moved files and then tried to rewrite consumers immediately.

That is too aggressive for a first architectural pass because the repo still contains:

- static imports
- dynamic imports
- lazy imports
- barrel references
- non-AST references such as triple-slash paths

The corrected approach is:

- move the file to its target owner
- leave a compatibility shim at the original path
- rewrite consumers later in controlled follow-up commits

### 3. Two unsafe first-pass moves were included

These two moves should not have been in the first direct-move pass:

- `src/i18n/index.ts`
- `src/modules/animation/parsing.ts`

`src/i18n/index.ts` was entangled with unchanged i18n content paths.

`src/modules/animation/parsing.ts` used a triple-slash reference path that required bespoke handling.

## Corrected policy

### Direct-move phase policy

The direct-move phase is now strictly limited to moves that satisfy all of the following:

1. ownership is clear
2. the file can move without symbol splitting
3. the file can be protected by a compatibility shim
4. non-AST references are either absent or explicitly corrected

### Consumer rewrite policy

Consumer rewrites are now a distinct later phase.

They should not happen in the same commit as a direct move unless the affected surface is very small and fully verified.

### Unsafe-move policy

If a move depends on one of the following, it is not a first-pass direct move:

- directory-level namespace moves
- global alias rewrites
- i18n content tree relocation
- triple-slash or custom loader semantics
- heavy dynamic import surfaces
- mixed-responsibility files that still require symbol extraction

## Remediation strategy

### Existing broken branch

Use:

```bash
npm run refactor:rescue-v1 -- --manifest manifests/file-move-manifest.full.json
```

This restores a stable state without discarding the branch.

### New clean run

Use:

```bash
npm run refactor:move -- --manifest manifests/file-move-manifest.safe.json
```

This is the approved first-pass move strategy.

## Architectural principle

The correct sequence is:

```text
stabilise the move surface
-> preserve old paths temporarily
-> verify green state
-> split mixed files
-> rewrite consumers
-> remove shims
-> enforce boundaries
```

That sequence is slower than a wholesale rewrite, but it is substantially safer and more maintainable.
