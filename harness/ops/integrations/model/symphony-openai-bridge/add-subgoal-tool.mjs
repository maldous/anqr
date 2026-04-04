// Generated from ../../../../scripts/ops/integrations/model/symphony-openai-bridge.mjs:1057

import { logInfo } from "./logger.mjs";
export async function addSubgoalTool({ id, objective, status, log, plan }) {
  logInfo(`🎯 New subgoal ${id}: ${objective.slice(0, 100)}`);
  return {
    acknowledged: true,
    id,
    objective,
    status: status || "NOT_STARTED",
    log,
    plan,
  };
}
