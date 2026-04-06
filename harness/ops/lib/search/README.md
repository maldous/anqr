# ANQR Search Library

## 1. Directory Overview

This directory implements **ANQR Search Library** within the ANQR harness. It primarily acts as a namespace and aggregation layer for child directories, with only a small amount of immediate code. The current inventory is 2 non-README files and 2 subdirectories.

## 2. File Summaries

### Files

- **hybrid-search.mjs** - Facade module that re-exports public members from `./hybrid-search/index.mjs`, `./hybrid-search/runtime.mjs`.
- **linear-search.mjs** - Facade module that re-exports public members from `./linear-search/index.mjs`.

### Subdirectories

- **hybrid-search/** - Contains **ANQR Hybrid Search**; it contains 27 immediate files and has 0 child directories.
- **linear-search/** - Contains **ANQR Linear Search**; it contains 17 immediate files and has 0 child directories.

## 3. Overall Directory Function

Most of the behavior lives in child directories; the immediate directory mainly provides namespacing and lightweight aggregation. Verified immediate files in this directory use Linear integration.

## 4. Usage Instructions

This directory does not define an obvious standalone entry point. Its files are consumed by adjacent harness modules or by child directories.

## 5. Dependencies

- **Internal relative modules** - `./hybrid-search/index.mjs`, `./hybrid-search/runtime.mjs`, `./linear-search/index.mjs`

## 6. Additional Comments

- No direct standalone runtime entry point is defined in the immediate directory contents.
