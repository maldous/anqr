import { logInfo } from "./logger.mjs";
export async function taskCompletedTool() {
  logInfo(`✅ Task completed`);
  return { acknowledged: true, completed: true };
}
