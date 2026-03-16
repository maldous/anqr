/**
 * sonar-linear-sync.mjs — SonarQube ↔ Linear issue synchronization
 *
 * Shared by nightly audit (blocking) and runner post-commit (non-blocking).
 * Creates one Linear issue per SonarQube finding with deduplication.
 *
 * Dedup strategy: each Linear issue description contains a marker
 * `<!-- sonar-key:UUID -->` linking it to the SonarQube issue key.
 * On each sync, existing markers are compared against current findings
 * to skip duplicates and (optionally) resolve stale issues.
 */
/* eslint-disable no-console */

import {
  query,
  createIssue,
  updateIssue,
  addComment,
  TEAM_ID,
  STATES,
} from '../linear-client.mjs';

const FETCH_TIMEOUT_MS = 30_000;
const SONAR_KEY_PATTERN = /<!-- sonar-key:([a-f0-9-]+) -->/;
const OPEN_STATE_NAMES = ['Backlog', 'Todo', 'In Progress', 'In Review', 'Pending', 'Rework'];

function fetchWithTimeout(url, headers) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), FETCH_TIMEOUT_MS);
  return fetch(url, { headers, signal: ac.signal }).finally(() => clearTimeout(t));
}

function sonarAuthHeader(token) {
  return `Basic ${Buffer.from(token + ':').toString('base64')}`;
}

// ---------------------------------------------------------------------------
// SonarQube API
// ---------------------------------------------------------------------------

export async function fetchAllSonarIssues(sonarToken, sonarHost, projectKey) {
  const headers = { Authorization: sonarAuthHeader(sonarToken) };
  const issues = [];
  let page = 1;
  const pageSize = 100;

  for (;;) {
    const res = await fetchWithTimeout(
      `${sonarHost}/api/issues/search?componentKeys=${projectKey}&resolved=false&ps=${pageSize}&p=${page}`,
      headers,
    );
    const data = await res.json();
    issues.push(...(data.issues || []));
    if (issues.length >= (data.total || 0)) break;
    page++;
  }

  return issues;
}

export async function fetchSonarHotspotCount(sonarToken, sonarHost, projectKey) {
  const headers = { Authorization: sonarAuthHeader(sonarToken) };
  const res = await fetchWithTimeout(
    `${sonarHost}/api/hotspots/search?projectKey=${projectKey}&ps=1`,
    headers,
  );
  const data = await res.json();
  return data.paging?.total || 0;
}

export async function fetchSonarMeasures(sonarToken, sonarHost, projectKey) {
  const headers = { Authorization: sonarAuthHeader(sonarToken) };
  const res = await fetchWithTimeout(
    `${sonarHost}/api/measures/component?component=${projectKey}&metricKeys=duplicated_lines_density,coverage`,
    headers,
  );
  const data = await res.json();
  return data.component?.measures || [];
}

// ---------------------------------------------------------------------------
// Linear helpers
// ---------------------------------------------------------------------------

async function findOpenSonarLinearIssues() {
  const result = await query(
    `query($filter: IssueFilter!) {
      issues(filter: $filter, first: 100) {
        nodes {
          id identifier title description
          state { name }
        }
      }
    }`,
    {
      filter: {
        team: { id: { eq: TEAM_ID } },
        state: { name: { in: OPEN_STATE_NAMES } },
        title: { contains: '[Sonar]' },
      },
    },
  );
  return result.issues.nodes;
}

function extractSonarKey(description) {
  const match = description?.match(SONAR_KEY_PATTERN);
  return match ? match[1] : null;
}

function stripProjectPrefix(component, projectKey) {
  const prefix = `${projectKey}:`;
  return component.startsWith(prefix) ? component.slice(prefix.length) : component;
}

function buildLinearTitle(sonarIssue, projectKey) {
  const filePath = stripProjectPrefix(sonarIssue.component, projectKey);
  const fileName = filePath.split('/').pop();
  const location = `(${fileName}:${sonarIssue.line})`;
  const maxMsgLen = 200 - '[Sonar] '.length - location.length - 1;
  const msg = sonarIssue.message;
  const truncatedMsg = msg.length > maxMsgLen ? msg.slice(0, maxMsgLen - 1) + '\u2026' : msg;
  return `[Sonar] ${truncatedMsg} ${location}`;
}

