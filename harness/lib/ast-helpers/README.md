# Ast Helpers

## Purpose

Directory for harness support logic; immediate files include `default-globs.mjs`, `index.mjs`, `is-class-like-initializer.mjs`, `is-function-like-initializer.mjs`, and others.

## Contents

- 8 immediate files
- 0 child directories

## Key Files

- `default-globs.mjs` - Exports `DEFAULT_GLOBS`, a shared constant or state value used by sibling modules.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `is-class-like-initializer.mjs` - Exports `isClassLikeInitializer`, a shared constant or state value used by sibling modules.
- `is-function-like-initializer.mjs` - Exports `isFunctionLikeInitializer`, a shared constant or state value used by sibling modules.
- `is-iife-initializer.mjs` - Exports `isIifeInitializer`, a shared constant or state value used by sibling modules.
- `is-object-like-initializer.mjs` - Exports `isObjectLikeInitializer`, a shared constant or state value used by sibling modules.
- `normalize-path.mjs` - Exports `normalizePath`, a shared constant or state value used by sibling modules.
- `setup-epipe-handler.mjs` - Exports `setupEpipeHandler`, a shared constant or state value used by sibling modules.

## Subdirectories

- No child directories in this directory.

## Operational Notes

- Current on-disk inventory: 8 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus

Check whether the directory purpose, immediate files, and child modules still align with the current harness architecture.
