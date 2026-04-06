# ANQR Sonar Integration

## 1. Directory Overview

This directory contains SonarQube integration modules for the ANQR (Agentic Number Query Runner)
harness. It provides bidirectional synchronization between SonarQube code quality findings and
Linear issue tracking, enabling automated tracking and resolution of code quality issues. It
currently contains 2 files and 2 subdirectories.

## 2. File Summaries

### Files

- **sonar-linear-audit.mjs** - Auto-generated facade that re-exports from `./sonar-linear-audit/index.mjs` and `./sonar-linear-audit/runtime.mjs`. Provides CLI entry point for nightly Sonar audit operations.
- **sonar-linear-sync.mjs** - Auto-generated facade that re-exports from `./sonar-linear-sync/index.mjs`. Main facade for syncing SonarQube issues, hotspots, and duplications to Linear.

### Child Directories

- **sonar-linear-audit/** - This directory contains the Sonar-Linear audit automation module for the ANQR (Agentic Number Query Runner) harness.
- **sonar-linear-sync/** - This directory contains the SonarQube to Linear synchronization module for the ANQR (Agentic Number Query Runner) harness.

## 3. Overall Directory Function

In practice, child directories split the area into smaller focused modules. The README content below
is aligned to the current immediate directory contents.

## 4. Usage Instructions

This directory is primarily consumed through its files and child modules rather than a single entry point.

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