function buildLinearDescription(sonarIssue, projectKey, sonarHost) {
  const filePath = stripProjectPrefix(sonarIssue.component, projectKey);
  return [
    `<!-- sonar-key:${sonarIssue.key} -->`,
    '',
    `**Rule:** \`${sonarIssue.rule}\``,
    `**Severity:** ${sonarIssue.severity}`,
    `**Type:** ${sonarIssue.type}`,
    `**File:** \`${filePath}\``,
    `**Line:** ${sonarIssue.line}`,
    `**Effort:** ${sonarIssue.effort || 'unknown'}`,
    '',
    `> ${sonarIssue.message}`,
    '',
    `[View in SonarQube](${sonarHost}/project/issues?id=${projectKey}&open=${sonarIssue.key})`,
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Core sync
// ---------------------------------------------------------------------------

/**
 * Sync SonarQube issues to Linear — one Linear issue per finding.
 *
 * @param {object} opts
 * @param {Array}  opts.sonarIssues  — SonarQube issue objects from the API
 * @param {string} opts.projectKey   — SonarQube project key (e.g. 'anqr')
 * @param {string} opts.sonarHost    — SonarQube base URL
 * @param {number} opts.priority     — Linear priority (1=urgent, 2=high, etc.)
 * @param {boolean} opts.resolveStale — if true, mark Done any Linear [Sonar]
 *   issues whose SonarQube finding is no longer present (nightly only)
 * @returns {{ created: Array, skipped: Array, resolved: Array }}
 */
export async function syncSonarToLinear({ sonarIssues, projectKey, sonarHost, priority, resolveStale }) {
  const existingLinear = await findOpenSonarLinearIssues();

  // Build map: sonarKey → Linear issue (for issues that have the marker)
  const keyToLinear = new Map();
  const legacyIssues = [];
  for (const li of existingLinear) {
    const sk = extractSonarKey(li.description);
    if (sk) {
      keyToLinear.set(sk, li);
    } else {
      legacyIssues.push(li);
    }
  }

  const currentKeys = new Set(sonarIssues.map((i) => i.key));

  // Create missing Linear issues
  const created = [];
  const skipped = [];
  for (const si of sonarIssues) {
    if (keyToLinear.has(si.key)) {
      skipped.push({ sonar: si, linear: keyToLinear.get(si.key) });
      continue;
    }

    const title = buildLinearTitle(si, projectKey);
    const description = buildLinearDescription(si, projectKey, sonarHost);
    const issue = await createIssue({ title, description, priority });
    created.push({ sonar: si, linear: issue });
    console.log(`[sonar-sync] Created ${issue.identifier}: ${title}`);
  }

  // Resolve stale issues (nightly only)
  const resolved = [];
  if (resolveStale) {
    // Resolve tracked issues whose sonar key is no longer present
    for (const [sonarKey, linearIssue] of keyToLinear) {
      if (currentKeys.has(sonarKey)) continue;
      console.log(`[sonar-sync] Resolving ${linearIssue.identifier} — finding no longer present`);
      await addComment(
        linearIssue.id,
        [
          `\u2705 **Sonar finding resolved** — ${new Date().toISOString().slice(0, 10)}`,
          '',
          'This SonarQube finding is no longer detected. Marking as Done.',
        ].join('\n'),
      );
      await updateIssue(linearIssue.id, { stateId: STATES.done });
      resolved.push(linearIssue);
    }

    // Resolve legacy aggregate issues (no sonar-key marker)
    for (const linearIssue of legacyIssues) {
      console.log(`[sonar-sync] Resolving legacy issue ${linearIssue.identifier}`);
      await addComment(
        linearIssue.id,
        [
          `\u2705 **Replaced by per-finding issues** — ${new Date().toISOString().slice(0, 10)}`,
          '',
          'Sonar issues are now tracked individually. This aggregate issue is no longer needed.',
        ].join('\n'),
      );
      await updateIssue(linearIssue.id, { stateId: STATES.done });
      resolved.push(linearIssue);
    }
  }

  return { created, skipped, resolved };
}
