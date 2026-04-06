# ANQR Reporting

## 1. Directory Overview

This directory contains harness report generation automation for the ANQR (Agentic Number Query
Runner) project. The reporting system provides a pluggable check framework that runs various health,
quality, and operational checks against the codebase and exports results to JSON for consumption by
other automation tools like the Linear Guardian governance system. It currently contains 1 file and
1 subdirectory.

## 2. File Summaries

### Files

- **harness-report.mjs** - Auto-generated facade that re-exports from `./harness-report/index.mjs` and `./harness-report/runtime.mjs`. Provides the CLI entry point for running harness reports.

### Child Directories

- **harness-report/** - This directory contains the harness-report module for the ANQR (Agentic Number Query Runner) system.

## 3. Overall Directory Function

In practice, child directories split the area into smaller focused modules. The README content below
is aligned to the current immediate directory contents.

## 4. Usage Instructions

This directory is primarily consumed through its files and child modules rather than a single entry point.

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
