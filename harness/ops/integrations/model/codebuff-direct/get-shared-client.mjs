import { CodebuffClient } from "@codebuff/sdk";

import { TOOL_PARAMETER_RULES } from "./tool-parameter-rules.mjs";
import { normalizeCwd } from "./normalize-cwd.mjs";
import { sharedClient, setSharedClient } from "./shared-client.mjs";
import { sharedClientKey, setSharedClientKey } from "./shared-client-key.mjs";
import { logDebug } from "./logger.mjs";

export function getSharedClient(apiKey, costMode, cwd) {
  const normalizedCwd = normalizeCwd(cwd);
  const key = `${apiKey || ""}::${costMode || "paid"}::${normalizedCwd}`;
  if (sharedClient && sharedClientKey === key) {
    return sharedClient;
  }
  setSharedClient(
    new CodebuffClient({
      apiKey,
      cwd: normalizedCwd,
      knowledgeFiles: {
        "tool-parameter-rules.knowledge.md": TOOL_PARAMETER_RULES,
      },
    }),
  );
  setSharedClientKey(key);
  logDebug(`[codebuff-direct] created client`, {
    costMode: costMode || "paid",
    cwd: normalizedCwd,
  });
  return sharedClient;
}
