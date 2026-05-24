import { $ } from "./dom-query.js";
import { fmt } from "./fmt.js";
import { fmtNum } from "./fmt-num.js";
import { renderBanner } from "./render-banner.js";
import { renderProvidersChip } from "./render-providers-chip.js";
import { renderWorktreesChip } from "./render-worktrees-chip.js";

export function renderStats(d) {
  const h = d.health || {}; const s = h.summary || {};
  const sym = d.symphony || {}; const bridge = d.bridge || {};
  $("#totalServices").textContent = s.total ?? "—";
  $("#healthyCount").textContent = s.healthy ?? "—";
  $("#degradedCount").textContent = s.degraded ?? "—";
  $("#downCount").textContent = s.down ?? "—";
  $("#totalCalls").textContent = fmtNum(bridge.totalCalls);
  const wts = sym.worktreeStats || {};
  $("#wtExecuting").textContent = wts.executing ?? "—";
  const iss = sym.issueStats || {};
  $("#issuesActive").textContent = iss.active ?? "—";
  $("#issuesEligible").textContent = d.linearTodoCount ?? "—";
  document.title = `ANQR · ${h.allClear ? "✅" : "⚠️"} ${s.healthy}/${s.total}`;
  renderBanner(h);
  renderProvidersChip(d.models);
  renderWorktreesChip(wts);
  $("#updateTime").textContent = fmt(h.timestamp || new Date().toISOString());
  $("#footerTimestamp").textContent = `Updated ${new Date().toLocaleString()}`;
}
