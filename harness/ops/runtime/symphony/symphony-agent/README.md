# ANQR Symphony Agent

## 1. Directory Overview

This directory contains the core Symphony agent implementation for the ANQR (Agentic Number Query Runner) harness. It provides an autonomous agent capable of executing code modifications within isolated worktrees, using a tool-calling pattern with the LLM to read, write, and validate code changes. The agent enforces strict validation workflows and mutation safety guards to ensure code quality.

## 2. File Summaries

### Configuration & Constants

- **symphony-bridge-url.mjs** - Exports `SYMPHONY_BRIDGE_URL` from environment (default: `http://127.0.0.1:4319`)
- **symphony-bridge-api-key.mjs** - Exports `SYMPHONY_BRIDGE_API_KEY` from environment (default: `local-symphony`)
- **symphony-bridge-model.mjs** - Exports `SYMPHONY_BRIDGE_MODEL` from environment (default: `symphony/main`)
- **request-timeout-ms.mjs** - Request timeout constant (900,000ms = 15 minutes)
- **main-repo-root.mjs** - Main repository root path constant (`/home/user/src/anqr`)
- **allowed-commands.mjs** - Allowlist of read-only shell commands: `rg`, `grep`, `cat`, `ls`, `find`, `head`, `tail`, `wc`, `tree`, `file`, `echo`, `pwd`

### Tool Definitions & Helpers

- **tool-definitions.mjs** - Defines all 12 agent tools: `read_file`, `write_file`, `delete_file`, `patch_file`, `run_command`, `list_directory`, `run_typecheck`, `run_lint`, `run_cspell`, `run_ast_density`, `run_tests`, `task_complete`
- **param-tool.mjs** - Factory for tools with parameters
- **no-param-tool.mjs** - Factory for tools without parameters
- **path-param.mjs** - Standard path parameter schema

### Tool Implementations

- **tool-read-file.mjs** - Reads files with 100KB size limit, validates path, checks if directory
- **tool-write-file.mjs** - Writes files, creates parent directories, validates path
- **tool-delete-file.mjs** - Deletes files/directories with guards: prevents deleting project root, ensures inside git repo, blocks top-level directory deletion
- **tool-patch-file.mjs** - Patches files using search/replace with exact match validation
- **tool-run-command.mjs** - Runs allowlisted read-only commands with 15s timeout, 512KB buffer; blocks pipes, redirects, chaining, variable expansion
- **tool-list-directory.mjs** - Lists directories, separates files/dirs, sorts output
- **tool-run-typecheck.mjs** - Runs TypeScript compiler (`tsc --noEmit`)
- **tool-run-lint.mjs** - Runs linter (`oxlint`)
- **tool-run-cspell.mjs** - Runs spell checker (`cspell`)
- **tool-run-ast-density.mjs** - Runs AST density audit (1 top-level declaration per file max)
- **tool-run-tests.mjs** - Runs unit test suite

### Core Agent Logic

- **call-llm.mjs** - Main LLM invocation function. Handles three provider types: (1) symphony-bridge (streaming SSE with `_symphonyResult` capture), (2) direct SDK providers (requiresSdk flag, invokes codebuff-direct), (3) standard HTTP providers. Captures structured results and writes reports to `REPORTS_DIR`.
- **run-agent.mjs** - Entry point for agent execution. Builds issue prompt from Linear issue, sets up messages, calls `runToolLoop`.
- **run-tool-loop.mjs** - Main execution loop. Handles turn budgeting, timeout enforcement, tool call dispatch, validation tracking after mutations, mutation context enforcement, structured result parsing from bridge, autonomous agent completion detection, failure detection, and subgoals parsing.
- **continue-agent.mjs** - Continues agent execution with feedback, useful for retries or continuations.
- **build-issue-prompt.mjs** - Constructs agent prompt from issue: includes goal (identifier + title), description, AI hints, and step-by-step instructions. Critical multi-phase validation logic included.
- **execute-tool.mjs** - Routes tool calls to implementations, handles JSON parsing errors

### Safety & Validation

- **validate-path.mjs** - Path validation preventing escape from project root, blocks `node_modules` and `.git` access
- **assert-mutation-context.mjs** - Enforces mutation safety: requires `worktreeId`, `leaseId`, `projectRoot` for mutating requests; blocks main repo mutations; requires `projectRoot === worktreeRoot`
- **logger.mjs** - Shared logger using `lib/logger.mjs`

### Index & Facade

- **index.mjs** - Generated facade exporting all public API members

## 3. Overall Directory Function

This directory serves as the core execution engine for the ANQR Symphony agent. The agent operates in a tool-calling loop where it receives issue instructions from Linear, uses an LLM to reason and call tools, executes those tools against the project filesystem, and validates all changes before completion.

