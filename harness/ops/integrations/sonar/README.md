# ANQR Sonar Integration

## 1. Directory Overview

This directory implements **ANQR Sonar Integration** within the ANQR harness. It primarily acts as a namespace and aggregation layer for child directories, with only a small amount of immediate code. The current inventory is 2 non-README files and 2 subdirectories.

## 2. File Summaries

### Files

- **sonar-linear-audit.mjs** - Facade module that re-exports public members from `./sonar-linear-audit/index.mjs`, `./sonar-linear-audit/runtime.mjs`.
- **sonar-linear-sync.mjs** - Facade module that re-exports public members from `./sonar-linear-sync/index.mjs`.

### Subdirectories

- **sonar-linear-audit/** - Contains **ANQR Sonar-Linear Audit**; it contains a runtime-oriented module set with helper files, `main.mjs`, and `runtime.mjs` and has 0 child directories.
- **sonar-linear-sync/** - Contains **ANQR Sonar-Linear Sync**; it contains 26 immediate files and has 0 child directories.

## 3. Overall Directory Function

Most of the behavior lives in child directories; the immediate directory mainly provides namespacing and lightweight aggregation. Verified immediate files in this directory include Linear integration, and SonarQube integration.

## 4. Usage Instructions

This directory does not define an obvious standalone entry point. Its files are consumed by adjacent harness modules or by child directories.

## 5. Dependencies

- **Internal relative modules** - `./sonar-linear-audit/index.mjs`, `./sonar-linear-audit/runtime.mjs`, `./sonar-linear-sync/index.mjs`

## 6. Additional Comments

- No direct standalone runtime entry point is defined in the immediate directory contents.
