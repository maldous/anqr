import { logInfo } from "./logger.mjs";
export async function setOutputTool(output) {
  logInfo(`📤 Set output: ${JSON.stringify(output).slice(0, 100)}`);
  return { acknowledged: true };
}
