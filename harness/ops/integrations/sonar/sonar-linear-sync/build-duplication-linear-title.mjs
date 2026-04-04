import { stripProjectPrefix } from "./strip-project-prefix.mjs";

export function buildDuplicationLinearTitle(issue, projectKey) {
  const filePath = stripProjectPrefix(issue.component, projectKey);
  const fileName = filePath.split("/").pop();
  const location = `(${fileName}:${issue.line})`;
  const maxMsgLen = 200 - "[SonarDup] ".length - location.length - 1;
  const msg = issue.message;
  const truncatedMsg = msg.length > maxMsgLen ? msg.slice(0, maxMsgLen - 1) + "\u2026" : msg;
  return `[SonarDup] ${truncatedMsg} ${location}`;
}
