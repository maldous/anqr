import { $ } from "./dom-query.js";
import { searchQ } from "./state.js";
import { esc } from "./format.js";

export function renderIssues(issues) {
  const el = $("#issuesList"); const countEl = $("#issuesCountChip");
  if (!issues?.length) { el.innerHTML = '<div class="empty-state">No running issues</div>'; countEl.textContent = "0 active"; return; }
  countEl.textContent = `${issues.length} active`;
  const q = searchQ.toLowerCase();
  for (const i of issues) {
    let pClass;
    if (i.priority <= 1) {
      pClass = "p1";
    } else if (i.priority === 2) {
      pClass = "p2";
    } else if (i.priority === 3) {
      pClass = "p3";
    } else {
      pClass = "p4";
    }
    i.pClass = pClass; // attaching to the object for use below
  }
  el.innerHTML = issues.map(i => {
    const hide = q && !i.title?.toLowerCase().includes(q) && !i.identifier?.toLowerCase().includes(q) ? " hidden" : "";
    const url = i.url || `https://linear.app/anqr/issue/${i.identifier}`;
    return `<div class="issue-row${hide}">
      <div class="issue-left">
        <a class="issue-id" href="${esc(url)}" target="_blank" rel="noopener">${esc(i.identifier)}</a>
        <span class="issue-title">${esc(i.title || "")}</span>
      </div>
      <div class="issue-right">
        <span class="priority-dot ${i.pClass}" title="Priority ${i.priority}"></span>
        <span class="issue-assignee">${esc(i.assignee?.name || "unassigned")}</span>
      </div>
    </div>`;
  }).join("");
}
