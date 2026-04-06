# ANQR Governance

## 1. Directory Overview

This directory implements **ANQR Governance** within the ANQR harness. It primarily acts as a namespace and aggregation layer for child directories, with only a small amount of immediate code. The current inventory is 1 non-README files and 1 subdirectories.

## 2. File Summaries

### Files

- **linear-guardian.mjs** - Facade module that re-exports public members from `./linear-guardian/index.mjs`, `./linear-guardian/runtime.mjs`.

### Subdirectories

- **linear-guardian/** - Contains **ANQR Linear Guardian**; it contains a runtime-oriented module set with helper files, `main.mjs`, and `runtime.mjs` and has 0 child directories.

## 3. Overall Directory Function

Most of the behavior lives in child directories; the immediate directory mainly provides namespacing and lightweight aggregation. Verified immediate files in this directory use Linear integration.

## 4. Usage Instructions

This directory does not define an obvious standalone entry point. Its files are consumed by adjacent harness modules or by child directories.

## 5. Dependencies

- **Internal relative modules** - `./linear-guardian/index.mjs`, `./linear-guardian/runtime.mjs`

## 6. Additional Comments

- No direct standalone runtime entry point is defined in the immediate directory contents.
