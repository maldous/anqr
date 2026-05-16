import {
  fetchAllSonarIssues,
  fetchAllSonarHotspots,
  fetchAllSonarDuplicationIssues,
  fetchSonarMeasures,
  syncSonarToLinear,
  syncSonarHotspotsToLinear,
  syncSonarDuplicationsToLinear,
} from "../../../lib/sonar-linear-sync.mjs";
import { sendNotification } from "../../../lib/notify.mjs";

import { PROJECT_KEY } from "./project-key.mjs";
import { SONAR_HOST } from "./sonar-host.mjs";
import { SONAR_TOKEN } from "./sonar-token.mjs";
import { logInfo, logError } from "./logger.mjs";

export async function main() {
  if (!SONAR_TOKEN) {
    logError("[sonar-audit] SONAR_TOKEN not set");
    process.exit(2);
  }

  if (!process.env.LINEAR_API_KEY) {
    logError("[sonar-audit] LINEAR_API_KEY not set");
    process.exit(2);
  }

  logInfo(`[sonar-audit] Querying ${SONAR_HOST} for project ${PROJECT_KEY}...`);

  const [issues, hotspots, dupIssues, measures] = await Promise.all([
    fetchAllSonarIssues(SONAR_TOKEN, SONAR_HOST, PROJECT_KEY),
    fetchAllSonarHotspots(SONAR_TOKEN, SONAR_HOST, PROJECT_KEY),
    fetchAllSonarDuplicationIssues(SONAR_TOKEN, SONAR_HOST, PROJECT_KEY),
    fetchSonarMeasures(SONAR_TOKEN, SONAR_HOST, PROJECT_KEY),
  ]);

  const hotspotCount = hotspots.length;
  const measSummary = measures.map((m) => `${m.metric}: ${m.value}`).join(", ");
  const totalFindings = issues.length + hotspotCount + dupIssues.length;
  logInfo(
    `[sonar-audit] Issues: ${issues.length}, Hotspots: ${hotspotCount}, Duplications: ${dupIssues.length}, Measures: ${measSummary || "none"}`,
  );

  // Sync individual issues (idempotent — same as post-commit path).
  // Each sync internally handles: creation, promotion/requeue, and stale resolution.
  const [issueResult, hotspotResult, dupResult] = await Promise.all([
    syncSonarToLinear({
      sonarIssues: issues,
      projectKey: PROJECT_KEY,
      sonarHost: SONAR_HOST,
      priority: 1,
      resolveStale: true,
      requeueToReady: false,
    }),
    syncSonarHotspotsToLinear({
      sonarHotspots: hotspots,
      projectKey: PROJECT_KEY,
      sonarHost: SONAR_HOST,
      priority: 1,
      resolveStale: true,
      requeueToTodo: false,
    }),
    syncSonarDuplicationsToLinear({
      sonarDupIssues: dupIssues,
      projectKey: PROJECT_KEY,
      sonarHost: SONAR_HOST,
      priority: 2,
      resolveStale: true,
      requeueToTodo: false,
    }),
  ]);

  const totalCreated =
    issueResult.created.length +
    hotspotResult.created.length +
    dupResult.created.length;
  const totalResolved =
    issueResult.resolved.length +
    hotspotResult.resolved.length +
    dupResult.resolved.length;

  if (totalFindings > 0) {
    // Group by rule for notification summary only (no grouped issue creation)
    const byRule = {};
    for (const issue of issues) {
      const rule = issue.rule;
      if (!byRule[rule]) byRule[rule] = [];
      byRule[rule].push(issue);
    }
    const ruleGroups = Object.entries(byRule).sort((a, b) => b[1].length - a[1].length);

    sendNotification({
      subject: `Nightly sonar: ${issues.length} issues (${ruleGroups.length} rules), ${hotspotCount} hotspots`,
      body: [
        `**Created ${totalCreated} new individual issues**`,
        "",
        `Top rules:`,
        ...ruleGroups.slice(0, 5).map(([rule, arr]) => `- ${rule}: ${arr.length}`),
        "",
        totalResolved > 0 ? `**Resolved stale:** ${totalResolved}` : "",
        "",
        `Dashboard: ${SONAR_HOST}/dashboard?id=${PROJECT_KEY}`,
      ]
        .filter(Boolean)
        .join("\n"),
      severity: "critical",
    });
  } else {
    sendNotification({
      subject: "Nightly sonar: all findings resolved",
      body: totalResolved > 0 ? `Resolved ${totalResolved} stale individual issues.` : "No findings.",
      severity: "info",
    });
  }

  if (totalFindings === 0) {
    logInfo("[sonar-audit] Clean - no findings");
  } else {
    logInfo(
      `[sonar-audit] Findings exist (${totalFindings}) - synced ${totalCreated} new individual issues to Linear`,
    );
  }
  process.exit(0);
}
