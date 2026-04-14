# Symphony Agent

## Purpose

Directory for runtime service bootstrap or environment support; immediate files include `allowed-commands.mjs`, `assert-mutation-context.mjs`, `build-issue-prompt.mjs`, `call-llm.mjs`, and others.

## Contents

- 31 immediate files
- 0 child directories

## Key Files

- `allowed-commands.mjs` - Exports `ALLOWED_COMMANDS`, a shared constant or state value used by sibling modules.
- `assert-mutation-context.mjs` - Exports `assertMutationContext`, the main helper defined in this file.
- `build-issue-prompt.mjs` - Exports `buildIssuePrompt`, the main helper defined in this file.
- `call-llm.mjs` - Exports `callLLM`, the main helper defined in this file.
- `continue-agent.mjs` - Exports `continueAgent`, the main helper defined in this file.
- `execute-tool.mjs` - Exports `executeTool`, the main helper defined in this file.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `logger.mjs` - Re-export facade that assembles the public surface for this directory.
- `main-repo-root.mjs` - Exports `MAIN_REPO_ROOT`, a shared constant or state value used by sibling modules.
- `no-param-tool.mjs` - Exports `noParamTool`, the main helper defined in this file.
- `param-tool.mjs` - Exports `paramTool`, the main helper defined in this file.
- `path-param.mjs` - Exports `pathParam`, a shared constant or state value used by sibling modules.
- `request-timeout-ms.mjs` - Exports `REQUEST_TIMEOUT_MS`, a shared constant or state value used by sibling modules.
- `run-agent.mjs` - Exports `runAgent`, the main helper defined in this file.
- `run-tool-loop.mjs` - Exports `runToolLoop`, the main helper defined in this file.
- `symphony-bridge-api-key.mjs` - Exports `SYMPHONY_BRIDGE_API_KEY`, a shared constant or state value used by sibling modules.
- `symphony-bridge-model.mjs` - Exports `SYMPHONY_BRIDGE_MODEL`, a shared constant or state value used by sibling modules.
- `symphony-bridge-url.mjs` - Exports `SYMPHONY_BRIDGE_URL`, a shared constant or state value used by sibling modules.
- `tool-definitions.mjs` - Exports `TOOL_DEFINITIONS`, a shared constant or state value used by sibling modules.
- `tool-delete-file.mjs` - Exports `toolDeleteFile`, the main helper defined in this file.
- `tool-list-directory.mjs` - Exports `toolListDirectory`, the main helper defined in this file.
- `tool-patch-file.mjs` - Exports `toolPatchFile`, the main helper defined in this file.
- `tool-read-file.mjs` - Exports `toolReadFile`, the main helper defined in this file.
- `tool-run-ast-density.mjs` - Exports `toolRunAstDensity`, the main helper defined in this file.
- `tool-run-command.mjs` - Exports `toolRunCommand`, the main helper defined in this file.
- `tool-run-cspell.mjs` - Exports `toolRunCspell`, the main helper defined in this file.
- `tool-run-lint.mjs` - Exports `toolRunLint`, the main helper defined in this file.
- `tool-run-tests.mjs` - Exports `toolRunTests`, the main helper defined in this file.
- `tool-run-typecheck.mjs` - Exports `toolRunTypecheck`, the main helper defined in this file.
- `tool-write-file.mjs` - Exports `toolWriteFile`, the main helper defined in this file.
- `validate-path.mjs` - Exports `validatePath`, the main helper defined in this file.

## Subdirectories

- No child directories in this directory.

## Operational Notes

- Current on-disk inventory: 31 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus

Check whether runtime bootstrap assumptions and configuration boundaries still match the service topology described in the ADRs and workspace model.
