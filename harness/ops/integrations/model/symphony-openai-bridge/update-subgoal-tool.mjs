// Generated from ../../../../scripts/ops/integrations/model/symphony-openai-bridge.mjs:853

import { logInfo } from "./logger.mjs";
export async function updateSubgoalTool({ id, status, log, plan }) {
  const logSuffix = log ? " - " + log.slice(0, 100) : "";
  logInfo(`📋 Subgoal ${id}: ${status || "update"}${logSuffix}`);
  return {
    acknowledged: true,
    id,
    status: status || "IN_PROGRESS",
    log,
    plan,
  };
}
