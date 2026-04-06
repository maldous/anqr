# Rename to Standards

## 1. Directory Overview

This directory implements **Rename to Standards** within the ANQR harness. The immediate code is centered on `main.mjs`, with `index.mjs` exposing the reusable surface for callers. The current inventory is 32 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **apply-plan.mjs** - Exports `applyPlan`, which applies plan.
- **build-plan.mjs** - Exports `buildPlan`, which builds plan.
- **choose-primary-entry.mjs** - Exports `choosePrimaryEntry`, which chooses primary entry.
- **code-extensions.mjs** - Exports `CODE_EXTENSIONS`, a shared `Set` constant used by this module group.
- **collect-module-specifiers.mjs** - Exports `collectModuleSpecifiers`, which collects module specifiers.
- **create-source-file.mjs** - Exports `createSourceFile`, which creates source file.
- **default-dirs.mjs** - Exports `DEFAULT_DIRS`, a shared constant used by sibling modules.
- **detect-suggestion.mjs** - Exports `detectSuggestion`, which detects suggestion.
- **ensure-dot.mjs** - Exports `ensureDot`, which ensures dot.
- **get-declaration-name.mjs** - Exports `getDeclarationName`, which gets declaration name.
- **get-top-level-entries.mjs** - Exports `getTopLevelEntries`, which gets top level entries.
- **has-jsx.mjs** - Exports `hasJsx`, which checks for jsx.
- **index.mjs** - Facade module that re-exports public members from `./require.mjs`, `./ts.mjs`, `./default-dirs.mjs`, `./code-extensions.mjs`, `./parse-args.mjs`, `./normalize.mjs`, and 25 more siblings.
- **is-code-file.mjs** - Exports `isCodeFile`, which checks whether code file.
- **is-exported.mjs** - Exports `isExported`, which checks whether exported.
- **is-type-only-file.mjs** - Exports `isTypeOnlyFile`, which checks whether type only file.
- **is-type-only-statement.mjs** - Exports `isTypeOnlyStatement`, which checks whether type only statement.
- **main.mjs** - Primary orchestration module for the directory. It coordinates the immediate helper modules.
- **normalize.mjs** - Exports `normalize`, which implements normalize.
- **parse-args.mjs** - Exports `parseArgs`, which parses args.
- **partition-collisions.mjs** - Exports `partitionCollisions`, which partitions collisions.
- **rel.mjs** - Exports `rel`, which implements rel.
- **replace-ext.mjs** - Exports `replaceExt`, which replaces ext.
- **require.mjs** - Exports `require`, which implements require.
- **rewrite-specifier.mjs** - Exports `rewriteSpecifier`, which rewrites specifier.
- **rewrite-text-at-spans.mjs** - Exports `rewriteTextAtSpans`, which rewrites text at spans.
- **script-kind-for.mjs** - Exports `scriptKindFor`, which implements script kind for.
- **should-skip.mjs** - Exports `shouldSkip`, which implements should skip.
- **strip-code-extension.mjs** - Exports `stripCodeExtension`, which strips code extension.
- **to-kebab.mjs** - Exports `toKebab`, which implements to kebab.
- **ts.mjs** - Exports `ts`, which implements ts.
- **walk.mjs** - Exports `walk`, which implements walk.

## 3. Overall Directory Function

The directory's behavior is coordinated by `main.mjs`, with the surrounding files supplying parsing, validation, formatting, state, or integration helpers. Verified immediate files in this directory include file-system access, and git/worktree awareness. Environment-driven configuration is present in the immediate code.

## 4. Usage Instructions

```bash
node rename-to-standards/main.mjs
```

## 5. Dependencies

- **Node.js built-ins** - `node:fs`, `node:module`, `node:path`, `node:process`
- **External packages/services referenced in immediate code** - `typescript`
- **Internal relative modules** - `./apply-plan.mjs`, `./build-plan.mjs`, `./choose-primary-entry.mjs`, `./code-extensions.mjs`, `./collect-module-specifiers.mjs`, `./create-source-file.mjs`, `./default-dirs.mjs`, `./detect-suggestion.mjs`, `./ensure-dot.mjs`, `./get-declaration-name.mjs`, `./get-top-level-entries.mjs`, `./has-jsx.mjs`

## 6. Additional Comments

- This README was regenerated from the verified file inventory and current code contents in this directory.
