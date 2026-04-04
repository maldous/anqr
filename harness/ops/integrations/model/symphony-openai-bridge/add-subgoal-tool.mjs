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
