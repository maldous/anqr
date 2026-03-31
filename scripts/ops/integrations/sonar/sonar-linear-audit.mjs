#!/usr/bin/env node

/**
 * sonar-linear-audit.mjs - Nightly SonarQube -> Linear issue sync (consolidated)
 *
 * Queries the local SonarQube instance for open issues and creates ONE
 * consolidated Linear issue with all findings listed, rather than one
 * issue per finding. This allows the AI to batch-resolve multiple issues
 * in a single execution.
 *
 * Designed to run in the nightly pipeline after sonar-scanner + sonar-export.
 *
 * Required env:
 *   SONAR_TOKEN       - SonarQube authentication token
 *   LINEAR_API_KEY    - Linear API key
 *
 * Optional env:
 *   SONAR_HOST_URL    - SonarQube base URL (default: http://localhost:9000)
 *
 * Exit codes:
 *   0 = no findings (clean)
 *   1 = findings detected (single Linear issue created/updated)
 *   2 = configuration error
 */

import {
  fetchAllSonarIssues,
  fetchAllSonarHotspots,
  fetchAllSonarDuplicationIssues,
  fetchSonarMeasures,
  findOpenLinearIssuesByTag,
} from "../../lib/sonar-linear-sync.mjs";
import { createIssue, findOpenIssuesByTitle, updateIssue, STATES, LABELS } from "../linear/linear-client.mjs";
import { sendNotification } from "../../lib/notify.mjs";
import { createLogger } from "../../lib/logger.mjs";

const { logInfo, logError } = createLogger();

const SONAR_TOKEN = process.env.SONAR_TOKEN;
const SONAR_HOST = process.env.SONAR_HOST_URL || "http://localhost:9000";
const PROJECT_KEY = "anqr";
const CONSOLIDATED_ISSUE_TITLE = "Nightly Sonar: unresolved findings";

/**
 * Resolve stale individual Linear issues that no longer exist in SonarQube.
 * @param {string[]} sonarKeys - Current Sonar keys to check against
 * @param {string} tag - Linear tag to search for (e.g., "[Sonar]")
 * @param {string} keyType - Key type for regex ("" for issues, "hotspot-" for hotspots, "dup-" for duplications)
 */
async function resolveStaleLinearIssues(sonarKeys, tag, keyType) {
  const existingIssues = await findOpenLinearIssuesByTag(tag);
  const resolved = [];

  for (const issue of existingIssues) {
    // Extract sonar key from issue description
    const keyMatch = issue.description?.match(new RegExp(`<!-- sonar-${keyType}key:([^>]+) -->`));
    const sonarKey = keyMatch ? keyMatch[1] : null;

    // If not found in current Sonar findings, resolve it
    if (!sonarKey || !sonarKeys.includes(sonarKey)) {
      await updateIssue(issue.id, { stateId: STATES.done });
      resolved.push(issue.identifier);
    }
  }

  return resolved;
}

async function findOrCreateConsolidatedIssue(existingIssues) {
  if (existingIssues.length > 0) {
    return existingIssues[0];
  }
  // No existing consolidated issue - create one
  const issue = await createIssue({
    title: CONSOLIDATED_ISSUE_TITLE,
    description: "Placeholder - will be updated after findings are enumerated",
    priority: 1,
    labelIds: [LABELS.harness],
    stateId: STATES.todo,
  });
  logInfo(`[sonar-audit] Created consolidated issue: ${issue.identifier}`);
  return issue;
}

async function updateConsolidatedIssue(issueId, findings) {
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
  lines.push("create new grouped issues if appropriate rather than marking everything done at once.");

  const description = lines.join("\n");
  await updateIssue(issueId, { description });
  logInfo(`[sonar-audit] Updated consolidated issue with ${issues.length} issues, ${hotspots.length} hotspots, ${duplications.length} duplications`);
}

async function main() {
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
    logInfo(`[sonar-audit] Resolved stale: ${staleIssues.length} issues, ${staleHotspots.length} hotspots, ${staleDupCount.length} duplications`);
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
      ].filter(Boolean).join("\n"),
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
      ].filter(Boolean).join("\n"),
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

try {
  await main();
} catch (err) {
  logError(`[sonar-audit] Fatal: ${err.message}`);
  process.exit(2);
}
