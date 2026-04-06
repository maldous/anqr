# ANQR Governance

## 1. Directory Overview

This directory contains governance automation modules for the ANQR (Agentic Number Query Runner)
harness. It manages issue-state policy, corrective flow, and guarded machine/human lane control. The
governance layer ensures code quality standards are maintained by monitoring harness health checks
and automatically creating or updating Linear issues to track and escalate failures. It currently
contains 1 file and 1 subdirectory.

## 2. File Summaries

### Files

- **linear-guardian.mjs** - Auto-generated facade that re-exports from `./linear-guardian/index.mjs` and `./linear-guardian/runtime.mjs`. Provides the CLI entry point for the Linear Guardian governance automation.

### Child Directories

- **linear-guardian/** - This directory contains the Linear Guardian governance automation module for the ANQR (Agentic Number Query Runner) harness.

## 3. Overall Directory Function

In practice, child directories split the area into smaller focused modules. The README content below
is aligned to the current immediate directory contents.

## 4. Usage Instructions

This directory is primarily consumed through its files and child modules rather than a single entry point.

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
