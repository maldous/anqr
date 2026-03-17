#!/usr/bin/env node
/* eslint-disable no-console */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "../..");
const STATE_DIR = path.join(PROJECT_ROOT, "reports", "symphony");
const STATE_FILE = path.join(STATE_DIR, "state.json");
const DEFAULT_LEASE_MS = Number(process.env.ANQR_SYMPHONY_LEASE_MS || 20 * 60 * 1000);
const HISTORY_LIMIT = Number(process.env.ANQR_SYMPHONY_HISTORY_LIMIT || 50);
const HOST_ID = process.env.ANQR_SYMPHONY_HOST_ID || os.hostname();

function ensureDir() {
  if (!fs.existsSync(STATE_DIR)) fs.mkdirSync(STATE_DIR, { recursive: true });
}

function emptyStore() {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    hostId: HOST_ID,
    issues: {},
    global: {},
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
  };
}

export function loadState() {
  try {
    const data = JSON.parse(fs.readFileSync(STATE_FILE, "utf-8"));
    const store = emptyStore();
    store.version = data.version || 1;
    store.updatedAt = data.updatedAt || store.updatedAt;
    store.hostId = data.hostId || HOST_ID;
    store.global = data.global || {};
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
  store.updatedAt = new Date().toISOString();
  fs.writeFileSync(STATE_FILE, JSON.stringify(store, null, 2) + "\n");
}

export function mutateState(mutator) {
  const store = loadState();
  const result = mutator(store) || store;
  saveState(result);
  return result;
}

export function getIssueState(issueIdentifier) {
  const store = loadState();
  return normalizeRecord(store.issues[issueIdentifier] || { issueIdentifier });
}

export function patchIssueState(issueIdentifier, patch = {}) {
  const store = loadState();
  const current = normalizeRecord(store.issues[issueIdentifier] || { issueIdentifier });
  const next = normalizeRecord({ ...current, ...patch, issueIdentifier });
  store.issues[issueIdentifier] = next;
  saveState(store);
  return next;
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

export function setCooldown(issueIdentifier, ms, reason = "cooldown") {
  return patchIssueState(issueIdentifier, {
    cooldown_until: new Date(Date.now() + ms).toISOString(),
    last_failure_reason: reason,
  });
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
}

export function heartbeatLease(issueIdentifier, nonce, ttlMs = DEFAULT_LEASE_MS) {
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
}

export function releaseLease(issueIdentifier, nonce = null) {
  const store = loadState();
  const current = normalizeRecord(store.issues[issueIdentifier] || { issueIdentifier });
  if (!current.lease) return { ok: true, released: false };
  if (nonce && current.lease.nonce !== nonce) return { ok: false, reason: "lease_mismatch" };
  current.lease = null;
  store.issues[issueIdentifier] = current;
  saveState(store);
  return { ok: true, released: true };
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