Key architectural features:

- **Multi-Provider Support**: The `callLLM` function handles symphony-bridge (streaming SSE with structured result capture), direct SDK providers (like Codebuff), and standard HTTP-based providers
- **Mutation Safety**: The `assertMutationContext` function enforces that mutating requests (write_file, patch_file, delete_file) must have valid worktreeId, leaseId, and cannot target the main repo
- **Validation Enforcement**: The agent must run typecheck, lint, cspell, ast_density, and tests after any file modification before calling task_complete
- **Turn Budgeting**: Configurable max turns and execution time limits prevent runaway loops
- **Structured Result Contract**: The symphony-bridge provider can return structured `_symphonyResult` with completion status, tool call counts, changed files, etc.

## 4. Usage Instructions

This directory is primarily imported by other harness modules rather than being run directly. Key usage patterns:

### Running the Agent

```javascript
// Import path depends on calling module location
import { runAgent } from "./symphony-agent/index.mjs";

const result = await runAgent({
  provider: selectedProvider,  // { name, model, baseUrl, apiKey, requiresSdk }
  issue: linearIssue,          // { identifier, title, description, comments }
  projectRoot: worktreePath,   // Must be a worktree, not main repo
  worktreeId: "wt-xxx",        // Required for mutating requests
  worktreeRoot: worktreePath,  // Must equal projectRoot for mutations
  leaseId: "lease-xxx",        // Required for mutating requests
  executionMode: "mutating",   // "mutating" or "read-only"
  systemPrompt: "...",         // Custom system prompt
  maxMs: 7_200_000,            // Optional max execution time
});
```

### Continuing an Agent

```javascript
import { continueAgent } from "./symphony-agent/index.mjs";

const result = await continueAgent({
  provider,
  messages,                    // Previous conversation messages
  projectRoot,
  worktreeId,
  worktreeRoot,
  leaseId,
  executionMode,
  feedback: "Please fix the type error",
  maxTurns: 100,
  maxMs: 600_000,
  taskDescription,
});
```

### Direct Tool Execution

```javascript
import { executeTool, validatePath } from "./symphony-agent/index.mjs";

// Validate a path before use
const safePath = validatePath(projectRoot, "src/utils/helper.ts");

// Execute a tool call from LLM
const result = executeTool(projectRoot, toolCall, { filesChanged: new Set() });
```

## 5. Dependencies

### Internal Dependencies

- **../../../symphony-config.mjs** - Configuration constants: `RUNNER_MAX_TURNS`, `RUNNER_MAX_EXECUTION_MS`, `RUNNER_MAX_OUTPUT_TOKENS`, `RUNNER_TURN_BUDGET_WARNING`
- **../../../symphony-validation.mjs** - Validation functions: `runTypecheck`, `runLint`, `runCspell`, `runAstDensity`, `runTests`
- **../../../integrations/model/codebuff-sdk-runner.mjs** - For `REPORTS_DIR`, `PROJECT_ROOT` constants
- **../../../integrations/model/codebuff-direct.mjs** - For direct SDK invocation
- **../../../core/bridge-result.mjs** - For `inferSymphonyResultFromCompletion`
- **../../../lib/logger.mjs** - Logger factory

### Runtime Requirements

- Node.js with ESM support (.mjs files)
- Valid symphony bridge at configured URL
- For mutating requests: valid worktree with lease

### Environment Variables

- `SYMPHONY_BRIDGE_URL` - Bridge URL (default: `http://127.0.0.1:4319`)
- `SYMPHONY_BRIDGE_API_KEY` - Bridge API key (default: `local-symphony`)
- `SYMPHONY_MODEL_ID` - Model ID for bridge (default: `symphony/main`)

## 6. Additional Comments

- **Fail-Closed Design**: The agent enforces validation runs after ANY file modification. If `task_complete` is called without running all required validations, it's rejected with an error message listing missing validations.

- **Mutation Context Enforcement**: Write, patch, and delete operations are blocked unless `executionMode === "mutating"`, and require valid `worktreeId`, `leaseId`, and `projectRoot` matching `worktreeRoot`.

- **Autonomous Agent Handling**: For providers with `requiresSdk` flag (like Codebuff), the agent detects completion by checking for active subgoals and failure patterns in the response content.

- **Bridge Result Capture**: The `callLLM` function captures structured `_symphonyResult` from SSE chunks in the symphony-bridge provider, enabling reliable completion detection without text heuristics.

- **Turn Budget Warning**: At `RUNNER_TURN_BUDGET_WARNING` remaining turns, the agent prompts itself to stop making changes and focus on validation.

- **Multi-Phase Issue Support**: The `buildIssuePrompt` function includes critical logic to verify previous phase completion before starting new work, preventing building on failed foundations.