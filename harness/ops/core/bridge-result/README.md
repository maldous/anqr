# Bridge Result

## Purpose
Directory for harness support logic; immediate files include `index.mjs`, `infer-symphony-result-from-completion.mjs`, `normalize-count.mjs`, `normalize-failure-class.mjs`, and others.

## Contents
- 6 immediate files
- 0 child directories

## Key Files
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `infer-symphony-result-from-completion.mjs` - Exports `inferSymphonyResultFromCompletion`, the main helper defined in this file.
- `normalize-count.mjs` - Exports `normalizeCount`, the main helper defined in this file.
- `normalize-failure-class.mjs` - Exports `normalizeFailureClass`, the main helper defined in this file.
- `normalize-string-array.mjs` - Exports `normalizeStringArray`, the main helper defined in this file.
- `normalize-symphony-result.mjs` - Exports `normalizeSymphonyResult`, the main helper defined in this file.

## Subdirectories
- No child directories in this directory.

## Operational Notes
- Current on-disk inventory: 6 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus
Check whether the directory purpose, immediate files, and child modules still align with the current harness architecture.
