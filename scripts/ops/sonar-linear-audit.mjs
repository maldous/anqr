#!/usr/bin/env node
/* eslint-disable no-console */

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
  fetchSonarHotspotCount,
  fetchSonarMeasures,
  syncSonarToLinear,
} from './lib/sonar-linear-sync.mjs';
import { sendNotification } from './lib/notify.mjs';

const SONAR_TOKEN = process.env.SONAR_TOKEN;
const SONAR_HOST = process.env.SONAR_HOST_URL || 'http://localhost:9000';
const PROJECT_KEY = 'anqr';

async function main() {
  if (!SONAR_TOKEN) {
    console.error('[sonar-audit] SONAR_TOKEN not set');
    process.exit(2);
  }

  if (!process.env.LINEAR_API_KEY) {
    console.error('[sonar-audit] LINEAR_API_KEY not set');
    process.exit(2);
  }

  console.log(`[sonar-audit] Querying ${SONAR_HOST} for project ${PROJECT_KEY}...`);

  const [issues, hotspotCount, measures] = await Promise.all([
    fetchAllSonarIssues(SONAR_TOKEN, SONAR_HOST, PROJECT_KEY),
    fetchSonarHotspotCount(SONAR_TOKEN, SONAR_HOST, PROJECT_KEY),
    fetchSonarMeasures(SONAR_TOKEN, SONAR_HOST, PROJECT_KEY),
  ]);

  const measSummary = measures.map((m) => `${m.metric}: ${m.value}`).join(', ');
  console.log(`[sonar-audit] Issues: ${issues.length}, Hotspots: ${hotspotCount}, Measures: ${measSummary || 'none'}`);

  const { created, skipped, promoted, requeued, resolved } = await syncSonarToLinear({
    sonarIssues: issues,
    projectKey: PROJECT_KEY,
    sonarHost: SONAR_HOST,
    priority: 1,
    resolveStale: true,
    requeueToTodo: true,
  });

  console.log(`[sonar-audit] Created: ${created.length}, Promoted: ${promoted.length}, Requeued: ${requeued.length}, Existing: ${skipped.length}, Resolved: ${resolved.length}`);

  if (created.length > 0 || promoted.length > 0 || requeued.length > 0) {
    const createdLines = created.map(
      (c) => `  ${c.linear.identifier}: ${c.sonar.message} (${c.sonar.component.split('/').pop()}:${c.sonar.line})`,
    );
    const promotedLines = promoted.map(
      (p) => `  ${p.linear.identifier}: promoted to Urgent (was ${p.from === 2 ? 'High' : 'P' + p.from})`,
    );
    const requeuedLines = requeued.map(
      (r) => `  ${r.linear.identifier}: moved from ${r.fromState} → Todo`,
    );
    const parts = [];
    if (created.length > 0) {
      parts.push(`Created ${created.length} new Linear issue(s):`, '', ...createdLines);
    }
    if (promoted.length > 0) {
      if (parts.length > 0) parts.push('');
      parts.push(`Promoted ${promoted.length} existing issue(s) to Urgent:`, '', ...promotedLines);
    }
    if (requeued.length > 0) {
      if (parts.length > 0) parts.push('');
      parts.push(`Requeued ${requeued.length} issue(s) back to Todo:`, '', ...requeuedLines);
    }
    const subjectParts = [];
    if (created.length > 0) subjectParts.push(`${created.length} new`);
    if (promoted.length > 0) subjectParts.push(`${promoted.length} promoted`);
    if (requeued.length > 0) subjectParts.push(`${requeued.length} requeued`);
    sendNotification({
      subject: `Nightly sonar: ${subjectParts.join(', ')} issue(s)`,
      body: [
        ...parts,
        '',
        `Total open: ${issues.length} issues, ${hotspotCount} hotspots`,
        `Existing (deduped): ${skipped.length}`,
        `Resolved (stale): ${resolved.length}`,
        '',
        `Dashboard: ${SONAR_HOST}/dashboard?id=${PROJECT_KEY}`,
      ].join('\n'),
      severity: 'critical',
    });
  }

  if (resolved.length > 0 && created.length === 0 && skipped.length === 0) {
    sendNotification({
      subject: 'Nightly sonar: all findings resolved',
      body: `All SonarQube findings cleared. Resolved ${resolved.length} Linear issue(s).`,
      severity: 'info',
    });
  }

  if (issues.length === 0 && hotspotCount === 0) {
    console.log('[sonar-audit] Clean — no findings');
    process.exit(0);
  }

  console.log(`[sonar-audit] Findings exist — exiting with code 1 (blocking)`);
  process.exit(1);
}

main().catch((err) => {
  console.error(`[sonar-audit] Fatal: ${err.message}`);
  process.exit(2);
});
