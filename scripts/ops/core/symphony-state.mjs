#!/usr/bin/env node

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// PROJECT_ROOT is kept for reference but state dir is now shared across worktrees
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _PROJECT_ROOT = path.resolve(__dirname, "../..");

function getStateDir() {
  // CRITICAL: Use a shared central state directory for ALL worktrees.
  // Each worktree maintaining its own state.json causes lease race conditions
  // where multiple runners can pick up the same issue because they can't see
  // each other's leases.
  // Default to user-local state directory which is shared across all worktrees.
  if (process.env.ANQR_SYMPHONY_STATE_DIR) {
    return process.env.ANQR_SYMPHONY_STATE_DIR;
  }
  // Use XDG_RUNTIME_DIR or fallback to /tmp for shared state
  const runtimeDir = process.env.XDG_RUNTIME_DIR || "/tmp";
  return path.join(runtimeDir, "anqr-symphony-state");
}

function getStateFile() {
  return path.join(getStateDir(), "state.json");
}

function getLockFile() {
  return `${getStateFile()}.lock`;
}
const DEFAULT_LEASE_MS = Number(process.env.ANQR_SYMPHONY_LEASE_MS || 20 * 60 * 1000);
const HISTORY_LIMIT = Number(process.env.ANQR_SYMPHONY_HISTORY_LIMIT || 50);
const HOST_ID = process.env.ANQR_SYMPHONY_HOST_ID || os.hostname();
const LOCK_RETRY_INTERVAL_MS = 50;
const LOCK_MAX_RETRIES = 100; // 5 seconds max wait
const LOCK_STALE_MS = 60_000; // 1 minute — consider lock stale if holder is dead

function ensureDir() {
  const stateDir = getStateDir();
  if (!fs.existsSync(stateDir)) fs.mkdirSync(stateDir, { recursive: true });
}

function isLockProcessAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function acquireStateLock() {
  ensureDir();
  const lockFile = getLockFile();
  for (let attempt = 0; attempt < LOCK_MAX_RETRIES; attempt++) {
    try {
      const fd = fs.openSync(
        lockFile,
        fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL,
        0o644,
      );
      fs.writeSync(fd, String(process.pid));
      fs.closeSync(fd);
      return true;
    } catch (err) {
      if (err.code !== "EEXIST") throw err;
      try {
        const lockPid = Number(fs.readFileSync(lockFile, "utf-8").trim());
        if (lockPid && !isLockProcessAlive(lockPid)) {
          try {
            fs.unlinkSync(lockFile);
          } catch {
            /* race ok */
          }
          continue;
        }
        const lockAge = Date.now() - fs.statSync(lockFile).mtimeMs;
        if (lockAge > LOCK_STALE_MS) {
          try {
            fs.unlinkSync(lockFile);
          } catch {
            /* race ok */
          }
          continue;
        }
      } catch {
        continue;
      }
      const end = Date.now() + LOCK_RETRY_INTERVAL_MS + Math.random() * LOCK_RETRY_INTERVAL_MS;
      while (Date.now() < end) {
        /* brief busy-wait */
      }
    }
  }
  return false;
}

function releaseStateLock() {
  try {
    const lockFile = getLockFile();
    const lockPid = Number(fs.readFileSync(lockFile, "utf-8").trim());
    if (lockPid === process.pid) fs.unlinkSync(lockFile);
  } catch {
    /* best effort */
  }
}

function withStateLock(fn) {
  if (!acquireStateLock()) {
    throw new Error("Failed to acquire state lock after maximum retries");
  }
  try {
    return fn();
  } finally {
    releaseStateLock();
  }
}

function emptyStore() {
  return {
    version: 2,
    updatedAt: new Date().toISOString(),
    hostId: HOST_ID,
    issues: {},
    global: {
      integrationQueue: [],
      integrationLock: null,
    },
  };
}

function pruneHistory(history = []) {
  return history.slice(-HISTORY_LIMIT);
}

