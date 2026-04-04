// Generated from ../../../../scripts/ops/integrations/linear/review-open-issues.mjs:81

import { listIssuesByState } from "../linear-client.mjs";

import { OPEN_STATES } from "./open-states.mjs";
import { STALE_DAYS } from "./stale-days.mjs";
import { extractCheckName } from "./extract-check-name.mjs";
import { extractSonarDupKey } from "./extract-sonar-dup-key.mjs";
import { extractSonarKey } from "./extract-sonar-key.mjs";
import { fileExistsInGit } from "./file-exists-in-git.mjs";
import { getHarnessStatus } from "./get-harness-status.mjs";
import { isStale } from "./is-stale.mjs";
import { logInfo } from "./logger.mjs";

export async function main() {
  logInfo("[review-open-issues] Starting analysis...\n");

  const issues = await listIssuesByState(OPEN_STATES);
  const failedChecks = await getHarnessStatus();

  logInfo(`[review-open-issues] Analyzing ${issues.length} open issues\n`);

  const recommendations = {
    canResolve: [],
    needsUpdate: [],
    stale: [],
    needsLabels: [],
    duplicate: [],
  };

  for (const issue of issues) {
    const title = issue.title;

    // Check Sonar issues
    if (title.includes("[Sonar]") || title.includes("[SonarDup]")) {
      const sonarKey = extractSonarKey(issue) || extractSonarDupKey(issue);
      if (sonarKey) {
        // Extract file path from description
        const fileMatch = issue.description?.match(/\*\*File:\*\* `([^`]+)`/);
        if (fileMatch) {
          const filepath = fileMatch[1];
          const exists = await fileExistsInGit(filepath);
          if (!exists) {
            recommendations.canResolve.push({
              issue,
              reason: `File no longer exists: ${filepath}`,
              confidence: "high",
            });
          }
        }
      }
    }

    // Check harness issues
    if (title.includes("Harness:") && failedChecks) {
      const checkName = extractCheckName(issue);
      if (checkName && !failedChecks.has(checkName)) {
        recommendations.canResolve.push({
          issue,
          reason: `Harness check '${checkName}' is now passing`,
          confidence: "high",
        });
      }
    }

    // Check for stale issues
    if (isStale(issue)) {
      const ageInDays = Math.floor(
        (Date.now() - new Date(issue.createdAt).getTime()) / (1000 * 60 * 60 * 24),
      );
      recommendations.stale.push({
        issue,
        reason: `Issue is ${ageInDays} days old`,
        ageInDays,
      });
    }

    // Check for missing labels
    const labels = (issue.labels?.nodes || []).map((l) => l.name);
    if (labels.length === 0 || labels.includes("none")) {
      recommendations.needsLabels.push({
        issue,
        reason: "Missing proper labels",
      });
    }

    // Check for duplicate EMAIL issues
    if (title.includes("[EMAIL]")) {
      const similarEmailIssues = issues.filter(
        (i) => i.id !== issue.id && i.title === title && i.state.name === issue.state.name,
      );
      if (similarEmailIssues.length > 0) {
        recommendations.duplicate.push({
          issue,
          duplicates: similarEmailIssues,
          reason: `${similarEmailIssues.length} duplicate(s) found`,
        });
      }
    }
  }

  // Print recommendations
  logInfo("\n" + "=".repeat(80));
  logInfo("ANALYSIS RESULTS");
  logInfo("=".repeat(80) + "\n");

  if (recommendations.canResolve.length > 0) {
    logInfo(`\n📋 CAN LIKELY BE RESOLVED (${recommendations.canResolve.length} issues):`);
    logInfo("-".repeat(80));
    for (const rec of recommendations.canResolve) {
      logInfo(`\n${rec.issue.identifier}: ${rec.issue.title}`);
      logInfo(`  Reason: ${rec.reason}`);
      logInfo(`  Confidence: ${rec.confidence}`);
      logInfo(`  State: ${rec.issue.state.name}`);
      logInfo(`  Created: ${rec.issue.createdAt.split("T")[0]}`);
    }
  }

  if (recommendations.duplicate.length > 0) {
    logInfo(`\n\n🔄 POTENTIAL DUPLICATES (${recommendations.duplicate.length} issues):`);
    logInfo("-".repeat(80));
    for (const rec of recommendations.duplicate) {
      logInfo(`\n${rec.issue.identifier}: ${rec.issue.title}`);
      logInfo(`  Reason: ${rec.reason}`);
      const dupIds = rec.duplicates.map((d) => d.identifier).join(", ");
      logInfo(`  Duplicates: ${dupIds}`);
    }
  }

  if (recommendations.stale.length > 0) {
    logInfo(
      `\n\n⏰ STALE ISSUES (${recommendations.stale.length} issues > ${STALE_DAYS} days old):`,
    );
    logInfo("-".repeat(80));
    const top10Stale = recommendations.stale.sort((a, b) => b.ageInDays - a.ageInDays).slice(0, 10);
    for (const rec of top10Stale) {
      logInfo(`\n${rec.issue.identifier}: ${rec.issue.title}`);
      logInfo(`  Age: ${rec.ageInDays} days`);
      logInfo(`  State: ${rec.issue.state.name}`);
      logInfo(`  Priority: P${rec.issue.priority || "?"}`);
    }
    if (recommendations.stale.length > 10) {
      logInfo(`\n  ... and ${recommendations.stale.length - 10} more`);
    }
  }

  if (recommendations.needsLabels.length > 0) {
    logInfo(`\n\n🏷️  NEEDS LABEL HYGIENE (${recommendations.needsLabels.length} issues):`);
    logInfo("-".repeat(80));
    const top5 = recommendations.needsLabels.slice(0, 5);
    for (const rec of top5) {
      logInfo(`\n${rec.issue.identifier}: ${rec.issue.title}`);
      logInfo(`  Reason: ${rec.reason}`);
    }
    if (recommendations.needsLabels.length > 5) {
      logInfo(`\n  ... and ${recommendations.needsLabels.length - 5} more`);
    }
  }

  // Summary
  logInfo("\n\n" + "=".repeat(80));
  logInfo("SUMMARY");
  logInfo("=".repeat(80));
  logInfo(`Total open issues: ${issues.length}`);
  logInfo(`Can likely be resolved: ${recommendations.canResolve.length}`);
  logInfo(`Potential duplicates: ${recommendations.duplicate.length}`);
  logInfo(`Stale (>${STALE_DAYS}d): ${recommendations.stale.length}`);
  logInfo(`Needs label hygiene: ${recommendations.needsLabels.length}`);
  logInfo("");

  // Return JSON summary for programmatic use
  return {
    totalIssues: issues.length,
    recommendations,
  };
}
