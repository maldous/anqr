# ANQR Operations

## 1. Directory Overview

This directory is the canonical ANQR harness runtime and operating engine. It groups orchestration,
governance, reporting, search, RAG, runtime services, integrations, tooling, and shared state. It
currently contains 24 files and 14 subdirectories.

## 2. File Summaries

### Files

- **email-ingest.mjs** - Imports from `./integrations/email/email-ingest.mjs`. Email ingestion entry point.
- **harness-doctor.mjs** - Auto-generated facade exporting from `./harness-doctor/index.mjs` and `./harness-doctor/runtime.mjs`.
- **harness-report.mjs** - Imports from `./reporting/harness-report.mjs`. Harness reporting entry point.
- **issue_hygiene.py** - Placeholder Python script for issue hygiene implementation.
- **linear-all.mjs** - Auto-generated facade exporting from `./linear-all/index.mjs` and `./linear-all/runtime.mjs`.
- **linear-client.mjs** - Exports from `./integrations/linear/linear-client.mjs`. Linear API client.
- **linear-guardian.mjs** - Imports from `./governance/linear-guardian.mjs`. Governance automation entry point (runs the imported module).
- **linear-issue-review.mjs** - Auto-generated facade exporting from `./linear-issue-review/index.mjs` and `./linear-issue-review/runtime.mjs`.
- **model-injector-proxy.py** - Python compatibility shim that delegates to `./integrations/model/model-injector-proxy.py`.
- **nightly-ops-pass.mjs** - Imports from `./orchestration/nightly-ops-pass.mjs`. Nightly operations entry point.
- **notify.mjs** - Imports from `./notifications/notify.mjs`. Notification system entry point.
- **ollama-local-audit.mjs** - Imports from `./integrations/model/ollama-local-audit.mjs`. Ollama audit entry point.
- **provider-probe-report.mjs** - Node.js script that runs provider probe diagnostics and saves probe cache. Outputs summary of healthy/degraded/failed providers.
- **self-healing-automation.sh** - Bash script placeholder for self-healing automation (retry with exponential backoff, failover, auto-rollback, service restart).
- **sonar-linear-audit.mjs** - Imports from `./integrations/sonar/sonar-linear-audit.mjs`. SonarQube audit entry point.
- **sonar-linear-mail.mjs** - Imports from `./integrations/sonar/sonar-linear-audit.mjs`. SonarQube mail entry point.
- **symphony-agent.mjs** - Exports from `./runtime/symphony/symphony-agent.mjs`. Symphony agent runtime entry point.
- **symphony-config.mjs** - Exports from `./core/symphony-config.mjs`. Central configuration constants for the harness.
- **symphony-credit-gate.mjs** - Exports from `./integrations/model/symphony-credit-gate.mjs`. Provider selection and credit gate logic.
- **symphony-queue-control.mjs** - Exports from `./orchestration/symphony-queue-control.mjs`. Queue control operations.
- **symphony-runner.mjs** - Imports from `./orchestration/symphony-runner.mjs`. Runner execution entry point (runs the imported module).
- **symphony-state.mjs** - Exports from `./core/symphony-state.mjs`. Provides state management including setFinalizationState, getFinalizationState, enqueueIntegrationCandidate, dequeueIntegrationCandidate, listIntegrationCandidates, acquireIntegrationLock, releaseIntegrationLock, getNextRepairableIssueForWorktree, listRepairableIssuesForWorktree.
- **symphony-validation.mjs** - Exports from `./core/symphony-validation.mjs`. Validation logic for harness operations.
- **sync-worktrees.mjs** - Node.js script that syncs all worktrees (wt1-wt8) to origin/main using git fetch and fast-forward merge.

### Child Directories

- **core/** - This directory contains shared harness configuration, state management, validation, and low-level runtime invariants for the ANQR (Agentic Number Query Runner) Symphony orchestration system.
- **governance/** - This directory contains governance automation modules for the ANQR (Agentic Number Query Runner) harness.
- **harness-doctor/** - This directory contains the Harness Doctor diagnostic tool for the ANQR (Agentic Number Query Runner) harness system.
- **integrations/** - This directory contains boundary-specific integrations for the ANQR (Agentic Number Query Runner) harness.
- **lib/** - This directory contains shared library utilities for the ANQR (Agentic Number Query Runner) harness.
- **linear-all/** - This directory contains the Linear backlog issue exporter for the ANQR (Agentic Number Query Runner) harness.
- **linear-issue-review/** - This directory contains automation tools for reviewing and managing Linear issues as part of the ANQR (Agentic Number Query Runner) harness governance system.
- **notifications/** - Notification modules for the ANQR (Agentic Number Query Runner) harness to send alerts via email and Discord.
- **orchestration/** - This directory contains the core Symphony harness orchestration scripts that manage the execution pipeline for the ANQR (Agentic Number Query Runner) system.
- **reporting/** - This directory contains harness report generation automation for the ANQR (Agentic Number Query Runner) project.
- **runtime/** - This directory contains runtime-specific harness surfaces for the ANQR (Agentic Number Query Runner) harness.
- **symphony/** - This directory contains the live system prompt used by the ANQR (Agentic Number Query Runner) harness runner when executing worktree tasks.
- **tools/** - This directory contains operational tooling for the ANQR (Agentic Number Query Runner) harness system.
- **types/** - This directory contains TypeScript type declarations and shims for the ANQR (Agentic Number Query Runner) harness.

## 3. Overall Directory Function

In practice, child directories split the area into smaller focused modules. The README content below
is aligned to the current immediate directory contents.

## 4. Usage Instructions

```bash
python3 ops/issue_hygiene.py
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.
- **Python 3** - Required for the Python scripts in this directory.
- **POSIX shell** - Required for the shell scripts in this directory.

## 6. Additional Comments

- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
