import { $ } from "./dom-query.js";
import { searchQ, commitTypeFilter } from "./state.js";
import { esc } from "./format.js";

export function renderCommits(commits) {
  const el = $("#commitsList"); if (!commits?.length) { el.innerHTML = '<div class="empty-state">No commits</div>'; return; }
  const q = searchQ.toLowerCase();
  el.innerHTML = commits.map(c => {
    const t = c.type || "other";
    const hide = (commitTypeFilter !== "all" && t !== commitTypeFilter) || (q && !c.subject?.toLowerCase().includes(q) && !c.hash?.includes(q)) ? " hidden" : "";
    return `<div class="commit-row${hide}">
      <span class="commit-type ${t}">${t}</span>
      <code class="commit-hash">${esc(c.hash)}</code>
      <span class="commit-subject">${esc(c.subject || "")}</span>
      <span class="commit-meta">${esc(c.relative || "")}</span>
    </div>`;
  }).join("");
}