function normalizeRecord(record = {}) {
  return {
    issueIdentifier: record.issueIdentifier || null,
    source: record.source || null,
    human_only: Boolean(record.human_only),
    retry_count: Number(record.retry_count || 0),
    retry_exhausted: Boolean(record.retry_exhausted),
    cooldown_until: record.cooldown_until || null,
    blocked_reason: record.blocked_reason || null,
    last_failure_reason: record.last_failure_reason || null,
    last_failure_signature: record.last_failure_signature || null,
    last_run_id: record.last_run_id || null,
    last_attempt_at: record.last_attempt_at || null,
    external_keys: Array.isArray(record.external_keys) ? record.external_keys : [],
    lease: record.lease && typeof record.lease === "object" ? record.lease : null,
    transitions: pruneHistory(Array.isArray(record.transitions) ? record.transitions : []),
    notes: record.notes || {},
    latency_ms: Number(record.latency_ms) || null,
    completed_at: record.completed_at || null,
    finalization:
      record.finalization && typeof record.finalization === "object"
        ? {
            state: record.finalization.state || null,
            worktreeId: record.finalization.worktreeId || null,
            stickyOwner: record.finalization.stickyOwner || null,
            branch: record.finalization.branch || null,
            baseMainSha: record.finalization.baseMainSha || null,
            headSha: record.finalization.headSha || null,
            integratedMainSha: record.finalization.integratedMainSha || null,
            attempts: Number(record.finalization.attempts || 0),
            lastError: record.finalization.lastError || null,
            updatedAt: record.finalization.updatedAt || null,
          }
        : null,
  };
}

export function loadState() {
  try {
    const stateFile = getStateFile();
    const data = JSON.parse(fs.readFileSync(stateFile, "utf-8"));
    const store = emptyStore();
    store.version = data.version || 1;
    store.updatedAt = data.updatedAt || store.updatedAt;
    store.hostId = data.hostId || HOST_ID;
    store.global = {
      integrationQueue: [],
      integrationLock: null,
      ...(data.global || {}),
    };
    store.issues = {};
    for (const [key, value] of Object.entries(data.issues || {})) {
      store.issues[key] = normalizeRecord({ ...value, issueIdentifier: key });
    }
    return store;
  } catch {
    return emptyStore();
  }
}

export function saveState(store) {
  ensureDir();
  const stateFile = getStateFile();
  store.updatedAt = new Date().toISOString();
  // Atomic write: temp file + rename prevents partial/corrupt state on crash or concurrent access
  const tmpFile = `${stateFile}.tmp.${process.pid}`;
  fs.writeFileSync(tmpFile, JSON.stringify(store, null, 2) + "\n");
  fs.renameSync(tmpFile, stateFile);
}

export function mutateState(mutator) {
  return withStateLock(() => {
    const store = loadState();
    const result = mutator(store) || store;
    saveState(result);
    return result;
  });
}

export function getIssueState(issueIdentifier) {
  const store = loadState();
  return normalizeRecord(store.issues[issueIdentifier] || { issueIdentifier });
}

export function patchIssueState(issueIdentifier, patch = {}) {
  return withStateLock(() => {
    const store = loadState();
    const current = normalizeRecord(store.issues[issueIdentifier] || { issueIdentifier });
    const next = normalizeRecord({ ...current, ...patch, issueIdentifier });
    store.issues[issueIdentifier] = next;
    saveState(store);
    return next;
  });
}

export function addExternalKey(issueIdentifier, key) {
  if (!key) return getIssueState(issueIdentifier);
  return patchIssueState(issueIdentifier, {
    external_keys: [...new Set([...getIssueState(issueIdentifier).external_keys, key])],
  });
}

export function setGlobalValue(key, value) {
  return mutateState((store) => {
    store.global[key] = value;
    return store;
  });
}

export function getGlobalValue(key, fallback = null) {
  const store = loadState();
  return Object.hasOwn(store.global || {}, key) ? store.global[key] : fallback;
}

export function nowIso() {
  return new Date().toISOString();
}

export function leaseIsActive(record, now = Date.now()) {
  const lease = record?.lease;
  if (!lease?.expires_at) return false;
  return new Date(lease.expires_at).getTime() > now;
}

export function canExecuteIssue(issue, now = Date.now()) {
  const record = getIssueState(issue.identifier);
  if (record.human_only) return false;
  if (record.retry_exhausted) return false;
  if (record.blocked_reason) return false;
  if (record.cooldown_until && new Date(record.cooldown_until).getTime() > now) return false;
  if (leaseIsActive(record, now)) return false;
  if (issue.title?.includes("[HUMAN]")) return false;
  return true;
}

export function canFeedIssue(issue, now = Date.now()) {
  const record = getIssueState(issue.identifier);
  if (!canExecuteIssue(issue, now)) return false;
  if ((record.source || "").startsWith("email")) return false;
  return true;
}

