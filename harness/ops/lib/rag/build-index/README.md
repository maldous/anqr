# RAG Build Index

## 1. Directory Overview

This directory contains the RAG (Retrieval-Augmented Generation) index builder for source code. It
discovers tracked files from the git repository, classifies them based on supported file types and
exclusion rules, and indexes them into a vector store for semantic search capabilities. The module
is part of the larger RAG system that enables AI agents to search and retrieve relevant code
context. It currently contains 29 files and 0 subdirectories.

## 2. File Summaries

### Files

- **build-candidate-list.mjs** - Async function that builds the complete list of files to index. Discovers tracked files, classifies each, checks file sizes, applies priority sorting, and returns statistics on skipped files.
- **classify-file.mjs** - Main classification function that determines if a file should be included in the index. Checks mirrored duplicates, excluded paths, i18n noise, supported basenames, extensions, and JSON inclusion rules. Returns `{ include: boolean, reason: string }`.
- **detect-project-root.mjs** - Core function that detects the project root by executing git commands, falling back to current working directory if not in a git repo.
- **discover-tracked-files.mjs** - Uses `git ls-files -z` to discover all files tracked by git in the repository.
- **excluded-path-patterns.mjs** - Defines regex patterns for paths to exclude: `node_modules/`, `coverage/`, `dist/`, `build/`, `reports/`, `__snapshots__/`, `.yarn/`, `.git/`, `public/gallery/*/manifest.json`, `apps/web/src/content/generated/`, `migration/templates/`, `*.generated.*` files.
- **get-priority.mjs** - Calculates priority for a file based on `PRIORITY_RULES`. Returns matching priority or default 50.
- **i18-n-excluded-path-patterns.mjs** - Excludes i18n noise files: `apps/web/src/i18n/locales/_.json` and `apps/web/src/i18n/static/` unless `INCLUDE_I18N` is enabled.
- **include-i18-n.mjs** - Controls whether i18n (internationalization) files are included in the index. Set via `RAG_BUILD_INCLUDE_I18N` environment variable.
- **index.mjs** - Facade index that re-exports all public API members for external consumption.
- **is-supported-env-name.mjs** - Validates environment file names. Matches `.env` or `.env.*` patterns (case-insensitive).
- **is-truthy.mjs** - Checks if a value is truthy for environment variable parsing. Accepts "1", "true", "yes", "on" (case-insensitive).
- **json-excluded-names.mjs** - Excludes specific JSON files from indexing: `google-services.json`, `Contents.json`, `age_rating.json`, `progress.json`, `linear-history-export.json`, `package-lock.json`.
- **log-skip-summary.mjs** - Logs a summary of skipped files grouped by reason (excluding "unsupported_extension").
- **logger.mjs** - Shared logger module that creates a namespaced logger ("rag-build-index") using the project's logger implementation from `../../logger.mjs`.
- **main.mjs** - Main orchestration function that coordinates the entire indexing process. Checks Ollama availability, optionally clears existing index, builds candidate list, prunes stale entries, indexes files in batches with progress reporting, and outputs final statistics.
- **max-file-bytes.mjs** - Sets maximum file size threshold for indexing. Files larger than 256KB are skipped, configurable via `RAG_BUILD_MAX_FILE_BYTES`.
- **mirror-preferences.mjs** - Defines path mirror preferences to avoid duplicates. Currently maps `android/` to `apps/android/` to skip mirrored files.
- **normalize-path.mjs** - Normalizes file paths to use forward slashes regardless of OS separator.
- **priority-rules.mjs** - Defines prioritization rules for indexing order. Lower priority values are processed first: harness/ops (0), packages (1), apps/api/mobile/web/src (2), apps/web/api (3), apps/android/ios (4), docs/harness (5), docs (6), root files (7).
- **progress-every.mjs** - Controls logging frequency during indexing. Default is every 200 files, configurable via `RAG_BUILD_PROGRESS_EVERY`.
- **project-root.mjs** - Detects and exports the project root directory using git's `rev-parse --show-toplevel` command.
- **runtime.mjs** - Generated runtime carry-forward that first builds the Linear index, then builds the source-code RAG index by calling `main()`.
- **save-interval.mjs** - Controls how often the index is flushed to disk during batch processing. Default is every 25 files, configurable via `RAG_BUILD_SAVE_INTERVAL`.
- **should-include-json.mjs** - Determines if a JSON file should be included based on exclusion rules and i18n settings.
- **should-skip-mirrored-path.mjs** - Determines if a path should be skipped as a duplicate of a mirrored path based on `MIRROR_PREFERENCES`.
- **supported-basenames.mjs** - Defines special filenames to include regardless of extension: `Makefile`, `Dockerfile`, `Gemfile`, `Podfile`, `Procfile`, `.gitignore`, `.gitattributes`, `.editorconfig`, `.npmrc`, `.nvmrc`, `.prettierignore`, `.prettierrc`.
- **supported-extensions.mjs** - Defines supported file extensions for indexing: `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs`, `.md`, `.mdx`, `.json`, `.css`, `.html`, `.yml`, `.yaml`, `.sh`, `.py`, `.service`, `.timer`, `.java`, `.kt`, `.swift`, `.gradle`, `.properties`, `.xml`, `.plist`, `.pbxproj`, `.xcconfig`.
- **to-positive-int.mjs** - Utility to convert values to positive integers with fallback defaults. Used for parsing environment variables like `RAG_BUILD_PROGRESS_EVERY`, `RAG_BUILD_MAX_FILE_BYTES`, and `RAG_BUILD_SAVE_INTERVAL`.
- **verbose.mjs** - Controls verbose logging output. Enabled via `RAG_BUILD_VERBOSE` environment variable or `--verbose` CLI flag.

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point, `main.mjs` coordinates the main execution
path, `runtime.mjs` provides a direct execution path. The README content below is aligned to the
current immediate directory contents.

## 4. Usage Instructions

```bash
node ops/lib/rag/build-index/runtime.mjs
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This directory follows the common harness pattern where `index.mjs` exposes the public API and `runtime.mjs` provides direct execution.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
