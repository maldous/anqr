/* ── ANQR Status Dashboard ────────────────────────────────────────────── */

import { API_BASE, REFRESH_INTERVAL, INFRA_REFRESH_INTERVAL, currentFilter } from "./constants.mjs";
import { $, $$, els } from "./dom-refs.mjs";
import { updateBanner } from "./banner.mjs";
import { updateStats } from "./stats.mjs";
import { createServiceCard, renderServices } from "./service-cards.mjs";
import { updateDashboard } from "./dashboard.mjs";
import { fetchAndRenderCommits, renderCommits } from "./commits.mjs";
import { fetchAndRenderIssues, renderIssues } from "./linear-issues.mjs";

// ── Fetch Health ────────────────────────────────────────────────────────────

async function fetchHealth() {
  const res = await fetch(`${API_BASE}/api/health`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ── Filters ─────────────────────────────────────────────────────────────────

for (const btn of $$(".filter-btn")) {
  btn.addEventListener("click", () => {
    for (const b of $$(".filter-btn")) {
      b.classList.remove("active");
    }
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    // Re-render with filter
    fetchHealth().then((data) => {
      renderServices(data);
    }).catch(() => {});
  });
}

// ── Init ────────────────────────────────────────────────────────────────────

els.refreshBtn.addEventListener("click", updateDashboard);
updateDashboard();
setInterval(updateDashboard, REFRESH_INTERVAL);

// Refresh commits and issues on their own 60s cycle
fetchAndRenderCommits();
fetchAndRenderIssues();
setInterval(fetchAndRenderCommits, INFRA_REFRESH_INTERVAL);
setInterval(fetchAndRenderIssues, INFRA_REFRESH_INTERVAL);
