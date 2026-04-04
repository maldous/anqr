// Generated from ../../../../scripts/ops/runtime/symphony/symphony-agent.mjs:379

import { toolDeleteFile } from "./tool-delete-file.mjs";
import { toolListDirectory } from "./tool-list-directory.mjs";
import { toolPatchFile } from "./tool-patch-file.mjs";
import { toolReadFile } from "./tool-read-file.mjs";
import { toolRunAstDensity } from "./tool-run-ast-density.mjs";
import { toolRunCommand } from "./tool-run-command.mjs";
import { toolRunCspell } from "./tool-run-cspell.mjs";
import { toolRunLint } from "./tool-run-lint.mjs";
import { toolRunTests } from "./tool-run-tests.mjs";
import { toolRunTypecheck } from "./tool-run-typecheck.mjs";
import { toolWriteFile } from "./tool-write-file.mjs";

export function executeTool(projectRoot, toolCall, context = {}) {
  const name = toolCall.function.name;
  const changedFiles = [...(context.filesChanged || [])];

  if (name === "run_typecheck") return toolRunTypecheck(projectRoot);
  if (name === "run_lint") return toolRunLint(projectRoot);
  if (name === "run_cspell") return toolRunCspell(projectRoot, changedFiles);
  if (name === "run_ast_density") return toolRunAstDensity(projectRoot, changedFiles);
  if (name === "run_tests") return toolRunTests(projectRoot);

  let args;
  try {
    args = JSON.parse(toolCall.function.arguments);
  } catch {
    return `Error: Invalid JSON arguments: ${toolCall.function.arguments}`;
  }

  switch (name) {
    case "read_file":
      return toolReadFile(projectRoot, args);
    case "write_file":
      return toolWriteFile(projectRoot, args);
    case "delete_file":
      return toolDeleteFile(projectRoot, args);
    case "patch_file":
      return toolPatchFile(projectRoot, args);
    case "run_command":
      return toolRunCommand(projectRoot, args);
    case "list_directory":
      return toolListDirectory(projectRoot, args);
    default:
      return `Error: Unknown tool: ${name}`;
  }
}
