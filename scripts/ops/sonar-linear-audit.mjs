#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * sonar-linear-audit.mjs — Query SonarQube and create/update Linear issues
 *
 * Queries the local SonarQube instance for open issues, security hotspots,
 * and quality measures. If ANY findings exist, creates (or updates) a
 * critical-priority Linear issue and exits with code 1 (blocking).
 *
 * When clean (no findings), resolves any existing open [Sonar] Linear issues
 * by marking them Done with a resolution comment.
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
 *   1 = findings detected (Linear issue created/updated)
 *   2 = configuration error
 */

import {
  createIssue,
  updateIssue,
  findOpenIssuesByTitle,
  addComment,
  STATES,
} from './linear-client.mjs';
import { sendNotification, linearIssueUrl } from './lib/notify.mjs';

const SONAR_TOKEN = process.env.SONAR_TOKEN;
const SONAR_HOST = process.env.SONAR_HOST_URL || 'http://localhost:9000';
const PROJECT_KEY = 'anqr';
const FETCH_TIMEOUT_MS = 30_000;

function fetchWithTimeout(url, headers) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), FETCH_TIMEOUT_MS);
  return fetch(url, { headers, signal: ac.signal }).finally(() => clearTimeout(t));
}

async function main() {
  if (!SONAR_TOKEN) {
    console.error('[sonar-audit] SONAR_TOKEN not set');
    process.exit(2);
  }

  if (!process.env.LINEAR_API_KEY) {
    console.error('[sonar-audit] LINEAR_API_KEY not set');
    process.exit(2);
  }

  const authHeader = `Basic ${Buffer.from(SONAR_TOKEN + ':').toString('base64')}`;
  const headers = { Authorization: authHeader };

  console.log(`[sonar-audit] Querying ${SONAR_HOST} for project ${PROJECT_KEY}...`);

  const issuesRes = await fetchWithTimeout(
    `${SONAR_HOST}/api/issues/search?componentKeys=${PROJECT_KEY}&resolved=false&ps=1`,
    headers,
  );
  const issuesData = await issuesRes.json();
  const totalIssues = issuesData.total || 0;

  const hotRes = await fetchWithTimeout(
    `${SONAR_HOST}/api/hotspots/search?projectKey=${PROJECT_KEY}&ps=1`,
    headers,
  );
  const hotData = await hotRes.json();
  const totalHotspots = hotData.paging?.total || 0;

  const measRes = await fetchWithTimeout(
    `${SONAR_HOST}/api/measures/component?component=${PROJECT_KEY}&metricKeys=duplicated_lines_density,coverage`,
    headers,
  );
  const measData = await measRes.json();
  const measures = measData.component?.measures || [];

  const measSummary = measures.map((m) => `${m.metric}: ${m.value}`).join(', ');
  console.log(`[sonar-audit] Issues: ${totalIssues}, Hotspots: ${totalHotspots}, Measures: ${measSummary || 'none'}`);

  if (totalIssues === 0 && totalHotspots === 0) {
    console.log('[sonar-audit] Clean — no issues or hotspots');

    // Resolve any existing open [Sonar] Linear issues
    const openSonar = await findOpenIssuesByTitle('[Sonar]');
    for (const issue of openSonar) {
      console.log(`[sonar-audit] Resolving ${issue.identifier} — findings cleared`);
      await addComment(
        issue.id,
        [
          `✅ **Nightly sonar audit — clean** — ${new Date().toISOString().slice(0, 10)}`,
          '',
          'All previously reported issues and hotspots have been resolved.',
          'Marking this issue as Done.',
        ].join('\n'),
      );
      await updateIssue(issue.id, { stateId: STATES.done });
      sendNotification({
        subject: `[ANQR] [Sonar] Findings resolved — ${issue.identifier} closed`,
        body: `All SonarQube findings cleared. ${issue.identifier} marked Done.`,
        severity: 'info',
      });
    }

    if (openSonar.length > 0) {
      console.log(`[sonar-audit] Resolved ${openSonar.length} sonar issue(s)`);
    }

    process.exit(0);
  }

  // Findings exist — create or update a critical Linear issue
  const existing = await findOpenIssuesByTitle('[Sonar]');

  if (existing.length > 0) {
    const issue = existing[0];
    console.log(`[sonar-audit] Updating existing issue: ${issue.identifier}`);
    await addComment(
      issue.id,
      [
        `🔍 **Nightly sonar audit** — ${new Date().toISOString().slice(0, 10)}`,
        '',
        `Issues: ${totalIssues}, Hotspots: ${totalHotspots}`,
        ...measures.map((m) => `${m.metric}: ${m.value}`),
        '',
        `Dashboard: ${SONAR_HOST}/dashboard?id=${PROJECT_KEY}`,
      ].join('\n'),
    );
    console.log(`[sonar-audit] Comment added to ${issue.identifier}`);
    process.exit(1);
  }

  const description = [
    'SonarQube nightly analysis detected findings that need attention.',
    '',
    `**Issues:** ${totalIssues}`,
    `**Security Hotspots:** ${totalHotspots}`,
    ...measures.map((m) => `**${m.metric}:** ${m.value}`),
    '',
    `View full dashboard: ${SONAR_HOST}/dashboard?id=${PROJECT_KEY}`,
    '',
    'Run `bash scripts/sonar-export.sh` for a detailed JSON report.',
  ].join('\n');

  const created = await createIssue({
    title: '[Sonar] Quality gate findings detected',
    description,
    priority: 1,
  });

  console.log(`[sonar-audit] Created critical Linear issue: ${created.identifier}`);

  sendNotification({
    subject: `[ANQR] [Sonar] Nightly quality findings — ${created.identifier}`,
    body: `SonarQube found ${totalIssues} issues and ${totalHotspots} hotspots.\n\nLinear: ${linearIssueUrl(created.identifier)}\nDashboard: ${SONAR_HOST}/dashboard?id=${PROJECT_KEY}`,
    severity: 'critical',
  });

  process.exit(1);
}

main().catch((err) => {
  console.error(`[sonar-audit] Fatal: ${err.message}`);
  process.exit(2);
});
