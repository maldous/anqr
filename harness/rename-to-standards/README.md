# Rename To Standards

## Purpose

Directory for harness support logic; immediate files include `apply-plan.mjs`, `build-plan.mjs`, `choose-primary-entry.mjs`, `code-extensions.mjs`, and others.

## Contents

- 32 immediate files
- 0 child directories

## Key Files

- `apply-plan.mjs` - Exports `applyPlan`, a shared constant or state value used by sibling modules.
- `build-plan.mjs` - Exports `buildPlan`, a shared constant or state value used by sibling modules.
- `choose-primary-entry.mjs` - Exports `choosePrimaryEntry`, a shared constant or state value used by sibling modules.
- `code-extensions.mjs` - Exports `CODE_EXTENSIONS`, a shared constant or state value used by sibling modules.
- `collect-module-specifiers.mjs` - Exports `collectModuleSpecifiers`, a shared constant or state value used by sibling modules.
- `create-source-file.mjs` - Exports `createSourceFile`, a shared constant or state value used by sibling modules.
- `default-dirs.mjs` - Exports `DEFAULT_DIRS`, a shared constant or state value used by sibling modules.
- `detect-suggestion.mjs` - Exports `detectSuggestion`, a shared constant or state value used by sibling modules.
- `ensure-dot.mjs` - Exports `ensureDot`, a shared constant or state value used by sibling modules.
- `get-declaration-name.mjs` - Exports `getDeclarationName`, a shared constant or state value used by sibling modules.
- `get-top-level-entries.mjs` - Exports `getTopLevelEntries`, a shared constant or state value used by sibling modules.
- `has-jsx.mjs` - Exports `hasJsx`, a shared constant or state value used by sibling modules.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `is-code-file.mjs` - Exports `isCodeFile`, a shared constant or state value used by sibling modules.
- `is-exported.mjs` - Exports `isExported`, a shared constant or state value used by sibling modules.
- `is-type-only-file.mjs` - Exports `isTypeOnlyFile`, a shared constant or state value used by sibling modules.
- `is-type-only-statement.mjs` - Exports `isTypeOnlyStatement`, a shared constant or state value used by sibling modules.
- `main.mjs` - Exports `main`, a shared constant or state value used by sibling modules.
- `normalize.mjs` - Exports `normalize`, a shared constant or state value used by sibling modules.
- `parse-args.mjs` - Exports `parseArgs`, a shared constant or state value used by sibling modules.
- `partition-collisions.mjs` - Exports `partitionCollisions`, a shared constant or state value used by sibling modules.
- `rel.mjs` - Exports `rel`, a shared constant or state value used by sibling modules.
- `replace-ext.mjs` - Exports `replaceExt`, a shared constant or state value used by sibling modules.
- `require.mjs` - Exports `require`, a shared constant or state value used by sibling modules.
- `rewrite-specifier.mjs` - Exports `rewriteSpecifier`, a shared constant or state value used by sibling modules.
- `rewrite-text-at-spans.mjs` - Exports `rewriteTextAtSpans`, a shared constant or state value used by sibling modules.
- `script-kind-for.mjs` - Exports `scriptKindFor`, a shared constant or state value used by sibling modules.
- `should-skip.mjs` - Exports `shouldSkip`, a shared constant or state value used by sibling modules.
- `strip-code-extension.mjs` - Exports `stripCodeExtension`, a shared constant or state value used by sibling modules.
- `to-kebab.mjs` - Exports `toKebab`, a shared constant or state value used by sibling modules.
- `ts.mjs` - Exports `ts`, a shared constant or state value used by sibling modules.
- `walk.mjs` - Exports `walk`, a shared constant or state value used by sibling modules.

## Subdirectories

- No child directories in this directory.

## Operational Notes

- Current on-disk inventory: 32 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus

Check whether the directory purpose, immediate files, and child modules still align with the current harness architecture.
