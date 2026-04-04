// Generated from ../../../../scripts/ops/integrations/sonar/sonar-linear-sync.mjs:487

import { stripProjectPrefix } from "./strip-project-prefix.mjs";

export function buildDuplicationLinearDescription(issue, projectKey, sonarHost) {
  const filePath = stripProjectPrefix(issue.component, projectKey);
  return [
    `<!-- sonar-dup-key:${issue.key} -->`,
    "",
    `**Rule:** \`${issue.rule}\``,
    `**Severity:** ${issue.severity}`,
    `**File:** \`${filePath}\``,
    `**Line:** ${issue.line}`,
    "",
    `> ${issue.message}`,
    "",
    `[View in SonarQube](${sonarHost}/project/issues?id=${projectKey}&open=${issue.key})`,
  ].join("\n");
}
