import { updateIssue, addComment, STATES } from "../../linear/linear-client.mjs";
import { logInfo } from "./logger.mjs";

export async function resolveStaleLinearIssues(keyToLinear, currentKeys, logPrefix, resolveLabel) {
  const resolved = [];
  for (const [key, linearIssue] of keyToLinear) {
    if (currentKeys.has(key)) continue;
    logInfo(
      `[${logPrefix}] Resolving ${linearIssue.identifier} — ${resolveLabel} no longer present`,
    );
    await addComment(
      linearIssue.id,
      [
        `\u2705 **${resolveLabel} resolved** — ${new Date().toISOString().slice(0, 10)}`,
        "",
        `This ${resolveLabel.toLowerCase()} is no longer detected. Marking as Done.`,
      ].join("\n"),
    );
    await updateIssue(linearIssue.id, { stateId: STATES.done });
    resolved.push(linearIssue);
  }
  return resolved;
}
