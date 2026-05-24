/* ── ANQR Status Dashboard v4 ── */
import { $ } from "./lib/dom-query.js";
import { $$ } from "./lib/dom-query-all.js";
import { live, setLive, searchQ, setSearchQ, activeTab, setActiveTab, serviceFilter, setServiceFilter, commitTypeFilter, setCommitTypeFilter, allData } from "./lib/state.js";
import { esc } from "./lib/format.js";
import { fetchAll } from "./lib/fetch-all.js";
import { renderAll } from "./lib/render-all.js";
import { renderServices } from "./lib/render-services.js";
import { renderCommits } from "./lib/render-commits.js";
import { renderIssues } from "./lib/render-issues.js";
import { renderModels } from "./lib/render-models.js";

// Expose esc + searchQ for bookmarks.js (loaded as separate script).
window.escForBookmarks = esc;

window.toggleDetail = (btn) => {
  const d = btn.closest(".service-card").nextElementSibling;
  const open = d.classList.toggle("open");
  btn.textContent = open ? "▾" : "▸";
};

// ── Refresh ───────────────────────────────────────────────────────────────────
async function refresh() {
  const btn = $("#refreshBtn"); btn.classList.add("spinning");
  try { renderAll(await fetchAll()); }
  catch (e) { console.error("Fetch error:", e); }
  finally { setTimeout(() => btn.classList.remove("spinning"), 600); }
}

let timer = setInterval(refresh, 30000);
$("#refreshBtn").addEventListener("click", refresh);
$("#liveToggle").addEventListener("click", () => {
  setLive(!live);
  $("#liveToggle").textContent = live ? "⏸" : "▶";
  if (live) { refresh(); timer = setInterval(refresh, 30000); }
  else clearInterval(timer);
});

// ── Tabs ───────────────────────────────────────────────────────────────────────
$$(".tab").forEach(t => t.addEventListener("click", () => {
  $$(".tab").forEach(x => x.classList.remove("active"));
  $$(".tab-panel").forEach(x => x.classList.remove("active"));
  t.classList.add("active");
  setActiveTab(t.dataset.tab);
  $(`#tab-${activeTab}`)?.classList.add("active");
}));

// ── Filters ───────────────────────────────────────────────────────────────────
$$(".filter-pills .filter-btn[data-filter]").forEach(b => b.addEventListener("click", () => {
  b.closest(".filter-pills").querySelectorAll(".filter-btn").forEach(x => x.classList.remove("active"));
  b.classList.add("active");
  setServiceFilter(b.dataset.filter);
  renderServices(allData.health?.services);
}));

$$(".filter-pills .filter-btn[data-type]").forEach(b => b.addEventListener("click", () => {
  b.closest(".filter-pills").querySelectorAll(".filter-btn").forEach(x => x.classList.remove("active"));
  b.classList.add("active");
  setCommitTypeFilter(b.dataset.type);
  renderCommits(allData.commits);
}));

// ── Search ────────────────────────────────────────────────────────────────────
let searchTimer;
$("#globalSearch").addEventListener("input", e => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    setSearchQ(e.target.value.trim());
    window.searchQ = searchQ;
    renderServices(allData.health?.services);
    renderCommits(allData.commits);
    renderIssues(allData.issues);
    renderModels(allData.models);
    if (typeof window.renderBookmarks === "function") window.renderBookmarks();
  }, 150);
});

// ── Init ──────────────────────────────────────────────────────────────────────
refresh();
