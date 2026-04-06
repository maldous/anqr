# RAG Build Index

## 1. Directory Overview

This directory contains the RAG (Retrieval-Augmented Generation) index builder for source code. It discovers tracked files from the git repository, classifies them based on supported file types and exclusion rules, and indexes them into a vector store for semantic search capabilities. The module is part of the larger RAG system that enables AI agents to search and retrieve relevant code context.

## 2. File Summaries

### Configuration Files

- **to-positive-int.mjs** - Utility to convert values to positive integers with fallback defaults. Used for parsing environment variables like `RAG_BUILD_PROGRESS_EVERY`, `RAG_BUILD_MAX_FILE_BYTES`, and `RAG_BUILD_SAVE_INTERVAL`.

- **verbose.mjs** - Controls verbose logging output. Enabled via `RAG_BUILD_VERBOSE` environment variable or `--verbose` CLI flag.

- **include-i18-n.mjs** - Controls whether i18n (internationalization) files are included in the index. Set via `RAG_BUILD_INCLUDE_I18N` environment variable.

- **progress-every.mjs** - Controls logging frequency during indexing. Default is every 200 files, configurable via `RAG_BUILD_PROGRESS_EVERY`.

- **max-file-bytes.mjs** - Sets maximum file size threshold for indexing. Files larger than 256KB are skipped, configurable via `RAG_BUILD_MAX_FILE_BYTES`.

- **save-interval.mjs** - Controls how often the index is flushed to disk during batch processing. Default is every 25 files, configurable via `RAG_BUILD_SAVE_INTERVAL`.

- **project-root.mjs** - Detects and exports the project root directory using git's `rev-parse --show-toplevel` command.

- **detect-project-root.mjs** - Core function that detects the project root by executing git commands, falling back to current working directory if not in a git repo.

### Supported Files Configuration

- **supported-extensions.mjs** - Defines supported file extensions for indexing: `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs`, `.md`, `.mdx`, `.json`, `.css`, `.html`, `.yml`, `.yaml`, `.sh`, `.py`, `.service`, `.timer`, `.java`, `.kt`, `.swift`, `.gradle`, `.properties`, `.xml`, `.plist`, `.pbxproj`, `.xcconfig`.

- **supported-basenames.mjs** - Defines special filenames to include regardless of extension: `Makefile`, `Dockerfile`, `Gemfile`, `Podfile`, `Procfile`, `.gitignore`, `.gitattributes`, `.editorconfig`, `.npmrc`, `.nvmrc`, `.prettierignore`, `.prettierrc`.

- **json-excluded-names.mjs** - Excludes specific JSON files from indexing: `google-services.json`, `Contents.json`, `age_rating.json`, `progress.json`, `linear-history-export.json`, `package-lock.json`.

- **excluded-path-patterns.mjs** - Defines regex patterns for paths to exclude: `node_modules/`, `coverage/`, `dist/`, `build/`, `reports/`, `__snapshots__/`, `.yarn/`, `.git/`, `public/gallery/*/manifest.json`, `apps/web/src/content/generated/`, `migration/templates/`, `*.generated.*` files.

- **i18-n-excluded-path-patterns.mjs** - Excludes i18n noise files: `apps/web/src/i18n/locales/_.json` and `apps/web/src/i18n/static/` unless `INCLUDE_I18N` is enabled.

- **mirror-preferences.mjs** - Defines path mirror preferences to avoid duplicates. Currently maps `android/` to `apps/android/` to skip mirrored files.

- **priority-rules.mjs** - Defines prioritization rules for indexing order. Lower priority values are processed first: harness/ops (0), packages (1), apps/api/mobile/web/src (2), apps/web/api (3), apps/android/ios (4), docs/harness (5), docs (6), root files (7).

### Utility Functions

- **is-truthy.mjs** - Checks if a value is truthy for environment variable parsing. Accepts "1", "true", "yes", "on" (case-insensitive).

- **is-supported-env-name.mjs** - Validates environment file names. Matches `.env` or `.env.*` patterns (case-insensitive).

- **normalize-path.mjs** - Normalizes file paths to use forward slashes regardless of OS separator.

- **should-skip-mirrored-path.mjs** - Determines if a path should be skipped as a duplicate of a mirrored path based on `MIRROR_PREFERENCES`.

- **should-include-json.mjs** - Determines if a JSON file should be included based on exclusion rules and i18n settings.

- **get-priority.mjs** - Calculates priority for a file based on `PRIORITY_RULES`. Returns matching priority or default 50.

- **log-skip-summary.mjs** - Logs a summary of skipped files grouped by reason (excluding "unsupported_extension").

### Core Logic

- **discover-tracked-files.mjs** - Uses `git ls-files -z` to discover all files tracked by git in the repository.

