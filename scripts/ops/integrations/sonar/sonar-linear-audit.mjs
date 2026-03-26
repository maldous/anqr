#!/usr/bin/env node

/**
 * sonar-linear-audit.mjs — Nightly SonarQube → Linear issue sync (blocking)
 *
 * Queries the local SonarQube instance for open issues and creates one
 * Linear issue per finding (priority 1 / urgent). Resolves any Linear
 * [Sonar] issues whose findings are no longer present.
 *
 * Designed to run in the nightly pipeline after sonar-scanner + sonar-export.
 *
 * Required env:
 *   SONAR_TOKEN       — SonarQube authentication token
 *   LINEAR_API_KEY    — Linear API key
 *
 * Optional env:
 *   SONAR_HOST_URL    — SonarQube base URL (default: http://localhost:9000)
 *
 * Exit codes:
 *   0 = no findings (clean)
 *   1 = findings detected (Linear issues created/updated)
 *   2 = configuration error
 */

import {
  fetchAllSonarIssues,
  fetchAllSonarHotspots,
  fetchAllSonarDuplicationIssues,
  fetchSonarMeasures,
  syncSonarToLinear,
  syncSonarHotspotsToLinear,
  syncSonarDuplicationsToLinear,
} from "../../lib/sonar-linear-sync.mjs";
import { sendNotification } from "../../lib/notify.mjs";
import { createLogger } from "../../lib/logger.mjs";

const { logInfo, logError } = createLogger();

const SONAR_TOKEN = process.env.SONAR_TOKEN;
const SONAR_HOST = process.env.SONAR_HOST_URL || "http://localhost:9000";
const PROJECT_KEY = "anqr";

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

  // Sync regular issues
  const issueResult = await syncSonarToLinear({
    sonarIssues: issues,
    projectKey: PROJECT_KEY,
    sonarHost: SONAR_HOST,
    priority: 1,
    resolveStale: true,
    requeueToReady: false,
  });

  // Sync security hotspots
  const hotspotResult = await syncSonarHotspotsToLinear({
    sonarHotspots: hotspots,
    projectKey: PROJECT_KEY,
    sonarHost: SONAR_HOST,
    priority: 1,
    resolveStale: true,
    requeueToReady: false,
  });

  // Sync duplication issues
  const dupResult = await syncSonarDuplicationsToLinear({
    sonarDupIssues: dupIssues,
    projectKey: PROJECT_KEY,
    sonarHost: SONAR_HOST,
    priority: 2, // Duplications are lower priority than bugs and vulnerabilities
    resolveStale: true,
    requeueToReady: false,
  });

  const totalCreated =
    issueResult.created.length + hotspotResult.created.length + dupResult.created.length;
  const totalPromoted =
    issueResult.promoted.length + hotspotResult.promoted.length + dupResult.promoted.length;
  const totalRequeued =
    issueResult.requeued.length + hotspotResult.requeued.length + dupResult.requeued.length;
  const totalSkipped =
    issueResult.skipped.length + hotspotResult.skipped.length + dupResult.skipped.length;
  const totalResolved =
    issueResult.resolved.length + hotspotResult.resolved.length + dupResult.resolved.length;

  logInfo(
    `[sonar-audit] Issues: created ${issueResult.created.length}, promoted ${issueResult.promoted.length}, requeued ${issueResult.requeued.length}, existing ${issueResult.skipped.length}, resolved ${issueResult.resolved.length}`,
  );
  logInfo(
    `[sonar-audit] Hotspots: created ${hotspotResult.created.length}, promoted ${hotspotResult.promoted.length}, requeued ${hotspotResult.requeued.length}, existing ${hotspotResult.skipped.length}, resolved ${hotspotResult.resolved.length}`,
  );
  logInfo(
    `[sonar-audit] Duplications: created ${dupResult.created.length}, promoted ${dupResult.promoted.length}, requeued ${dupResult.requeued.length}, existing ${dupResult.skipped.length}, resolved ${dupResult.resolved.length}`,
  );
  logInfo(
    `[sonar-audit] Total: created ${totalCreated}, promoted ${totalPromoted}, requeued ${totalRequeued}, existing ${totalSkipped}, resolved ${totalResolved}`,
  );

  if (totalCreated > 0 || totalPromoted > 0 || totalRequeued > 0) {
    // Build details for each category
    const parts = [];

    // Regular issues
    if (issueResult.created.length > 0) {
      const lines = issueResult.created.map(
        (c) =>
          `  ${c.linear.identifier}: ${c.sonar.message} (${c.sonar.component.split("/").pop()}:${c.sonar.line})`,
      );
      parts.push(`**Issues (${issueResult.created.length} new):**`, ...lines);
    }
    if (issueResult.promoted.length > 0) {
      if (parts.length > 0) parts.push("");
      const lines = issueResult.promoted.map(
        (p) => `  ${p.linear.identifier}: promoted to Urgent (was P${p.from})`,
      );
      parts.push(`**Issues (${issueResult.promoted.length} promoted):**`, ...lines);
    }

    // Hotspots
    if (hotspotResult.created.length > 0) {
      if (parts.length > 0) parts.push("");
      const lines = hotspotResult.created.map(
        (c) =>
          `  ${c.linear.identifier}: ${c.hotspot.message} (${c.hotspot.component.split("/").pop()})`,
      );
      parts.push(`**Security Hotspots (${hotspotResult.created.length} new):**`, ...lines);
    }

    // Duplications
    if (dupResult.created.length > 0) {
      if (parts.length > 0) parts.push("");
      const lines = dupResult.created.map(
        (c) =>
          `  ${c.linear.identifier}: ${c.duplication.message} (${c.duplication.component.split("/").pop()}:${c.duplication.line})`,
      );
      parts.push(`**Duplications (${dupResult.created.length} new):**`, ...lines);
    }

    const subjectParts = [];
    if (issueResult.created.length > 0) subjectParts.push(`${issueResult.created.length} issues`);
    if (hotspotResult.created.length > 0)
      subjectParts.push(`${hotspotResult.created.length} hotspots`);
    if (dupResult.created.length > 0) subjectParts.push(`${dupResult.created.length} dup`);

    sendNotification({
      subject: `Nightly sonar: ${subjectParts.join(", ")} — ${totalCreated} new`,
      body: [
        ...parts,
        "",
        `---`,
        `**Summary:** Created: ${totalCreated}, Promoted: ${totalPromoted}, Requeued: ${totalRequeued}, Existing: ${totalSkipped}, Resolved: ${totalResolved}`,
        "",
        `Total open: ${issues.length} issues, ${hotspotCount} hotspots, ${dupIssues.length} duplications`,
        `Dashboard: ${SONAR_HOST}/dashboard?id=${PROJECT_KEY}`,
      ].join("\n"),
      severity: "critical",
    });
  }

  if (totalResolved > 0 && totalCreated === 0 && totalSkipped === 0) {
    sendNotification({
      subject: "Nightly sonar: all findings resolved",
      body: `All SonarQube findings cleared. Resolved ${totalResolved} Linear issue(s).`,
      severity: "info",
    });
  }

  if (issues.length === 0 && hotspotCount === 0 && dupIssues.length === 0) {
    logInfo("[sonar-audit] Clean — no findings");
    process.exit(0);
  }

  logInfo(`[sonar-audit] Findings exist — exiting with code 1 (blocking)`);
  process.exit(1);
}

try {
  await main();
} catch (err) {
  logError(`[sonar-audit] Fatal: ${err.message}`);
  process.exit(2);
}
