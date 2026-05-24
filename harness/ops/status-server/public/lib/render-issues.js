import { $ } from "./dom-query.js";
import { searchQ } from "./state.js";
import { esc } from "./format.js";

export function renderIssues(issues) {
  const el = $("#issuesList"); const countEl = $("#issuesCountChip");
  if (!issues?.length) { el.innerHTML = '<div class="empty-state">No running issues</div>'; countEl.textContent = "0 active"; return; }
  countEl.textContent = `${issues.length} active`;
  const q = searchQ.toLowerCase();
  el.innerHTML = issues.map(i => {
    const hide = q && !i.title?.toLowerCase().includes(q) && !i.identifier?.toLowerCase().includes(q) ? " hidden" : "";
    const pClass = i.priority <= 1 ? "p1" : i.priority === 2 ? "p2" : i.priority === 3 ? "p3" : "p4";
    const url = i.url || `https://linear.app/anqr/issue/${i.identifier}`;
    return `<div class="issue-row${hide}">
      <div class="issue-left">
        <a class="issue-id" href="${esc(url)}" target="_blank" rel="noopener">${esc(i.identifier)}</a>
        <span class="issue-title">${esc(i.title || "")}</span>
      </div>
      <div class="issue-right">
        <span class="priority-dot ${pClass}" title="Priority ${i.priority}"></span>
        <span class="issue-assignee">${esc(i.assignee?.name || "unassigned")}</span>
      </div>
    </div>`;
  }).join("");
}