export function markIssueHumanOnly(issueIdentifier, extra = {}) {
  return patchIssueState(issueIdentifier, {
    human_only: true,
    blocked_reason: extra.blocked_reason || null,
    source: extra.source || getIssueState(issueIdentifier).source || "human",
  });
}

export function recordTransition(issueIdentifier, transition) {
  const current = getIssueState(issueIdentifier);
  const nextTransitions = pruneHistory([
    ...current.transitions,
    { at: nowIso(), host: HOST_ID, ...transition },
  ]);
  return patchIssueState(issueIdentifier, { transitions: nextTransitions });
}

/**
 * Calculate exponential backoff with jitter for retry cooldowns
 * @param {number} retryCount - Current retry attempt (0-indexed)
 * @param {number} baseMs - Base cooldown in milliseconds (default: 10 minutes)
 * @param {number} maxMs - Maximum cooldown in milliseconds (default: 60 minutes)
 * @returns {number} Cooldown duration in milliseconds
 */
export function calculateExponentialBackoff(retryCount, baseMs = 10 * 60 * 1000, maxMs = 60 * 60 * 1000) {
  // Exponential: base * 2^retryCount, capped at maxMs
  const exponential = Math.min(baseMs * Math.pow(2, retryCount), maxMs);
  // Add random jitter (±20%) to prevent thundering herd
  const jitter = exponential * (0.8 + Math.random() * 0.4);
  return Math.floor(jitter);
}

export function setCooldown(issueIdentifier, ms, reason = "cooldown", signature = null) {
  const patch = {
    cooldown_until: new Date(Date.now() + ms).toISOString(),
    last_failure_reason: reason,
  };
  if (signature !== null) patch.last_failure_signature = signature;
  return patchIssueState(issueIdentifier, patch);
}

/**
 * Set cooldown with exponential backoff based on retry count
 * @param {string} issueIdentifier - Issue identifier
 * @param {string} reason - Failure reason
 * @param {string|null} signature - Failure signature for deduplication
 */
export function setCooldownWithBackoff(issueIdentifier, reason = "cooldown", signature = null) {
  const current = getIssueState(issueIdentifier);
  const retryCount = Number(current.retry_count || 0);
  const cooldownMs = calculateExponentialBackoff(retryCount);
  
  const patch = {
    cooldown_until: new Date(Date.now() + cooldownMs).toISOString(),
    last_failure_reason: reason,
  };
  if (signature !== null) patch.last_failure_signature = signature;
  
  return patchIssueState(issueIdentifier, patch);
}

export function clearCooldown(issueIdentifier) {
  return patchIssueState(issueIdentifier, { cooldown_until: null });
}

export function noteAttemptStart(issueIdentifier, details = {}) {
  const current = getIssueState(issueIdentifier);
  return patchIssueState(issueIdentifier, {
    retry_count: Number(current.retry_count || 0) + 1,
    retry_exhausted: false,
    blocked_reason: null,
    last_run_id: details.runId || current.last_run_id || null,
    last_attempt_at: nowIso(),
    source: details.source || current.source || null,
    last_failure_reason: null,
    last_failure_signature: null,
  });
}

export function markRetryExhausted(issueIdentifier, details = {}) {
  return patchIssueState(issueIdentifier, {
    retry_exhausted: true,
    blocked_reason: details.reason || "retry_exhausted",
    last_failure_reason: details.reason || "retry_exhausted",
    last_failure_signature: details.signature || null,
    cooldown_until: null,
    lease: null,
  });
}

export function resetRetryState(issueIdentifier, details = {}) {
  return patchIssueState(issueIdentifier, {
    retry_count: Number(details.retry_count ?? 0),
    retry_exhausted: false,
    blocked_reason: null,
    cooldown_until: null,
    lease: null,
    last_failure_reason: null,
    last_failure_signature: null,
  });
}

