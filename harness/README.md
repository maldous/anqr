# ANQR Harness

## 1. Directory Overview

This is the root directory of the ANQR (Agentic Number Query Runner) harness project. The harness owns all repository-local tooling and automation.

**Key architectural rule:** `harness/ops/` is the canonical harness runtime and operating engine. Do not create a second competing harness runtime root. It serves as the central orchestration layer for managing AI provider routing, worktree execution, and operational tooling. The directory contains a mix of facade modules (decomposed from larger files), utility scripts for metrics and API generation, git configuration helpers, and SonarQube export utilities.

## 2. File Summaries

### Facade Modules (Auto-Generated)

These are auto-generated facade files that re-export from sibling modules under matching directories:

- **rename-to-standards.mjs** - Facade exporting from `./rename-to-standards/index.mjs`. Likely provides file renaming utilities to standardize naming conventions.

- **audit-ast-density.mjs** - Facade exporting from `./audit-ast-density/index.mjs` and `./audit-ast-density/runtime.mjs`. Provides AST density auditing capabilities.

- **list-ast-names.mjs** - Facade exporting from `./list-ast-names/index.mjs` and `./list-ast-names/runtime.mjs`. Lists AST node names for analysis purposes.

- **contracts-check.mjs** - Facade exporting from `./contracts-check/index.mjs` and `./contracts-check/runtime.mjs`. Validates contract definitions and runtime behavior.

- **export-linear-all.mjs** - Facade exporting from `./export-linear-all/index.mjs`. Exports all Linear issue data.

- **agent-docs-check.mjs** - Facade exporting from `./agent-docs-check/index.mjs` and `./agent-docs-check/runtime.mjs`. Validates agent documentation.

### Utility Scripts

- **show-metrics.py** - Python script that fetches and displays provider metrics from the Symphony bridge endpoint at `http://127.0.0.1:4319/v1/stats`. Displays ranked providers with selection counts, success/failure rates, average response times, and scores. Requires authentication with `local-symphony` token.

- **generate-openapi.ts** - TypeScript script that generates an OpenAPI specification document from the QR API contract. Outputs to `docs/api/qr-api.openapi.json`. Uses the `@ts-rest/open-api` library and custom logger from `./ops/lib/logger.mjs`.

- **git-setup.sh** - Bash script that configures git for ANQR development. Sets up weave merge driver (critical for concurrent worktrees), diff3 conflict style, pull strategy (merge not rebase), and cross-platform line ending handling. Optionally enables patience diff algorithm.

- **sonar-export.sh** - Bash script that exports SonarQube data including issues (all, reliability, security, maintainability, new code), hotspots, duplication metrics, and measures. Requires `SONAR_HOST_URL` and `SONAR_TOKEN` environment variables. Outputs to `sonar-report.json`.

## 3. Overall Directory Function

This directory serves as the operational hub for the ANQR harness system. The facade modules provide decomposed tooling for code analysis, contract validation, and data export. The utility scripts support:

- **Metrics monitoring** (show-metrics.py) - Real-time monitoring of provider performance and ranking
- **API documentation** (generate-openapi.ts) - OpenAPI spec generation for the QR API
- **Developer setup** (git-setup.sh) - Standardized git configuration for team collaboration
- **Quality reporting** (sonar-export.sh) - SonarQube data export for analysis and reporting

These tools work together to enable provider routing, worktree execution, and operational monitoring of the ANQR system.

## 4. Usage Instructions

### show-metrics.py

```bash
python3 show-metrics.py
```

Fetches and displays provider stats from the Symphony bridge. Requires the bridge to be running at `http://127.0.0.1:4319`.

### generate-openapi.ts

```bash
npx tsx generate-openapi.ts
```

Generates OpenAPI specification. Requires the contracts package and dependencies to be installed.

### git-setup.sh

```bash
./git-setup.sh
```

Interactive script that configures git settings. Run once during initial setup.

### sonar-export.sh

```bash
SONAR_HOST_URL=https://sonar.example.com SONAR_TOKEN=your_token ./sonar-export.sh
```

Exports SonarQube data. Requires `SONAR_HOST_URL` and `SONAR_TOKEN` environment variables.

## 5. Dependencies

### Runtime Dependencies

- **Python 3** - For show-metrics.py
- **Node.js** - For generate-openapi.ts
- **Bash** - For git-setup.sh and sonar-export.sh
- **@ts-rest/open-api** - For OpenAPI generation
- **Symphony bridge** - Running at http://127.0.0.1:4319 for metrics

### External Services

- **SonarQube** - For code quality analysis (sonar-export.sh)
- **Linear** - Issue tracking (export-linear-all.mjs)

## 6. Additional Comments

- The facade modules follow a decomposition pattern where original files have been split into sibling modules for better organization and maintainability
- Weave merge driver configuration is critical for concurrent worktree execution - this is a key part of the ANQR development workflow
- The metrics script uses a ranking system that tracks provider selections, successes, failures, and calculates scores based on performance
- OpenAPI generation uses @ts-rest for contract-driven API documentation
- The SonarQube export script uses pagination to handle large datasets and outputs to JSON Lines format internally before final JSON assembly
