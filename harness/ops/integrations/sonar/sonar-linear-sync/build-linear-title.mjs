import { stripProjectPrefix } from "./strip-project-prefix.mjs";

export function buildLinearTitle(sonarIssue, projectKey) {
  const filePath = stripProjectPrefix(sonarIssue.component, projectKey);
  const fileName = filePath.split("/").pop();
  const location = `(${fileName}:${sonarIssue.line})`;
  const maxMsgLen = 200 - "[Sonar] ".length - location.length - 1;
  const msg = sonarIssue.message;
  const truncatedMsg = msg.length > maxMsgLen ? msg.slice(0, maxMsgLen - 1) + "\u2026" : msg;
  return `[Sonar] ${truncatedMsg} ${location}`;
}
