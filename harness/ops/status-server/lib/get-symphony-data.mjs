import { SYMPHONY_STATE_PATH } from "./constants.mjs";
import { loadJson } from "./load-json.mjs";

export function getSymphonyData() {
  const state = loadJson(SYMPHONY_STATE_PATH);
  if (!state) return null;
  const wts = state.worktreeStates || {};
  const issues = state.issues || {};
  const now = Date.now();
  const worktrees = Object.values(wts).map(wt => ({
    id: wt.worktreeId, state: wt.state, assignedIssue: wt.assignedIssue,
    reason: wt.reason, repairAttempts: wt.repairAttempts || 0, updatedAt: wt.updatedAt,
  }));
  const issueStats = { total: 0, active: 0, cooldown: 0, exhausted: 0, eligible: 0 };
  for (const v of Object.values(issues)) {
    if (typeof v !== "object" || !v) continue;
    issueStats.total++;
    if (v.lease) issueStats.active++;
    else if (v.retry_exhausted || v.blocked_reason) issueStats.exhausted++;
    else if (v.cooldown_until && new Date(v.cooldown_until).getTime() > now) issueStats.cooldown++;
    else issueStats.eligible++;
  }
  const wStats = {
    executing: worktrees.filter(w => w.state === "executing").length,
    available: worktrees.filter(w => w.state === "available").length,
    quarantined: worktrees.filter(w => w.state === "quarantined").length,
    total: worktrees.length,
  };
  return { worktrees, issueStats, worktreeStats: wStats };
}
