import { stripProjectPrefix } from "./strip-project-prefix.mjs";

export function buildLinearDescription(sonarIssue, projectKey, sonarHost) {
  const filePath = stripProjectPrefix(sonarIssue.component, projectKey);
  return [
    `<!-- sonar-key:${sonarIssue.key} -->`,
    "",
    `**Rule:** \`${sonarIssue.rule}\``,
    `**Severity:** ${sonarIssue.severity}`,
    `**Type:** ${sonarIssue.type}`,
    `**File:** \`${filePath}\``,
    `**Line:** ${sonarIssue.line}`,
    `**Effort:** ${sonarIssue.effort || "unknown"}`,
    "",
    `> ${sonarIssue.message}`,
    "",
    `[View in SonarQube](${sonarHost}/project/issues?id=${projectKey}&open=${sonarIssue.key})`,
  ].join("\n");
}
