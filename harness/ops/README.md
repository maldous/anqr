# ANQR Operations

## 1. Directory Overview

This directory implements **ANQR Operations** within the ANQR harness. Key immediate entries include `provider-probe-report.mjs`, `model-injector-proxy.py`, `self-healing-automation.sh`, `linear-issue-review.mjs`. The current inventory is 24 non-README files and 14 subdirectories.

## 2. File Summaries

### Files

- **email-ingest.mjs** - Module that implements email ingest.
- **harness-doctor.mjs** - Facade module that re-exports public members from `./harness-doctor/index.mjs`, `./harness-doctor/runtime.mjs`.
- **harness-report.mjs** - Module that implements harness report.
- **issue_hygiene.py** - Python script that implements issue hygiene.
- **linear-all.mjs** - Facade module that re-exports public members from `./linear-all/index.mjs`, `./linear-all/runtime.mjs`.
- **linear-client.mjs** - Facade module that re-exports public members from `./integrations/linear/linear-client.mjs`.
- **linear-guardian.mjs** - Module that implements linear guardian.
- **linear-issue-review.mjs** - Facade module that re-exports public members from `./linear-issue-review/index.mjs`, `./linear-issue-review/runtime.mjs`.
- **model-injector-proxy.py** - Python script that implements model injector proxy.
- **nightly-ops-pass.mjs** - Module that implements nightly ops pass.
- **notify.mjs** - Module that implements notify.
- **ollama-local-audit.mjs** - Module that implements ollama local audit.
- **provider-probe-report.mjs** - Module that implements provider probe report.
- **self-healing-automation.sh** - Shell script that implements self healing automation.
- **sonar-linear-audit.mjs** - Module that implements sonar linear audit.
- **sonar-linear-mail.mjs** - Module that implements sonar linear mail.
- **symphony-agent.mjs** - Facade module that re-exports public members from `./runtime/symphony/symphony-agent.mjs`.
- **symphony-config.mjs** - Facade module that re-exports public members from `./core/symphony-config.mjs`.
- **symphony-credit-gate.mjs** - Facade module that re-exports public members from `./integrations/model/symphony-credit-gate.mjs`.
- **symphony-queue-control.mjs** - Facade module that re-exports public members from `./orchestration/symphony-queue-control.mjs`.
- **symphony-runner.mjs** - Module that implements symphony runner.
- **symphony-state.mjs** - Facade module that re-exports public members from `./core/symphony-state.mjs`.
- **symphony-validation.mjs** - Facade module that re-exports public members from `./core/symphony-validation.mjs`.
- **sync-worktrees.mjs** - Module that implements sync worktrees.

### Subdirectories

- **core/** - Contains **ANQR Core**; it contains 10 immediate files and has 6 child directories.
- **governance/** - Contains **ANQR Governance**; it acts mainly as a namespace over child directories and has 1 child directories.
- **harness-doctor/** - Contains **ANQR Harness Doctor**; it contains a runtime-oriented module set with helper files, `main.mjs`, and `runtime.mjs` and has 0 child directories.
- **integrations/** - Contains **ANQR Integrations**; it acts mainly as a namespace over child directories and has 5 child directories.
- **lib/** - Contains **ANQR Library**; it contains 5 immediate files and has 4 child directories.
- **linear-all/** - Contains **ANQR Linear All**; it contains a runtime-oriented module set with helper files, `main.mjs`, and `runtime.mjs` and has 0 child directories.
- **linear-issue-review/** - Contains **Linear Issue Review**; it contains a runtime-oriented module set with helper files, `main.mjs`, and `runtime.mjs` and has 0 child directories.
- **notifications/** - Contains **ANQR Notifications**; it acts mainly as a namespace over child directories and has 1 child directories.
- **orchestration/** - Contains **ANQR Orchestration**; it contains 12 immediate files and has 9 child directories.
- **reporting/** - Contains **ANQR Reporting**; it acts mainly as a namespace over child directories and has 1 child directories.
- **runtime/** - Contains **ANQR Runtime**; it acts mainly as a namespace over child directories and has 5 child directories.
- **symphony/** - Contains **ANQR Symphony**; it contains 1 immediate files and has 0 child directories.
- **tools/** - Contains **ANQR Tools**; it contains 4 immediate files and has 3 child directories.
- **types/** - Contains **ANQR Types**; it contains 1 immediate files and has 0 child directories.

## 3. Overall Directory Function

The directory primarily provides reusable modules that are imported by sibling runtime, orchestration, or validation code. Verified immediate files in this directory include timer, scheduling, cooldown, or watchdog behavior, Linear integration, Symphony integration, SonarQube integration, and git/worktree awareness.

## 4. Usage Instructions

```bash
python3 ops/issue_hygiene.py
python3 ops/model-injector-proxy.py
./ops/self-healing-automation.sh
```

## 5. Dependencies

- **External packages/services referenced in immediate code** - `child_process`
- **Internal relative modules** - `./core/symphony-config.mjs`, `./core/symphony-state.mjs`, `./core/symphony-validation.mjs`, `./governance/linear-guardian.mjs`, `./harness-doctor/index.mjs`, `./harness-doctor/runtime.mjs`, `./integrations/email/email-ingest.mjs`, `./integrations/linear/linear-client.mjs`, `./integrations/model/ollama-local-audit.mjs`, `./integrations/model/symphony-credit-gate.mjs`, `./integrations/model/symphony-credit-gate/provider-probe-diagnostics.mjs`, `./integrations/model/symphony-openai-bridge/save-probe-cache.mjs`

## 6. Additional Comments

- No direct standalone runtime entry point is defined in the immediate directory contents.
