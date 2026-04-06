# ANQR Operations

## 1. Directory Overview

This directory (`harness/ops/`) is the canonical harness runtime and operating engine for the ANQR (Agentic Number Query Runner) system. It owns all repository-local tooling and automation, including automation orchestration, governance, provider routing, reporting, notifications, runtime state, machine execution prompts, issue/email/sonar integrations, RAG pipeline, hybrid search, and MCP server management.

## 2. File Summaries

### Compatibility Shims (Facade Files)

These files are compatibility shims that re-export from canonical locations in subdirectories:

- **symphony-state.mjs** - Exports from `./core/symphony-state.mjs`. Provides state management including setFinalizationState, getFinalizationState, enqueueIntegrationCandidate, dequeueIntegrationCandidate, listIntegrationCandidates, acquireIntegrationLock, releaseIntegrationLock, getNextRepairableIssueForWorktree, listRepairableIssuesForWorktree.

- **symphony-config.mjs** - Exports from `./core/symphony-config.mjs`. Central configuration constants for the harness.

- **symphony-validation.mjs** - Exports from `./core/symphony-validation.mjs`. Validation logic for harness operations.

- **symphony-agent.mjs** - Exports from `./runtime/symphony/symphony-agent.mjs`. Symphony agent runtime entry point.

- **symphony-credit-gate.mjs** - Exports from `./integrations/model/symphony-credit-gate.mjs`. Provider selection and credit gate logic.

- **symphony-queue-control.mjs** - Exports from `./orchestration/symphony-queue-control.mjs`. Queue control operations.

- **symphony-runner.mjs** - Imports from `./orchestration/symphony-runner.mjs`. Runner execution entry point (runs the imported module).

- **linear-client.mjs** - Exports from `./integrations/linear/linear-client.mjs`. Linear API client.

- **linear-guardian.mjs** - Imports from `./governance/linear-guardian.mjs`. Governance automation entry point (runs the imported module).

- **email-ingest.mjs** - Imports from `./integrations/email/email-ingest.mjs`. Email ingestion entry point.

- **sonar-linear-audit.mjs** - Imports from `./integrations/sonar/sonar-linear-audit.mjs`. SonarQube audit entry point.

- **sonar-linear-mail.mjs** - Imports from `./integrations/sonar/sonar-linear-audit.mjs`. SonarQube mail entry point.

- **ollama-local-audit.mjs** - Imports from `./integrations/model/ollama-local-audit.mjs`. Ollama audit entry point.

- **nightly-ops-pass.mjs** - Imports from `./orchestration/nightly-ops-pass.mjs`. Nightly operations entry point.

- **harness-report.mjs** - Imports from `./reporting/harness-report.mjs`. Harness reporting entry point.

- **notify.mjs** - Imports from `./notifications/notify.mjs`. Notification system entry point.

### Auto-Generated Facades

- **linear-all.mjs** - Auto-generated facade exporting from `./linear-all/index.mjs` and `./linear-all/runtime.mjs`.

- **harness-doctor.mjs** - Auto-generated facade exporting from `./harness-doctor/index.mjs` and `./harness-doctor/runtime.mjs`.

- **linear-issue-review.mjs** - Auto-generated facade exporting from `./linear-issue-review/index.mjs` and `./linear-issue-review/runtime.mjs`.

### Standalone Scripts

- **model-injector-proxy.py** - Python compatibility shim that delegates to `./integrations/model/model-injector-proxy.py`.

- **sync-worktrees.mjs** - Node.js script that syncs all worktrees (wt1-wt8) to origin/main using git fetch and fast-forward merge.

- **provider-probe-report.mjs** - Node.js script that runs provider probe diagnostics and saves probe cache. Outputs summary of healthy/degraded/failed providers.

- **self-healing-automation.sh** - Bash script placeholder for self-healing automation (retry with exponential backoff, failover, auto-rollback, service restart).

- **issue_hygiene.py** - Placeholder Python script for issue hygiene implementation.

