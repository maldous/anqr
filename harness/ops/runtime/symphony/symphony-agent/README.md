# ANQR Symphony Agent

## 1. Directory Overview

This directory implements **ANQR Symphony Agent** within the ANQR harness. Key immediate entries include `index.mjs`, `run-tool-loop.mjs`, `tool-run-ast-density.mjs`, `symphony-bridge-api-key.mjs`. The current inventory is 31 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **allowed-commands.mjs** - Exports `ALLOWED_COMMANDS`, a shared `Set` constant used by this module group.
- **assert-mutation-context.mjs** - Exports `assertMutationContext`, which implements assert mutation context.
- **build-issue-prompt.mjs** - Exports `buildIssuePrompt`, which builds issue prompt.
- **call-llm.mjs** - Exports `callLLM`, which implements call llm.
- **continue-agent.mjs** - Exports `continueAgent`, which implements continue agent.
- **execute-tool.mjs** - Exports `executeTool`, which implements execute tool.
- **index.mjs** - Facade module that re-exports public members from `./symphony-bridge-url.mjs`, `./symphony-bridge-api-key.mjs`, `./symphony-bridge-model.mjs`, `./main-repo-root.mjs`, `./assert-mutation-context.mjs`, `./param-tool.mjs`, and 23 more siblings.
- **logger.mjs** - Shared logging helper module exporting `logDebug`, `logError`, `logInfo`, `logWarn`.
- **main-repo-root.mjs** - Exports `MAIN_REPO_ROOT`, a shared constant used by sibling modules.
- **no-param-tool.mjs** - Exports `noParamTool`, which implements no param tool.
- **param-tool.mjs** - Exports `paramTool`, which implements param tool.
- **path-param.mjs** - Exports `pathParam`, which implements path param.
- **request-timeout-ms.mjs** - Exports `REQUEST_TIMEOUT_MS`, a shared constant used by sibling modules.
- **run-agent.mjs** - Exports `runAgent`, which runs agent.
- **run-tool-loop.mjs** - Exports `runToolLoop`, which runs tool loop.
- **symphony-bridge-api-key.mjs** - Exports `SYMPHONY_BRIDGE_API_KEY`, a shared constant used by sibling modules.
- **symphony-bridge-model.mjs** - Exports `SYMPHONY_BRIDGE_MODEL`, a shared constant used by sibling modules.
- **symphony-bridge-url.mjs** - Exports `SYMPHONY_BRIDGE_URL`, a shared constant used by sibling modules.
- **tool-definitions.mjs** - Exports `TOOL_DEFINITIONS`, a shared constant used by sibling modules.
- **tool-delete-file.mjs** - Exports `toolDeleteFile`, which implements tool delete file.
- **tool-list-directory.mjs** - Exports `toolListDirectory`, which implements tool list directory.
- **tool-patch-file.mjs** - Exports `toolPatchFile`, which implements tool patch file.
- **tool-read-file.mjs** - Exports `toolReadFile`, which implements tool read file.
- **tool-run-ast-density.mjs** - Exports `toolRunAstDensity`, which implements tool run ast density.
- **tool-run-command.mjs** - Exports `toolRunCommand`, which implements tool run command.
- **tool-run-cspell.mjs** - Exports `toolRunCspell`, which implements tool run cspell.
- **tool-run-lint.mjs** - Exports `toolRunLint`, which implements tool run lint.
- **tool-run-tests.mjs** - Exports `toolRunTests`, which implements tool run tests.
- **tool-run-typecheck.mjs** - Exports `toolRunTypecheck`, which implements tool run typecheck.
- **tool-write-file.mjs** - Exports `toolWriteFile`, which implements tool write file.
- **validate-path.mjs** - Exports `validatePath`, which validates path.

## 3. Overall Directory Function

The directory primarily provides reusable modules that are imported by sibling runtime, orchestration, or validation code. Verified immediate files in this directory include file-system access, network/API integration, subprocess execution, timer, scheduling, cooldown, or watchdog behavior, Symphony integration, and git/worktree awareness. Environment-driven configuration is present in the immediate code.

## 4. Usage Instructions

```javascript
import * as moduleApi from "./ops/runtime/symphony/symphony-agent/index.mjs";
```

## 5. Dependencies

- **Node.js built-ins** - `node:child_process`, `node:fs`, `node:path`
- **Internal relative modules** - `../../../core/bridge-result.mjs`, `../../../integrations/model/codebuff-direct.mjs`, `../../../integrations/model/codebuff-sdk-runner.mjs`, `../../../lib/logger.mjs`, `../../../symphony-config.mjs`, `../../../symphony-validation.mjs`, `./allowed-commands.mjs`, `./assert-mutation-context.mjs`, `./build-issue-prompt.mjs`, `./call-llm.mjs`, `./execute-tool.mjs`, `./logger.mjs`

## 6. Additional Comments

- No direct standalone runtime entry point is defined in the immediate directory contents.
