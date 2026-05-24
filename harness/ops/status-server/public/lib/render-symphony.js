import { $ } from "./dom-query.js";
import { esc } from "./format.js";

export function renderSymphony(sym) {
  const el = $("#symphonyGrid");
  if (!sym) { el.innerHTML = '<div class="loading no-spin">Pipeline data unavailable</div>'; return; }
  const wts = (sym.worktrees || []).filter(w => w.id.startsWith("wt") && parseInt(w.id.replace("wt","")) <= 8);
  const wStats = wts.length;
  const iss = sym.issueStats || {};
  
  el.innerHTML = `
    <div class="sym-panel">
      <h3>Worktrees</h3>
      <div class="wt-grid">${wts.map(w => `<div class="wt-cell ${w.state}">
        <div class="wt-id">${w.id}</div>
        <div class="wt-state">${w.state}</div>
        ${w.assignedIssue ? `<div class="wt-issue">${esc(w.assignedIssue)}</div>` : ""}
      </div>`).join("")}</div>
    </div>
    <div class="sym-panel">
      <h3>Issue Queue</h3>
      <div class="issue-stat-row"><span class="issue-stat-label">Active (leased)</span><span class="issue-stat-val" style="color:var(--green)">${iss.active ?? "—"}</span></div>
      <div class="issue-stat-row"><span class="issue-stat-label">On cooldown</span><span class="issue-stat-val" style="color:var(--yellow)">${iss.cooldown ?? "—"}</span></div>
      <div class="issue-stat-row"><span class="issue-stat-label">Exhausted retries</span><span class="issue-stat-val" style="color:var(--red)">${iss.exhausted ?? "—"}</span></div>
      <div class="issue-stat-row" style="margin-top:8px;border-top:1px solid var(--border);padding-top:8px">
        <span class="issue-stat-label" title="All historical records including resolved issues">State records total</span>
        <span class="issue-stat-val" style="color:var(--text-muted)">${iss.total ?? "—"}</span>
      </div>
    </div>`;
}