export function acquireLease(issueIdentifier, details = {}) {
  return withStateLock(() => {
    const store = loadState();
    const current = normalizeRecord(store.issues[issueIdentifier] || { issueIdentifier });
    const now = Date.now();
    if (leaseIsActive(current, now)) {
      return { ok: false, lease: current.lease, reason: "lease_active" };
    }
    const ttlMs = Number(details.ttlMs || DEFAULT_LEASE_MS);
    const lease = {
      owner: details.owner || HOST_ID,
      nonce: details.nonce || `${HOST_ID}-${now}`,
      run_id: details.runId || null,
      acquired_at: new Date(now).toISOString(),
      heartbeat_at: new Date(now).toISOString(),
      expires_at: new Date(now + ttlMs).toISOString(),
    };
    current.lease = lease;
    current.last_run_id = details.runId || current.last_run_id || null;
    store.issues[issueIdentifier] = current;
    saveState(store);
    return { ok: true, lease };
  });
}

export function heartbeatLease(issueIdentifier, nonce, ttlMs = DEFAULT_LEASE_MS) {
  return withStateLock(() => {
    const store = loadState();
    const current = normalizeRecord(store.issues[issueIdentifier] || { issueIdentifier });
    if (!current.lease || current.lease.nonce !== nonce)
      return { ok: false, reason: "lease_mismatch" };
    const now = Date.now();
    current.lease = {
      ...current.lease,
      heartbeat_at: new Date(now).toISOString(),
      expires_at: new Date(now + ttlMs).toISOString(),
    };
    store.issues[issueIdentifier] = current;
    saveState(store);
    return { ok: true, lease: current.lease };
  });
}

export function releaseLease(issueIdentifier, nonce = null) {
  return withStateLock(() => {
    const store = loadState();
    const current = normalizeRecord(store.issues[issueIdentifier] || { issueIdentifier });
    if (!current.lease) return { ok: true, released: false };
    if (nonce && current.lease.nonce !== nonce) return { ok: false, reason: "lease_mismatch" };
    current.lease = null;
    store.issues[issueIdentifier] = current;
    saveState(store);
    return { ok: true, released: true };
  });
}

export function findExpiredLeases(now = Date.now()) {
  const store = loadState();
  return Object.entries(store.issues)
    .filter(
      ([, record]) =>
        record.lease?.expires_at && new Date(record.lease.expires_at).getTime() <= now,
    )
    .map(([issueIdentifier, record]) => ({ issueIdentifier, record: normalizeRecord(record) }));
}

export function recordCompletion(issueIdentifier, details = {}) {
  return patchIssueState(issueIdentifier, {
    completed_at: details.completedAt || new Date().toISOString(),
    latency_ms: Number(details.latencyMs) || null,
  });
}

/**
 * Record retry/failover event for evidence logging
 * @param {string} issueIdentifier - Issue identifier
 * @param {object} event - Event details (type, provider, reason, etc.)
 */
export function recordRetryEvent(issueIdentifier, event = {}) {
  const current = getIssueState(issueIdentifier);
  const retryEvents = Array.isArray(current.notes?.retry_events) 
    ? current.notes.retry_events 
    : [];
  
  const newEvent = {
    timestamp: nowIso(),
    type: event.type || "retry",
    retry_count: Number(current.retry_count || 0),
    provider: event.provider || null,
    reason: event.reason || null,
    cooldown_ms: event.cooldown_ms || null,
    ...event,
  };
  
  // Keep last 20 retry events
  const updatedEvents = [...retryEvents, newEvent].slice(-20);
  
  return patchIssueState(issueIdentifier, {
    notes: {
      ...current.notes,
      retry_events: updatedEvents,
    },
  });
}

export function getLatencyMetrics() {
  const store = loadState();
  const completedIssues = Object.values(store.issues).filter(
    (record) => record.completed_at && record.latency_ms,
  );

  if (completedIssues.length === 0) {
    return {
      count: 0,
      averageMs: null,
      medianMs: null,
      p95Ms: null,
      minMs: null,
      maxMs: null,
    };
  }

  const latencies = completedIssues.map((r) => r.latency_ms).sort((a, b) => a - b);
  const sum = latencies.reduce((acc, val) => acc + val, 0);
  const average = sum / latencies.length;
  const median = latencies[Math.floor(latencies.length / 2)];
  const p95Index = Math.ceil(latencies.length * 0.95) - 1;
  const p95 = latencies[p95Index] || latencies[latencies.length - 1];

  return {
    count: completedIssues.length,
    averageMs: Math.round(average),
    medianMs: median,
    p95Ms: p95,
    minMs: latencies[0],
    maxMs: latencies[latencies.length - 1],
  };
}

// ── Finalization state helpers ────────────────────────────────────────────────

const REPAIRABLE_FINALIZATION_STATES = new Set([
  "commit_failed_repairable",
  "branch_push_failed_repairable",
  "integration_failed_repairable",
]);