## 3. Overall Directory Function

This directory serves as the operational hub for the ANQR harness system. The files work together to provide:

- **Provider Routing**: symphony-credit-gate.mjs handles provider selection and credit management
- **State Management**: symphony-state.mjs manages execution state and issue tracking
- **Queue Control**: symphony-queue-control.mjs manages the issue queue
- **Governance**: linear-guardian.mjs automates issue creation for failing checks
- **Reporting**: harness-report.mjs generates harness health reports
- **Notifications**: notify.mjs handles system notifications
- **Integrations**: Multiple shims provide connectivity to Linear, SonarQube, email, and model providers
- **Worktree Management**: sync-worktrees.mjs synchronizes multiple worktrees
- **Diagnostics**: provider-probe-report.mjs and harness-doctor.mjs provide health monitoring

The directory uses a decomposition pattern where original files have been split into sibling modules, with facade files maintaining backwards compatibility.

## 4. Usage Instructions

### Directory Structure

```
harness/ops/
├── core/                  # Configuration and shared constants
├── integrations/          # External service integrations
│   ├── linear/            # Linear issue tracking
│   ├── model/             # AI provider bridges and routing
│   ├── notifications/     # Discord via OpenClaw, email
│   └── sonar/             # SonarQube integration
├── lib/                   # Shared libraries
│   ├── rag/               # RAG pipeline (chunker, embeddings, vector-store, build-index)
│   └── search/            # Hybrid search (BM25 + embeddings via RRF)
├── orchestration/         # Runner, queue, nightly flows
├── runtime/
│   ├── mcp/               # Context7 MCP server wrapper and HTTP service
│   └── symphony/          # Symphony agent runtime
└── diagnostics/           # Health checks and auditing
```

### Running Scripts

```bash
# Sync worktrees to origin/main
node ops/sync-worktrees.mjs

# Run provider probe diagnostics
node ops/provider-probe-report.mjs

# Run harness report
node ops/harness-report.mjs

# Linear guardian governance
node ops/linear-guardian.mjs

# Nightly operations
node ops/nightly-ops-pass.mjs
```

### Compatibility Shims

Most files in this directory are compatibility shims that re-export from canonical locations in subdirectories. Import from the canonical location when possible:

```javascript
// Preferred - import from canonical location
import { something } from "./ops/core/symphony-state.mjs";

// Also works - import from shim
import { something } from "./ops/symphony-state.mjs";
```

## 5. Dependencies

### Internal Dependencies

- **./core/** - Configuration and shared constants (symphony-config, symphony-state, symphony-validation)
- **./integrations/** - External service integrations (linear, model, notifications, sonar, email)
- **./orchestration/** - Runner, queue, and nightly flows
- **./runtime/** - Symphony agent runtime and MCP server
- **./reporting/** - Harness reporting
- **./lib/** - Shared libraries (RAG, search)

### Runtime Requirements

- **Node.js** - For .mjs files
- **Python 3** - For .py files
- **Bash** - For .sh files
- **Git** - For worktree sync operations

### External Services

- **Linear** - Issue tracking
- **SonarQube** - Code quality analysis
- **Ollama** - Local model provider
- **Discord** - Notifications via OpenClaw

## 6. Additional Comments

- **Decomposition Pattern**: The directory follows an auto-generation pattern where original files have been split into sibling modules for better organization. Facade files maintain backwards compatibility.

- **Canonical Locations**: Compatibility shims reference canonical locations in subdirectories. When importing, prefer the canonical location.

- **Worktree Sync**: The sync-worktrees.mjs script assumes worktrees named wt1-wt8 in /home/user/src/anqr-wt{1-8}.

- **Provider Probes**: The provider-probe-report.mjs script saves results to cache and outputs JSON and Markdown report paths.

- **Self-Healing**: The self-healing-automation.sh is a placeholder for implementing retry logic, failover, and auto-rollback capabilities.

- **Do Not Own Here**: This directory does not own product runtime logic, reusable product packages, or app shell code.