/* ── ANQR Status Dashboard ────────────────────────────────────────────── */

const API_BASE = "";
const REFRESH_INTERVAL = 30000;
const INFRA_REFRESH_INTERVAL = 60000;
let currentFilter = "all";

// ── DOM Refs ───────────────────────────────────────────────────────────────

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const els = {
  total:     $("#totalServices"),
  healthy:   $("#healthyCount"),
  degraded:  $("#degradedCount"),
  down:      $("#downCount"),
  banner:    $("#banner"),
  bannerInner: $("#banner .banner-inner"),
  bannerText:  $("#banner .banner-text"),
  bannerIcon:  $("#banner .banner-icon"),
  servicesList: $("#servicesList"),
  updateTime:   $("#updateTime"),
  footerStamp:  $("#footerTimestamp"),
  refreshBtn:   $("#refreshBtn"),
  commitsList:  $("#commitsList"),
  commitsCount: $("#commitsCount"),
  issuesList:   $("#issuesList"),
  issuesCount:  $("#issuesCount"),
};

// ── Fetch Health ────────────────────────────────────────────────────────────

async function fetchHealth() {
  const res = await fetch(`${API_BASE}/api/health`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ── Formatting ──────────────────────────────────────────────────────────────

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

// ── Banner ──────────────────────────────────────────────────────────────────

function updateBanner(data) {
  if (data.allClear) {
    els.banner.className = "banner ok";
    els.bannerIcon.textContent = "✅";
    els.bannerText.textContent = "All systems operational";
  } else if (data.criticalDown.length > 0) {
    els.banner.className = "banner error";
    els.bannerIcon.textContent = "🚨";
    const names = data.criticalDown.join(", ");
    els.bannerText.textContent = `${data.criticalDown.length} critical service(s) down: ${names}`;
  } else if (data.summary.down > 0 || data.summary.degraded > 0) {
    els.banner.className = "banner warn";
    els.bannerIcon.textContent = "⚠️";
    els.bannerText.textContent = `${data.summary.degraded} degraded, ${data.summary.down} down`;
  }
}

// ── Stats ───────────────────────────────────────────────────────────────────

function updateStats(data) {
  els.total.textContent = data.summary.total;
  els.healthy.textContent = data.summary.healthy;
  els.degraded.textContent = data.summary.degraded;
  els.down.textContent = data.summary.down;
}

// ── Service Cards ───────────────────────────────────────────────────────────

function createServiceCard(service) {
  const detailStr = service.data
    ? JSON.stringify(service.data, null, 2)
    : service.error || "(no response)";

  let serviceMeta;
  if (service.statusCode) {
    serviceMeta = `HTTP ${service.statusCode}`;
  } else if (service.error) {
    serviceMeta = "Connection failed";
  } else {
    serviceMeta = "—";
  }

  const card = document.createElement("div");
  card.className = `service-card ${currentFilter !== "all" && service.status !== currentFilter ? "hidden" : ""}`;
  card.dataset.status = service.status;
  card.dataset.id = service.id;

  card.innerHTML = `
    <div class="service-left">
      <div class="service-indicator ${service.status}"></div>
      <div class="service-info">
        <div class="service-name">${service.name}</div>
        <div class="service-meta">${serviceMeta}</div>
      </div>
    </div>
    <div class="service-right">
      <span class="service-badge ${service.status}${service.critical ? " critical" : ""}">
        ${service.status}${service.critical ? " ★" : ""}
      </span>
      <button class="service-detail-toggle" title="Toggle details" aria-label="Toggle details">▸</button>
    </div>
  `;

  // Detail panel (hidden by default)
  const detail = document.createElement("div");
  detail.className = "service-detail";
  detail.textContent = detailStr;

  const toggle = card.querySelector(".service-detail-toggle");
  toggle.addEventListener("click", () => {
    const isOpen = detail.classList.toggle("visible");
    toggle.classList.toggle("open", isOpen);
    toggle.textContent = isOpen ? "▾" : "▸";
  });

  const wrapper = document.createElement("div");
  wrapper.appendChild(card);
  wrapper.appendChild(detail);

  return wrapper;
}

function renderServices(data) {
  els.servicesList.innerHTML = "";
  const filtered = currentFilter === "all"
    ? data.services
    : data.services.filter((s) => s.status === currentFilter);

  if (filtered.length === 0) {
    const empty = document.createElement("div");
    empty.className = "loading";
    empty.textContent = `No ${currentFilter} services`;
    els.servicesList.appendChild(empty);
    return;
  }

  for (const svc of filtered) {
    els.servicesList.appendChild(createServiceCard(svc));
  }
}

// ── Update All ──────────────────────────────────────────────────────────────

async function updateDashboard() {
  els.refreshBtn.classList.add("spinning");
  try {
    const data = await fetchHealth();
    document.title = `ANQR · ${data.allClear ? "✅" : "⚠️"} ${data.summary.healthy}/${data.summary.total}`;
    updateStats(data);
    updateBanner(data);
    renderServices(data);
    els.updateTime.textContent = formatTime(data.timestamp);
    els.footerStamp.textContent = `Last updated: ${new Date().toLocaleString()}`;
  } catch (err) {
    els.servicesList.innerHTML = `<div class="loading" style="color:var(--red)">Failed to load: ${err.message}</div>`;
  } finally {
    setTimeout(() => els.refreshBtn.classList.remove("spinning"), 600);
  }
}

// ── Filters ─────────────────────────────────────────────────────────────────

$$(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    $$(".filter-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    // Re-render with filter
    fetchHealth().then((data) => {
      renderServices(data);
    }).catch(() => {});
  });
});

