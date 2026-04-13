import {
  fetchAllSonarIssues,
  fetchAllSonarHotspots,
  fetchAllSonarDuplicationIssues,
  fetchSonarMeasures,
} from "../../../lib/sonar-linear-sync.mjs";
import {
  findOpenIssuesByTitle,
  updateIssue,
  STATES,
  createIssue,
  LABELS,
} from "../../linear/linear-client.mjs";
import { sendNotification } from "../../../lib/notify.mjs";

import { PROJECT_KEY } from "./project-key.mjs";
import { SONAR_HOST } from "./sonar-host.mjs";
import { SONAR_TOKEN } from "./sonar-token.mjs";
import { CONSOLIDATED_ISSUE_TITLE } from "./consolidated-issue-title.mjs";
import { resolveStaleLinearIssues } from "./resolve-stale-linear-issues.mjs";
import { findOrCreateConsolidatedIssue } from "./find-or-create-consolidated-issue.mjs";
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

  // Group issues by rule type for automatic issue creation
  const byRule = {};
  for (const issue of issues) {
    const rule = issue.rule;
    if (!byRule[rule]) byRule[rule] = [];
    byRule[rule].push(issue);
  }
  const ruleGroups = Object.entries(byRule).sort((a, b) => b[1].length - a[1].length);

  // Find existing grouped issues (by checking for "Sonar:" prefix)
  const existingGrouped = await findOpenIssuesByTitle("Sonar:");
  const existingByTitle = new Map(existingGrouped.map((i) => [i.title, i]));

  // Find or create the consolidated summary issue
  const existingSummary = await findOpenIssuesByTitle(CONSOLIDATED_ISSUE_TITLE);
  const summaryIssue = await findOrCreateConsolidatedIssue(existingSummary);

  // Create/update grouped issues for each rule
  const groupedIssueIds = [];
  for (const [rule, ruleIssues] of ruleGroups) {
    const count = ruleIssues.length;
    const title = `Sonar: ${rule} (${count})`;
    const files = [...new Set(ruleIssues.map((i) => i.component.split(":")[1]))].slice(0, 15);
    const uniqueFiles = [...new Set(ruleIssues.map((i) => i.component))].size;
    const moreFiles =
      files.length < uniqueFiles ? `\n+${uniqueFiles - files.length} more files` : "";

    const description = [
      `**Rule:** ${rule}`,
      `**Count:** ${count}`,
      "",
      `**Affected files (${uniqueFiles}):`,
      ...files.map((f) => `- ${f}`),
      moreFiles,
      "",
      `> ${ruleIssues[0].message}`,
      "",
      `SonarQube: ${SONAR_HOST}/rules?rule_keys=${rule}`,
    ].join("\n");

    let groupIssue;
    if (existingByTitle.has(title)) {
      groupIssue = existingByTitle.get(title);
      await updateIssue(groupIssue.id, {
        description,
        priority: Math.max(2, 4 - Math.floor(Math.log2(count))),
      });
    } else {
      groupIssue = await createIssue({
        title,
        description,
        priority: Math.max(2, 4 - Math.floor(Math.log2(count))),
        labelIds: [LABELS.harness, LABELS.hygiene],
        stateId: STATES.todo,
      });
    }
    groupedIssueIds.push(groupIssue.id);
  }

  // Update or create consolidated summary issue
  const totalFindings = issues.length + hotspotCount + dupIssues.length;
  if (totalFindings > 0) {
    const summaryDesc = [
      `**Nightly Sonar Audit Summary**`,
      "",
      `| Rule | Count |`,
      `|------|-------|`,
      ...ruleGroups.slice(0, 20).map(([rule, arr]) => `| ${rule} | ${arr.length} |`),
      ruleGroups.length > 20 ? `\n_...and ${ruleGroups.length - 20} more rules_` : "",
      "",
      `**Total:** ${issues.length} issues, ${hotspotCount} hotspots, ${dupIssues.length} duplications`,
      `**Rules:** ${ruleGroups.length} unique rules`,
      `**Dashboard:** ${SONAR_HOST}/dashboard?id=${PROJECT_KEY}`,
    ].join("\n");

    await updateIssue(summaryIssue.id, { description: summaryDesc, priority: 1 });

    sendNotification({
      subject: `Nightly sonar: ${issues.length} issues (${ruleGroups.length} rules), ${hotspotCount} hotspots`,
      body: [
        `**Grouped into ${ruleGroups.length} Linear issues**`,
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
    // All findings resolved
    if (summaryIssue) {
      await updateIssue(summaryIssue.id, { stateId: STATES.done });
    }
    // Also close all grouped issues
    for (const id of groupedIssueIds) {
      await updateIssue(id, { stateId: STATES.done });
    }

    sendNotification({
      subject: "Nightly sonar: all findings resolved",
      body: [
        `All ${ruleGroups.length} grouped issues resolved.`,
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
