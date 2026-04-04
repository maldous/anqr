import { stripProjectPrefix } from "./strip-project-prefix.mjs";

export function buildHotspotLinearDescription(hotspot, projectKey, sonarHost) {
  const filePath = stripProjectPrefix(hotspot.component, projectKey);
  const line = hotspot.textRange?.startLine || "?";
  const lineEnd = hotspot.textRange?.endLine || line;
  const securityCat = hotspot.rule?.securityCategory || "unknown";
  const vulnProb = hotspot.vulnerabilityProbability || "MEDIUM";
  return [
    `<!-- sonar-hotspot-key:${hotspot.key} -->`,
    "",
    `**Security Category:** ${securityCat}`,
    `**Vulnerability Probability:** ${vulnProb}`,
    `**Status:** ${hotspot.status}`,
    `**File:** \`${filePath}\``,
    `**Lines:** ${line}${lineEnd === line ? "" : "-" + lineEnd}`,
    "",
    `> ${hotspot.message}`,
    "",
    `[View in SonarQube](${sonarHost}/project/security_hotspots?id=${projectKey}&hotspots=${hotspot.key})`,
  ].join("\n");
}
