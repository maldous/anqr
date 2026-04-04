import { logInfo } from "./logger.mjs";
export async function addMessageTool({ role, content }) {
  logInfo(`💬 Add message: ${role} - ${content.slice(0, 100)}`);
  return { acknowledged: true, role, contentLength: content.length };
}
