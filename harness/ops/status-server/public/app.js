/* ── ANQR Status Dashboard v4 ── */
const API = "";
let live = true;
let searchQ = "";
let activeTab = "services";
let serviceFilter = "all";
let commitTypeFilter = "all";
let allData = {};

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

function esc(s) { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; }
function fmt(iso) { return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }); }
function fmtNum(n) { if (n == null || isNaN(n)) return "—"; return n >= 1000 ? (n / 1000).toFixed(1) + "k" : String(n); }
function ago(ts) { if (!ts) return ""; const s = Math.round((Date.now() - ts) / 1000); return s < 60 ? `${s}s ago` : `${Math.round(s/60)}m ago`; }

// ── Fetch all in one shot ────────────────────────────────────────────────────
async function fetchAll() {
  const res = await fetch(`${API}/api/all`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ── Render Stats ─────────────────────────────────────────────────────────────
function renderStats(d) {
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
  // "Queued" = Linear Todo count (actual work waiting), NOT symphony eligible count
  // (symphony state accumulates 400+ stale historical records that are not real queue items)
  $("#issuesEligible").textContent = d.linearTodoCount ?? "—";
  document.title = `ANQR · ${h.allClear ? "✅" : "⚠️"} ${s.healthy}/${s.total}`;
  renderBanner(h);
  renderProvidersChip(d.models);
  renderWorktreesChip(wts);
  $("#updateTime").textContent = fmt(h.timestamp || new Date().toISOString());
  $("#footerTimestamp").textContent = `Updated ${new Date().toLocaleString()}`;
}

function renderBanner(h) {
  const b = $("#banner"); const icon = $(".banner-icon"); const text = $(".banner-text");
  if (!h) return;
  if (h.allClear) { b.className = "banner ok"; icon.textContent = "✅"; text.textContent = "All systems operational"; }
  else if (h.criticalDown?.length) { b.className = "banner error"; icon.textContent = "🚨"; text.textContent = `Critical: ${h.criticalDown.join(", ")}`; }
  else { b.className = "banner warn"; icon.textContent = "⚠️"; text.textContent = `${h.summary?.degraded ?? 0} degraded, ${h.summary?.down ?? 0} down`; }
}

function renderProvidersChip(m) {
  const el = $("#providersChip");
  if (!m || !m.totalConfigured) { el.style.display = "none"; return; }
  el.textContent = `${m.totalAvailable}/${m.totalConfigured} providers`;
  el.style.display = "";
}

function renderWorktreesChip(wts) {
  const el = $("#worktreesChip");
  if (!wts) { el.style.display = "none"; return; }
  el.textContent = `${wts.executing}/${wts.total} worktrees running`;
  el.className = `chip ${wts.executing > 0 ? "chip-green" : "chip-muted"}`;
  el.style.display = "";
}

// ── Services ─────────────────────────────────────────────────────────────────
function renderServices(services) {
  const el = $("#servicesList"); if (!services) { el.innerHTML = '<div class="empty-state">No data</div>'; return; }
  const q = searchQ.toLowerCase();
  el.innerHTML = services.map(s => {
    const hide = (serviceFilter !== "all" && s.status !== serviceFilter) || (q && !s.name.toLowerCase().includes(q)) ? " hidden" : "";
    const rt = s.responseTime != null ? `${s.responseTime}ms` : "";
    const meta = [s.statusCode ? `HTTP ${s.statusCode}` : s.error ? "failed" : "—", rt].filter(Boolean).join(" · ");
    const detail = s.data ? JSON.stringify(s.data, null, 2) : (s.error || "(no data)");
    return `<div class="service-card${hide}" data-status="${s.status}">
      <div class="service-left">
        <div class="dot ${s.status}"></div>
        <div><div class="service-name">${esc(s.name)}</div><div class="service-meta">${esc(meta)}</div></div>
      </div>
      <div class="service-right">
        <span class="badge ${s.status}${s.critical ? " critical" : ""}">${s.status}${s.critical ? " ★" : ""}</span>
        <button class="toggle-btn" onclick="toggleDetail(this)">▸</button>
      </div>
    </div>
    <div class="service-detail">${esc(detail)}</div>`;
  }).join("");
}

window.toggleDetail = (btn) => {
  const d = btn.closest(".service-card").nextElementSibling;
  const open = d.classList.toggle("open");
  btn.textContent = open ? "▾" : "▸";
};

// ── Commits ───────────────────────────────────────────────────────────────────
function renderCommits(commits) {
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

// ── Issues ────────────────────────────────────────────────────────────────────
function renderIssues(issues) {
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

// ── Models ────────────────────────────────────────────────────────────────────
const PREFIXES = [["github-models-","github/"],["huggingface-","hf/"],["sambanova-","samba/"],["openrouter-","or/"],["together-","together/"],["mistral-","mistral/"],["groq-","groq/"],["cerebras-","cerebras/"],["fireworks-","fw/"]];
function shortName(n) { for (const [p,s] of PREFIXES) if (n.startsWith(p)) return s+n.slice(p.length); return n; }

function renderModels(data) {
  const el = $("#modelsList");
  if (!data?.ranked?.length) { el.innerHTML = `<div class="empty-state">${data?.error || "No data"}</div>`; return; }
  const max = data.ranked[0]?.count || 1;
  const q = searchQ.toLowerCase();
  $("#modelsAvailChip").textContent = `${data.totalAvailable}/${data.totalConfigured} available`;
  $("#modelsCallsChip").textContent = `${fmtNum(data.totalCalls)} total calls`;
  if (data.lastProbe) $("#modelsLastProbe").textContent = `Last probe: ${new Date(data.lastProbe).toLocaleString()}`;
  el.innerHTML = data.ranked.map((m, i) => {
    const short = shortName(m.name);
    if (q && !short.toLowerCase().includes(q) && !m.name.toLowerCase().includes(q)) return "";
    const barW = Math.round(m.count / max * 100);
    const hs = m.healthState === "healthy" ? "healthy" : m.healthState === "unknown" ? "unknown" : "degraded";
    const avail = m.available ? "on" : "off";
    return `<div class="model-row ${m.available ? "" : "unavailable"}" title="${esc(m.name)}">
      <span class="model-rank">${i+1}</span>
      <span class="model-avail ${avail}">${m.available ? "●" : "○"}</span>
      <span class="model-name">${esc(short)}</span>
      <div class="model-bar-wrap"><div class="model-bar" style="width:${barW}%"></div></div>
      <span class="model-count">${fmtNum(m.count)}</span>
      <span class="model-pct">${m.pct}%</span>
      <span class="model-health ${hs}" title="${esc(m.healthState)}"></span>
    </div>`;
  }).join("");
}

// ── Symphony ──────────────────────────────────────────────────────────────────
function renderSymphony(sym) {
  const el = $("#symphonyGrid");
  if (!sym) { el.innerHTML = '<div class="loading no-spin">Pipeline data unavailable</div>'; return; }
  const wts = (sym.worktrees || []).filter(w => w.id.startsWith("wt") && parseInt(w.id.replace("wt","")) <= 8);
  const iss = sym.issueStats || {};
  const wStats = sym.worktreeStats || {};
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

// ── Master Render ─────────────────────────────────────────────────────────────
function renderAll(data) {
  allData = data;
  renderStats(data);
  renderServices(data.health?.services);
  renderCommits(data.commits);
  renderIssues(data.issues);
  renderModels(data.models);
  renderSymphony(data.symphony);
}

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
  live = !live;
  $("#liveToggle").textContent = live ? "⏸" : "▶";
  if (live) { refresh(); timer = setInterval(refresh, 30000); }
  else clearInterval(timer);
});

// ── Tabs ───────────────────────────────────────────────────────────────────────
$$(".tab").forEach(t => t.addEventListener("click", () => {
  $$(".tab").forEach(x => x.classList.remove("active"));
  $$(".tab-panel").forEach(x => x.classList.remove("active"));
  t.classList.add("active");
  activeTab = t.dataset.tab;
  $(`#tab-${activeTab}`)?.classList.add("active");
}));

// ── Filters ───────────────────────────────────────────────────────────────────
$$(".filter-pills .filter-btn[data-filter]").forEach(b => b.addEventListener("click", () => {
  b.closest(".filter-pills").querySelectorAll(".filter-btn").forEach(x => x.classList.remove("active"));
  b.classList.add("active");
  serviceFilter = b.dataset.filter;
  renderServices(allData.health?.services);
}));

$$(".filter-pills .filter-btn[data-type]").forEach(b => b.addEventListener("click", () => {
  b.closest(".filter-pills").querySelectorAll(".filter-btn").forEach(x => x.classList.remove("active"));
  b.classList.add("active");
  commitTypeFilter = b.dataset.type;
  renderCommits(allData.commits);
}));

// ── Search ────────────────────────────────────────────────────────────────────
let searchTimer;
$("#globalSearch").addEventListener("input", e => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    searchQ = e.target.value.trim();
    renderServices(allData.health?.services);
    renderCommits(allData.commits);
    renderIssues(allData.issues);
    renderModels(allData.models);
  }, 150);
});

// ── Init ──────────────────────────────────────────────────────────────────────
refresh();