- **classify-file.mjs** - Main classification function that determines if a file should be included in the index. Checks mirrored duplicates, excluded paths, i18n noise, supported basenames, extensions, and JSON inclusion rules. Returns `{ include: boolean, reason: string }`.

- **build-candidate-list.mjs** - Async function that builds the complete list of files to index. Discovers tracked files, classifies each, checks file sizes, applies priority sorting, and returns statistics on skipped files.

- **logger.mjs** - Shared logger module that creates a namespaced logger ("rag-build-index") using the project's logger implementation from `../../logger.mjs`.

### Entry Points

- **main.mjs** - Main orchestration function that coordinates the entire indexing process. Checks Ollama availability, optionally clears existing index, builds candidate list, prunes stale entries, indexes files in batches with progress reporting, and outputs final statistics.

- **index.mjs** - Facade index that re-exports all public API members for external consumption.

- **runtime.mjs** - Generated runtime carry-forward that first builds the Linear index, then builds the source-code RAG index by calling `main()`.

## 3. Overall Directory Function

This directory serves as the core RAG index builder for source code. It works by:

1. **Discovering files** via `discoverTrackedFiles()` using git's ls-files command
2. **Classifying files** via `classifyFile()` to determine which files should be indexed based on extension, basename, path patterns, and size
3. **Building candidates** via `buildCandidateList()` which combines discovery and classification with size checking and priority sorting
4. **Indexing** via `main()` which processes each eligible file, generates embeddings via Ollama, and stores vectors in the vector store

The module integrates with the broader RAG system by importing from `../embeddings.mjs` for Ollama connectivity and `../vector-store.mjs` for vector storage. It also builds a Linear-specific index via `../build-index-linear/build-linear-index.mjs` before processing source code.

Files are processed in priority order (harness/ops first, then packages, then apps) to ensure critical code is indexed first. The index is flushed to disk periodically to prevent memory issues with large repositories.

## 4. Usage Instructions

### Prerequisites

- **Ollama** must be running (default: `http://127.0.0.1:11434`)
- Environment variable `OLLAMA_API_BASE` can override the default URL
- Git repository with tracked files

### Running the Index Builder

```bash
# Via runtime (recommended - builds Linear index first, then source code)
node ops/lib/rag/build-index/runtime.mjs

# Via facade
node ops/lib/rag/build-index/index.mjs
```

### CLI Options

- `--clear` - Clear existing index before building
- `--verbose` - Enable verbose logging output

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `RAG_BUILD_VERBOSE` | false | Enable verbose logging |
| `RAG_BUILD_INCLUDE_I18N` | false | Include i18n locale files |
| `RAG_BUILD_PROGRESS_EVERY` | 200 | Log progress every N files |
| `RAG_BUILD_MAX_FILE_BYTES` | 262144 | Skip files larger than this (256KB) |
| `RAG_BUILD_SAVE_INTERVAL` | 25 | Flush to disk every N files |
| `OLLAMA_API_BASE` | http://127.0.0.1:11434 | Ollama API endpoint |

### Output

The indexer outputs:
- Tracked files scanned count
- Eligible files processed count
- Files indexed this run
- Chunks touched this run
- Failure count
- Index size (entries, KB on disk)
- Files in index
- Chunk type breakdown

## 5. Dependencies

### Internal Dependencies

- **../../logger.mjs** - Project logger for output
- **../embeddings.mjs** - Ollama embeddings integration (`isOllamaAvailable`)
- **../vector-store.mjs** - Vector storage (`clearIndex`, `flushIndex`, `getIndexStats`, `indexFile`, `pruneIndex`)
- **../build-index-linear/build-linear-index.mjs** - Linear-specific index builder

### External Services

- **Ollama** - Local embeddings provider (required for generating vector embeddings)

### Runtime Requirements

- Node.js with ESM support (.mjs files)
- Git command available in PATH
- Ollama server running

## 6. Additional Comments

- **Default Skip Behavior**: Files with unsupported extensions are silently skipped (not logged even in verbose mode) to reduce noise.

- **File Size Enforcement**: Files larger than `MAX_FILE_BYTES` (256KB default) are skipped during indexing to prevent memory issues and extremely long embedding generation times.

- **Path Normalization**: All paths are normalized to use forward slashes regardless of OS, ensuring consistent behavior across platforms.

- **Batch Processing**: Files are processed in batches with periodic disk flushes to balance memory usage with I/O performance.

- **Stale Entry Pruning**: When not clearing the index, existing entries for files no longer in the git tracked set are automatically pruned.

- **Priority Processing**: Files are processed in priority order to ensure critical project files (harness, packages, core apps) are indexed first, which is important for partial index builds that may be interrupted.

- **Mirror Handling**: Android files mirrored to `apps/android/` are deduplicated to avoid indexing duplicate content.