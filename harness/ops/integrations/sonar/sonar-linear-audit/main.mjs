import {
  fetchAllSonarIssues,
  fetchAllSonarHotspots,
  fetchAllSonarDuplicationIssues,
  fetchSonarMeasures,
} from "../../../lib/sonar-linear-sync.mjs";
import { findOpenIssuesByTitle, updateIssue, STATES } from "../../linear/linear-client.mjs";
import { sendNotification } from "../../../lib/notify.mjs";

import { PROJECT_KEY } from "./project-key.mjs";
import { SONAR_HOST } from "./sonar-host.mjs";
import { SONAR_TOKEN } from "./sonar-token.mjs";
import { findOrCreateConsolidatedIssue } from "./find-or-create-consolidated-issue.mjs";
import { resolveStaleLinearIssues } from "./resolve-stale-linear-issues.mjs";
import { updateConsolidatedIssue } from "./update-consolidated-issue.mjs";
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
  logInfo(
    `[sonar-audit] Issues: ${issues.length}, Hotspots: ${hotspotCount}, Duplications: ${dupIssues.length}, Measures: ${measSummary || "none"}`,
  );

  // Resolve stale individual issues (from previous per-finding approach)
  const issueKeys = issues.map((i) => i.key);
  const hotspotKeys = hotspots.map((h) => h.key);
  const dupKeys = dupIssues.map((d) => d.key);

  const staleIssues = await resolveStaleLinearIssues(issueKeys, "[Sonar]", "");
  const staleHotspots = await resolveStaleLinearIssues(hotspotKeys, "[SonarHotspot]", "hotspot-");
  const staleDupCount = await resolveStaleLinearIssues(dupKeys, "[SonarDup]", "dup-");

  const totalResolved = staleIssues.length + staleHotspots.length + staleDupCount.length;
  if (totalResolved > 0) {
    logInfo(
      `[sonar-audit] Resolved stale: ${staleIssues.length} issues, ${staleHotspots.length} hotspots, ${staleDupCount.length} duplications`,
    );
  }

  // Find existing consolidated issues
  const existingConsolidated = await findOpenIssuesByTitle("Nightly Sonar:");
  const consolidatedIssue = await findOrCreateConsolidatedIssue(existingConsolidated);

  const totalFindings = issues.length + hotspotCount + dupIssues.length;

  if (totalFindings > 0) {
    // Update the consolidated issue with all findings
    await updateConsolidatedIssue(consolidatedIssue.id, {
      issues,
      hotspots,
      duplications: dupIssues,
    });

    // Ensure it's in Todo state
    if (consolidatedIssue.state.name !== "Todo") {
      await updateIssue(consolidatedIssue.id, { stateId: STATES.todo });
    }

    sendNotification({
      subject: `Nightly sonar: ${issues.length} issues, ${hotspotCount} hotspots, ${dupIssues.length} duplications`,
      body: [
        `Consolidated issue: ${consolidatedIssue.identifier}`,
        "",
        `**Findings:**`,
        `- Issues: ${issues.length}`,
        `- Security Hotspots: ${hotspotCount}`,
        `- Duplications: ${dupIssues.length}`,
        totalResolved > 0 ? `**Resolved stale:** ${totalResolved}` : "",
        "",
        `Total open: ${totalFindings}`,
        `Dashboard: ${SONAR_HOST}/dashboard?id=${PROJECT_KEY}`,
        "",
        `The consolidated issue includes grouping guidance for batch resolution.`,
      ]
        .filter(Boolean)
        .join("\n"),
      severity: "critical",
    });
  } else {
    // All findings resolved - close the consolidated issue
    await updateIssue(consolidatedIssue.id, { stateId: STATES.done });

    sendNotification({
      subject: "Nightly sonar: all findings resolved",
      body: [
        `All SonarQube findings cleared. Consolidated issue ${consolidatedIssue.identifier} resolved.`,
        totalResolved > 0 ? `Also resolved ${totalResolved} stale individual issues.` : "",
      ]
        .filter(Boolean)
        .join("\n"),
      severity: "info",
    });
  }

  if (totalFindings === 0) {
    logInfo("[sonar-audit] Clean - no findings");
    process.exit(0);
  }

  logInfo(`[sonar-audit] Findings exist - exiting with code 1 (blocking)`);
  process.exit(1);
}
