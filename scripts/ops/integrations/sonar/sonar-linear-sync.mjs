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

import {
  query,
  createIssue,
  updateIssue,
  addComment,
  TEAM_ID,
  STATES,
} from "../linear/linear-client.mjs";
import { createLogger } from "../../lib/logger.mjs";

const { logInfo } = createLogger();

const FETCH_TIMEOUT_MS = 30_000;
const SONAR_KEY_PATTERN = /<!-- sonar-key:([a-f0-9-]+) -->/;
const OPEN_STATE_NAMES = ["Backlog", "Todo", "In Progress", "In Review", "Blocked", "Human Review"];
const PRIORITY_LABELS = { 1: "Urgent", 2: "High", 3: "Medium", 4: "Low" };

function fetchWithTimeout(url, headers) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), FETCH_TIMEOUT_MS);
  return fetch(url, { headers, signal: ac.signal }).finally(() => clearTimeout(t));
}

function sonarAuthHeader(token) {
  return `Basic ${Buffer.from(token + ":").toString("base64")}`;
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
    issues.push(
      ...(data.issues || []).filter(
        (issue) =>
          !/too many parameters|Cognitive Complexity|top-level await/i.test(
            `${issue.message || ""} ${issue.rule || ""}`,
          ),
      ),
    );
    if (page * pageSize >= (data.total || 0)) break;
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

export async function fetchAllSonarHotspots(sonarToken, sonarHost, projectKey) {
  const headers = { Authorization: sonarAuthHeader(sonarToken) };
  const hotspots = [];
  let page = 1;
  const pageSize = 100;

  for (;;) {
    const res = await fetchWithTimeout(
      `${sonarHost}/api/hotspots/search?projectKey=${projectKey}&status=TO_REVIEW&ps=${pageSize}&p=${page}`,
      headers,
    );
    const data = await res.json();
    hotspots.push(...(data.hotspots || []));
    if (hotspots.length >= (data.paging?.total || 0)) break;
    page++;
  }

  return hotspots;
}

export async function fetchAllSonarDuplicationIssues(sonarToken, sonarHost, projectKey) {
  const headers = { Authorization: sonarAuthHeader(sonarToken) };
  const dupIssues = [];
  let page = 1;
  const pageSize = 100;

  // SonarQube duplication rules typically start with 'squid:' or have 'Duplication' in the rule name
  // We'll fetch all code smells and filter client-side for duplication-related ones
  for (;;) {
    const res = await fetchWithTimeout(
      `${sonarHost}/api/issues/search?componentKeys=${projectKey}&types=CODE_SMELL&resolved=false&ps=${pageSize}&p=${page}`,
      headers,
    );
    const data = await res.json();
    const fetchedIssues = data.issues || [];
    // Filter for duplication-related issues
    const filtered = fetchedIssues.filter(
      (i) => i.rule?.includes("Duplication") || i.message?.toLowerCase().includes("duplicate"),
    );
    dupIssues.push(...filtered);
    if (dupIssues.length >= (data.total || 0)) break;
    page++;
  }

  return dupIssues;
}

// ---------------------------------------------------------------------------
// Linear helpers
// ---------------------------------------------------------------------------

async function findOpenLinearIssuesByTag(titleTag) {
  const result = await query(
    `query($filter: IssueFilter!) {
      issues(filter: $filter, first: 100) {
        nodes {
          id identifier title description priority
          state { name }
        }
      }
    }`,
    {
      filter: {
        team: { id: { eq: TEAM_ID } },
        state: { name: { in: OPEN_STATE_NAMES } },
        title: { contains: titleTag },
      },
    },
  );
  return result.issues.nodes;
}

async function applyPromoteAndRequeue(
  linearIssue,
  priority,
  requeueToReady,
  logPrefix,
  entityLabel,
) {
  const actions = { promoted: null, requeued: null };

  if (linearIssue.priority > priority) {
    const fromLabel = PRIORITY_LABELS[linearIssue.priority] || `P${linearIssue.priority}`;
    const toLabel = PRIORITY_LABELS[priority] || `P${priority}`;
    await updateIssue(linearIssue.id, { priority });
    await addComment(
      linearIssue.id,
      [
        `\u26a0\ufe0f **Promoted to ${toLabel}** by nightly audit — ${new Date().toISOString().slice(0, 10)}`,
        "",
        `Priority changed from ${fromLabel} to ${toLabel}. This ${entityLabel} must be resolved.`,
      ].join("\n"),
    );
    logInfo(`[${logPrefix}] Promoted ${linearIssue.identifier} from ${fromLabel} → ${toLabel}`);
    actions.promoted = { from: linearIssue.priority, to: priority };
  }

  if (requeueToReady && linearIssue.state.name !== "Todo") {
    const fromState = linearIssue.state.name;
    await updateIssue(linearIssue.id, { stateId: STATES.todo });
    await addComment(
      linearIssue.id,
      [
        `\u21a9\ufe0f **Requeued to Todo** by nightly audit — ${new Date().toISOString().slice(0, 10)}`,
        "",
        `Moved from ${fromState} back to Todo so the runner can pick it up.`,
      ].join("\n"),
    );
    logInfo(`[${logPrefix}] Requeued ${linearIssue.identifier} from ${fromState} → Todo`);
    actions.requeued = { fromState };
  }

  return actions;
}

async function resolveStaleLinearIssues(keyToLinear, currentKeys, logPrefix, resolveLabel) {
  const resolved = [];
  for (const [key, linearIssue] of keyToLinear) {
    if (currentKeys.has(key)) continue;
    logInfo(
      `[${logPrefix}] Resolving ${linearIssue.identifier} — ${resolveLabel} no longer present`,
    );
    await addComment(
      linearIssue.id,
      [
        `\u2705 **${resolveLabel} resolved** — ${new Date().toISOString().slice(0, 10)}`,
        "",
        `This ${resolveLabel.toLowerCase()} is no longer detected. Marking as Done.`,
      ].join("\n"),
    );
    await updateIssue(linearIssue.id, { stateId: STATES.done });
    resolved.push(linearIssue);
  }
  return resolved;
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
  const fileName = filePath.split("/").pop();
  const location = `(${fileName}:${sonarIssue.line})`;
  const maxMsgLen = 200 - "[Sonar] ".length - location.length - 1;
  const msg = sonarIssue.message;
  const truncatedMsg = msg.length > maxMsgLen ? msg.slice(0, maxMsgLen - 1) + "\u2026" : msg;
  return `[Sonar] ${truncatedMsg} ${location}`;
}

function buildLinearDescription(sonarIssue, projectKey, sonarHost) {
  const filePath = stripProjectPrefix(sonarIssue.component, projectKey);
  return [
    `<!-- sonar-key:${sonarIssue.key} -->`,
    "",
    `**Rule:** \`${sonarIssue.rule}\``,
    `**Severity:** ${sonarIssue.severity}`,
    `**Type:** ${sonarIssue.type}`,
    `**File:** \`${filePath}\``,
    `**Line:** ${sonarIssue.line}`,
    `**Effort:** ${sonarIssue.effort || "unknown"}`,
    "",
    `> ${sonarIssue.message}`,
    "",
    `[View in SonarQube](${sonarHost}/project/issues?id=${projectKey}&open=${sonarIssue.key})`,
  ].join("\n");
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
 *   issues whose SonarQube finding is no longer present
 * @param {boolean} opts.requeueToReady — if true, requeue issues to the
 *   ready state so the runner can pick them up (nightly only)
 * @returns {{ created: Array, skipped: Array, promoted: Array, requeued: Array, resolved: Array }}
 */
export async function syncSonarToLinear({
  sonarIssues,
  projectKey,
  sonarHost,
  priority,
  resolveStale,
  requeueToReady,
}) {
  const existingLinear = await findOpenLinearIssuesByTag("[Sonar]");

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

  const created = [];
  const skipped = [];
  const promoted = [];
  const requeued = [];
  for (const si of sonarIssues) {
    if (keyToLinear.has(si.key)) {
      const existing = keyToLinear.get(si.key);
      const actions = await applyPromoteAndRequeue(
        existing,
        priority,
        requeueToReady,
        "sonar-sync",
        "sonar finding",
      );
      if (actions.promoted) {
        promoted.push({ sonar: si, linear: existing, ...actions.promoted });
      }
      if (actions.requeued) {
        requeued.push({ linear: existing, ...actions.requeued });
      }
      if (!actions.promoted && !actions.requeued) {
        skipped.push({ sonar: si, linear: existing });
      }
      continue;
    }

    const title = buildLinearTitle(si, projectKey);
    const description = buildLinearDescription(si, projectKey, sonarHost);
    const issue = await createIssue({ title, description, priority, stateId: STATES.todo });
    created.push({ sonar: si, linear: issue });
    logInfo(`[sonar-sync] Created ${issue.identifier}: ${title}`);
  }

  const resolved = resolveStale
    ? await resolveStaleLinearIssues(keyToLinear, currentKeys, "sonar-sync", "Sonar finding")
    : [];

  if (resolveStale) {
    for (const linearIssue of legacyIssues) {
      logInfo(`[sonar-sync] Resolving legacy issue ${linearIssue.identifier}`);
      await addComment(
        linearIssue.id,
        [
          `\u2705 **Replaced by per-finding issues** — ${new Date().toISOString().slice(0, 10)}`,
          "",
          "Sonar issues are now tracked individually. This aggregate issue is no longer needed.",
        ].join("\n"),
      );
      await updateIssue(linearIssue.id, { stateId: STATES.done });
      resolved.push(linearIssue);
    }
  }

  return { created, skipped, promoted, requeued, resolved };
}

// ---------------------------------------------------------------------------
// Hotspot sync
// ---------------------------------------------------------------------------

function buildHotspotLinearTitle(hotspot, projectKey) {
  const filePath = stripProjectPrefix(hotspot.component, projectKey);
  const fileName = filePath.split("/").pop();
  const line = hotspot.textRange?.startLine || "?";
  const location = `(${fileName}:${line})`;
  const maxMsgLen = 200 - "[SonarHotspot] ".length - location.length - 1;
  const msg = hotspot.message;
  const truncatedMsg = msg.length > maxMsgLen ? msg.slice(0, maxMsgLen - 1) + "\u2026" : msg;
  return `[SonarHotspot] ${truncatedMsg} ${location}`;
}

function buildHotspotLinearDescription(hotspot, projectKey, sonarHost) {
  const filePath = stripProjectPrefix(hotspot.component, projectKey);
  const line = hotspot.textRange?.startLine || "?";
  const lineEnd = hotspot.textRange?.endLine || line;
  const securityCat = hotspot.rule?.securityCategory || "unknown";
  const vulnProb = hotspot.vulnerabilityProbability || "MEDIUM";
  return [
    `<!-- sonar-hotspot-key:${hotspot.key} -->`,
    "",
    `**Security Category:** ${securityCat}`,
    `**Vulnerability Probability:** ${vulnProb}`,
    `**Status:** ${hotspot.status}`,
    `**File:** \`${filePath}\``,
    `**Lines:** ${line}${lineEnd === line ? "" : "-" + lineEnd}`,
    "",
    `> ${hotspot.message}`,
    "",
    `[View in SonarQube](${sonarHost}/project/security_hotspots?id=${projectKey}&hotspots=${hotspot.key})`,
  ].join("\n");
}

/**
 * Sync SonarQube security hotspots to Linear — one Linear issue per hotspot.
 *
 * @param {object} opts
 * @param {Array}  opts.sonarHotspots — SonarQube hotspot objects from the API
 * @param {string} opts.projectKey   — SonarQube project key (e.g. 'anqr')
 * @param {string} opts.sonarHost    — SonarQube base URL
 * @param {number} opts.priority     — Linear priority (1=urgent, 2=high, etc.)
 * @param {boolean} opts.resolveStale — if true, mark Done any Linear [SonarHotspot]
 *   issues whose SonarQube hotspot is no longer present
 * @param {boolean} opts.requeueToReady — if true, requeue issues to the
 *   ready state so the runner can pick them up (nightly only)
 * @returns {{ created: Array, skipped: Array, promoted: Array, requeued: Array, resolved: Array }}
 */
export async function syncSonarHotspotsToLinear({
  sonarHotspots,
  projectKey,
  sonarHost,
  priority,
  resolveStale,
  requeueToReady,
}) {
  const existingLinear = await findOpenLinearIssuesByTag("[SonarHotspot]");

  const keyToLinear = new Map();
  for (const li of existingLinear) {
    const sk = extractSonarKey(li.description);
    if (sk && sk.startsWith("hotspot-")) {
      keyToLinear.set(sk.replace("hotspot-", ""), li);
    }
  }

  const currentKeys = new Set(sonarHotspots.map((h) => h.key));

  const created = [];
  const skipped = [];
  const promoted = [];
  const requeued = [];

  for (const sh of sonarHotspots) {
    if (keyToLinear.has(sh.key)) {
      const existing = keyToLinear.get(sh.key);
      const actions = await applyPromoteAndRequeue(
        existing,
        priority,
        requeueToReady,
        "sonar-hotspot-sync",
        "security hotspot",
      );
      if (actions.promoted) {
        promoted.push({ hotspot: sh, linear: existing, ...actions.promoted });
      }
      if (actions.requeued) {
        requeued.push({ linear: existing, ...actions.requeued });
      }
      if (!actions.promoted && !actions.requeued) {
        skipped.push({ hotspot: sh, linear: existing });
      }
      continue;
    }

    const title = buildHotspotLinearTitle(sh, projectKey);
    const description = buildHotspotLinearDescription(sh, projectKey, sonarHost);
    const issue = await createIssue({ title, description, priority, stateId: STATES.todo });
    created.push({ hotspot: sh, linear: issue });
    logInfo(`[sonar-hotspot-sync] Created ${issue.identifier}: ${title}`);
  }

  const resolved = resolveStale
    ? await resolveStaleLinearIssues(keyToLinear, currentKeys, "sonar-hotspot-sync", "Hotspot")
    : [];

  return { created, skipped, promoted, requeued, resolved };
}

// ---------------------------------------------------------------------------
// Duplication sync
// ---------------------------------------------------------------------------

function buildDuplicationLinearTitle(issue, projectKey) {
  const filePath = stripProjectPrefix(issue.component, projectKey);
  const fileName = filePath.split("/").pop();
  const location = `(${fileName}:${issue.line})`;
  const maxMsgLen = 200 - "[SonarDup] ".length - location.length - 1;
  const msg = issue.message;
  const truncatedMsg = msg.length > maxMsgLen ? msg.slice(0, maxMsgLen - 1) + "\u2026" : msg;
  return `[SonarDup] ${truncatedMsg} ${location}`;
}

function buildDuplicationLinearDescription(issue, projectKey, sonarHost) {
  const filePath = stripProjectPrefix(issue.component, projectKey);
  return [
    `<!-- sonar-dup-key:${issue.key} -->`,
    "",
    `**Rule:** \`${issue.rule}\``,
    `**Severity:** ${issue.severity}`,
    `**File:** \`${filePath}\``,
    `**Line:** ${issue.line}`,
    "",
    `> ${issue.message}`,
    "",
    `[View in SonarQube](${sonarHost}/project/issues?id=${projectKey}&open=${issue.key})`,
  ].join("\n");
}

/**
 * Sync SonarQube duplication issues to Linear — one Linear issue per duplication.
 *
 * @param {object} opts
 * @param {Array}  opts.sonarDupIssues — SonarQube duplication issue objects
 * @param {string} opts.projectKey    — SonarQube project key (e.g. 'anqr')
 * @param {string} opts.sonarHost     — SonarQube base URL
 * @param {number} opts.priority      — Linear priority (1=urgent, 2=high, etc.)
 * @param {boolean} opts.resolveStale — if true, mark Done any Linear [SonarDup]
 *   issues whose SonarQube finding is no longer present
 * @param {boolean} opts.requeueToReady — if true, requeue issues to the
 *   ready state so the runner can pick them up (nightly only)
 * @returns {{ created: Array, skipped: Array, promoted: Array, requeued: Array, resolved: Array }}
 */
export async function syncSonarDuplicationsToLinear({
  sonarDupIssues,
  projectKey,
  sonarHost,
  priority,
  resolveStale,
  requeueToReady,
}) {
  const existingLinear = await findOpenLinearIssuesByTag("[SonarDup]");

  const keyToLinear = new Map();
  for (const li of existingLinear) {
    const sk = extractSonarKey(li.description);
    if (sk && sk.startsWith("dup-")) {
      keyToLinear.set(sk.replace("dup-", ""), li);
    }
  }

  const currentKeys = new Set(sonarDupIssues.map((i) => i.key));

  const created = [];
  const skipped = [];
  const promoted = [];
  const requeued = [];

  for (const sd of sonarDupIssues) {
    if (keyToLinear.has(sd.key)) {
      const existing = keyToLinear.get(sd.key);
      const actions = await applyPromoteAndRequeue(
        existing,
        priority,
        requeueToReady,
        "sonar-dup-sync",
        "duplication issue",
      );
      if (actions.promoted) {
        promoted.push({ duplication: sd, linear: existing, ...actions.promoted });
      }
      if (actions.requeued) {
        requeued.push({ linear: existing, ...actions.requeued });
      }
      if (!actions.promoted && !actions.requeued) {
        skipped.push({ duplication: sd, linear: existing });
      }
      continue;
    }

    const title = buildDuplicationLinearTitle(sd, projectKey);
    const description = buildDuplicationLinearDescription(sd, projectKey, sonarHost);
    const issue = await createIssue({ title, description, priority, stateId: STATES.todo });
    created.push({ duplication: sd, linear: issue });
    logInfo(`[sonar-dup-sync] Created ${issue.identifier}: ${title}`);
  }

  const resolved = resolveStale
    ? await resolveStaleLinearIssues(keyToLinear, currentKeys, "sonar-dup-sync", "Duplication")
    : [];

  return { created, skipped, promoted, requeued, resolved };
}
