import { logInfo } from "./logger.mjs";
export async function suggestFollowupsTool({ followups }) {
  logInfo(`💡 Suggest followups: ${followups.length} items`);
  return { acknowledged: true, count: followups.length };
}