// ── Init ────────────────────────────────────────────────────────────────────

els.refreshBtn.addEventListener("click", updateDashboard);
updateDashboard();
setInterval(updateDashboard, REFRESH_INTERVAL);

// Refresh commits and issues on their own 60s cycle
fetchAndRenderCommits();
fetchAndRenderIssues();
setInterval(fetchAndRenderCommits, INFRA_REFRESH_INTERVAL);
setInterval(fetchAndRenderIssues, INFRA_REFRESH_INTERVAL);

// ── Recent Commits ──────────────────────────────────────────────────────────

async function fetchAndRenderCommits() {
  try {
    const res = await fetch(`${API_BASE}/api/commits`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    els.commitsCount.textContent = data.count;
    renderCommits(data.commits);
  } catch (err) {
    els.commitsList.innerHTML = `<div class="infra-empty">Failed: ${err.message}</div>`;
  }
}

function renderCommits(commits) {
  if (!commits || commits.length === 0) {
    els.commitsList.innerHTML = '<div class="infra-empty">No commits</div>';
    return;
  }
  els.commitsList.innerHTML = commits
    .map(
      (c) => `
      <div class="commit-item">
        <code class="commit-hash">${c.hash}</code>
        <span class="commit-subject">${escapeHtml(c.subject)}</span>
      </div>`,
    )
    .join("");
}

// ── Running Linear Issues ────────────────────────────────────────────────────

async function fetchAndRenderIssues() {
  try {
    const res = await fetch(`${API_BASE}/api/linear-issues`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    els.issuesCount.textContent = data.count;
    renderIssues(data.issues);
  } catch (err) {
    els.issuesList.innerHTML = `<div class="infra-empty">Failed: ${err.message}</div>`;
  }
}

function renderIssues(issues) {
  if (!issues || issues.length === 0) {
    els.issuesList.innerHTML = '<div class="infra-empty">No running issues</div>';
    return;
  }
  els.issuesList.innerHTML = issues
    .map(
      (iss) => {
        const assignee = iss.assignee?.name || "unassigned";
        const issueUrl = iss.url ? escapeHtml(iss.url) : `https://linear.app/anqr/issue/${escapeHtml(iss.identifier)}`;
        return `
      <div class="issue-item">
        <div class="issue-left">
          <a class="issue-identifier" href="${issueUrl}" target="_blank" rel="noopener" title="Open in Linear">${escapeHtml(iss.identifier)}</a>
          <span class="issue-title">${escapeHtml(iss.title)}</span>
        </div>
        <div class="issue-right">
          <span class="issue-state started">Started</span>
          <span class="issue-assignee">${escapeHtml(assignee)}</span>
        </div>
      </div>`;
      },
    )
    .join("");
}

// ── Escape HTML ──────────────────────────────────────────────────────────────

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