export function setFinalizationState(issueIdentifier, patch = {}) {
  return withStateLock(() => {
    const store = loadState();
    const current = normalizeRecord(store.issues[issueIdentifier] || { issueIdentifier });
    const existing = current.finalization || {};
    current.finalization = normalizeRecord({
      ...current,
      finalization: {
        ...existing,
        ...patch,
        updatedAt: patch.updatedAt || new Date().toISOString(),
      },
    }).finalization;
    store.issues[issueIdentifier] = current;
    saveState(store);
    return current.finalization;
  });
}

export function getFinalizationState(issueIdentifier) {
  const record = getIssueState(issueIdentifier);
  return record.finalization || null;
}

// ── Integration queue helpers ────────────────────────────────────────────────

export function enqueueIntegrationCandidate(issueIdentifier) {
  return withStateLock(() => {
    const store = loadState();
    if (!Array.isArray(store.global.integrationQueue)) store.global.integrationQueue = [];
    if (!store.global.integrationQueue.includes(issueIdentifier)) {
      store.global.integrationQueue.push(issueIdentifier);
    }
    saveState(store);
    return store.global.integrationQueue;
  });
}

export function dequeueIntegrationCandidate(issueIdentifier) {
  return withStateLock(() => {
    const store = loadState();
    if (!Array.isArray(store.global.integrationQueue)) store.global.integrationQueue = [];
    store.global.integrationQueue = store.global.integrationQueue.filter(id => id !== issueIdentifier);
    saveState(store);
    return store.global.integrationQueue;
  });
}

export function listIntegrationCandidates() {
  const store = loadState();
  return Array.isArray(store.global.integrationQueue) ? store.global.integrationQueue : [];
}

export function acquireIntegrationLock(holder, ttlMs = 10 * 60 * 1000) {
  return withStateLock(() => {
    const store = loadState();
    const lock = store.global.integrationLock;
    if (lock && new Date(lock.expiresAt).getTime() > Date.now()) {
      return { ok: false, holder: lock.holder, expiresAt: lock.expiresAt };
    }
    store.global.integrationLock = {
      holder,
      acquiredAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + ttlMs).toISOString(),
    };
    saveState(store);
    return { ok: true, holder, expiresAt: store.global.integrationLock.expiresAt };
  });
}

export function releaseIntegrationLock(holder) {
  return withStateLock(() => {
    const store = loadState();
    const lock = store.global.integrationLock;
    if (!lock || lock.holder !== holder) return { ok: false, reason: "lock_mismatch" };
    store.global.integrationLock = null;
    saveState(store);
    return { ok: true };
  });
}

// ── Repair candidate helpers ────────────────────────────────────────────────

export function getNextRepairableIssueForWorktree(worktreeId) {
  const store = loadState();
  for (const [identifier, record] of Object.entries(store.issues)) {
    const normalized = normalizeRecord(record);
    if (
      normalized.finalization &&
      REPAIRABLE_FINALIZATION_STATES.has(normalized.finalization.state) &&
      normalized.finalization.stickyOwner === worktreeId
    ) {
      return { issueIdentifier: identifier, finalization: normalized.finalization };
    }
  }
  return null;
}

export function listRepairableIssuesForWorktree(worktreeId) {
  const store = loadState();
  const results = [];
  for (const [identifier, record] of Object.entries(store.issues)) {
    const normalized = normalizeRecord(record);
    if (
      normalized.finalization &&
      REPAIRABLE_FINALIZATION_STATES.has(normalized.finalization.state) &&
      normalized.finalization.stickyOwner === worktreeId
    ) {
      results.push({ issueIdentifier: identifier, finalization: normalized.finalization });
    }
  }
  return results;
}

export function checkLatencyBaseline(currentAverageMs) {
  const baseline = getGlobalValue("latency.baseline_ms");
  if (!baseline) {
    setGlobalValue("latency.baseline_ms", currentAverageMs);
    setGlobalValue("latency.baseline_set_at", new Date().toISOString());
    return { alert: false, increase: 0, baseline: currentAverageMs };
  }

  const increase = ((currentAverageMs - baseline) / baseline) * 100;
  const alert = increase > 50; // Alert on >50% increase

  return {
    alert,
    increase: Math.round(increase),
    baseline,
    current: currentAverageMs,
  };
}
