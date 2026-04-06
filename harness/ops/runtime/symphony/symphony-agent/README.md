# ANQR Symphony Agent

## 1. Directory Overview

This directory contains the core Symphony agent implementation for the ANQR (Agentic Number Query
Runner) harness. It provides an autonomous agent capable of executing code modifications within
isolated worktrees, using a tool-calling pattern with the LLM to read, write, and validate code
changes. The agent enforces strict validation workflows and mutation safety guards to ensure code
quality. It currently contains 31 files and 0 subdirectories.

## 2. File Summaries

### Files

- **allowed-commands.mjs** - Allowlist of read-only shell commands: `rg`, `grep`, `cat`, `ls`, `find`, `head`, `tail`, `wc`, `tree`, `file`, `echo`, `pwd`
- **assert-mutation-context.mjs** - Enforces mutation safety: requires `worktreeId`, `leaseId`, `projectRoot` for mutating requests; blocks main repo mutations; requires `projectRoot === worktreeRoot`
- **build-issue-prompt.mjs** - Constructs agent prompt from issue: includes goal (identifier + title), description, AI hints, and step-by-step instructions. Critical multi-phase validation logic included.
- **call-llm.mjs** - Main LLM invocation function. Handles three provider types: (1) symphony-bridge (streaming SSE with `_symphonyResult` capture), (2) direct SDK providers (requiresSdk flag, invokes codebuff-direct), (3) standard HTTP providers. Captures structured results and writes reports to `REPORTS_DIR`.
- **continue-agent.mjs** - Continues agent execution with feedback, useful for retries or continuations.
- **execute-tool.mjs** - Routes tool calls to implementations, handles JSON parsing errors
- **index.mjs** - Generated facade exporting all public API members
- **logger.mjs** - Shared logger using `lib/logger.mjs`
- **main-repo-root.mjs** - Main repository root path constant (`/home/user/src/anqr`)
- **no-param-tool.mjs** - Factory for tools without parameters
- **param-tool.mjs** - Factory for tools with parameters
- **path-param.mjs** - Standard path parameter schema
- **request-timeout-ms.mjs** - Request timeout constant (900,000ms = 15 minutes)
- **run-agent.mjs** - Entry point for agent execution. Builds issue prompt from Linear issue, sets up messages, calls `runToolLoop`.
- **run-tool-loop.mjs** - Main execution loop. Handles turn budgeting, timeout enforcement, tool call dispatch, validation tracking after mutations, mutation context enforcement, structured result parsing from bridge, autonomous agent completion detection, failure detection, and subgoals parsing.
- **symphony-bridge-api-key.mjs** - Exports `SYMPHONY_BRIDGE_API_KEY` from environment (default: `local-symphony`)
- **symphony-bridge-model.mjs** - Exports `SYMPHONY_BRIDGE_MODEL` from environment (default: `symphony/main`)
- **symphony-bridge-url.mjs** - Exports `SYMPHONY_BRIDGE_URL` from environment (default: `http://127.0.0.1:4319`)
- **tool-definitions.mjs** - Defines all 12 agent tools: `read_file`, `write_file`, `delete_file`, `patch_file`, `run_command`, `list_directory`, `run_typecheck`, `run_lint`, `run_cspell`, `run_ast_density`, `run_tests`, `task_complete`
- **tool-delete-file.mjs** - Deletes files/directories with guards: prevents deleting project root, ensures inside git repo, blocks top-level directory deletion
- **tool-list-directory.mjs** - Lists directories, separates files/dirs, sorts output
- **tool-patch-file.mjs** - Patches files using search/replace with exact match validation
- **tool-read-file.mjs** - Reads files with 100KB size limit, validates path, checks if directory
- **tool-run-ast-density.mjs** - Runs AST density audit (1 top-level declaration per file max)
- **tool-run-command.mjs** - Runs allowlisted read-only commands with 15s timeout, 512KB buffer; blocks pipes, redirects, chaining, variable expansion
- **tool-run-cspell.mjs** - Runs spell checker (`cspell`)
- **tool-run-lint.mjs** - Runs linter (`oxlint`)
- **tool-run-tests.mjs** - Runs unit test suite
- **tool-run-typecheck.mjs** - Runs TypeScript compiler (`tsc --noEmit`)
- **tool-write-file.mjs** - Writes files, creates parent directories, validates path
- **validate-path.mjs** - Path validation preventing escape from project root, blocks `node_modules` and `.git` access

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point. The README content below is aligned to the
current immediate directory contents.

## 4. Usage Instructions

```javascript
import * as moduleApi from "./index.mjs";
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This directory exposes a public API through `index.mjs`.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
