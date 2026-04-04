// Generated from ../../../../scripts/ops/integrations/sonar/sonar-linear-audit.mjs:91

import { updateIssue } from "../../linear/linear-client.mjs";
import { logInfo } from "./logger.mjs";

export async function updateConsolidatedIssue(issueId, findings) {
  const lines = [];

  // Group issues by type for cleaner presentation
  const issues = findings.issues;
  const hotspots = findings.hotspots;
  const duplications = findings.duplications;

  if (issues.length > 0) {
    lines.push("## Issues");
    for (const issue of issues) {
      const file = issue.component.split("/").pop();
      lines.push(`- ${file}:${issue.line} - ${issue.message}<!-- sonar-key:${issue.key} -->`);
    }
    lines.push("");
  }

  if (hotspots.length > 0) {
    lines.push("## Security Hotspots");
    for (const hotspot of hotspots) {
      const file = hotspot.component.split("/").pop();
      lines.push(`- ${file} - ${hotspot.message}<!-- sonar-hotspot-key:${hotspot.key} -->`);
    }
    lines.push("");
  }

  if (duplications.length > 0) {
    lines.push("## Duplications");
    for (const dup of duplications) {
      const file = dup.component.split("/").pop();
      lines.push(`- ${file}:${dup.line} - ${dup.message}<!-- sonar-dup-key:${dup.key} -->`);
    }
    lines.push("");
  }

  // Add grouping instructions for the AI
  lines.push("---");
  lines.push("");
  lines.push("## Grouping Guidance");
  lines.push("");
  lines.push("When resolving these findings, consider grouping by:");
  lines.push("1. **File** - fix all issues in the same file together");
  lines.push("2. **Rule** - address all instances of the same Sonar rule");
  lines.push("3. **Category** - handle all issues of the same type (bugs, code smells, etc.)");
  lines.push("");
  lines.push("This consolidated issue tracks all open SonarQube findings. When resolving, ");
  lines.push(
    "create new grouped issues if appropriate rather than marking everything done at once.",
  );

  const description = lines.join("\n");
  await updateIssue(issueId, { description });
  logInfo(
    `[sonar-audit] Updated consolidated issue with ${issues.length} issues, ${hotspots.length} hotspots, ${duplications.length} duplications`,
  );
}
