import { $ } from "./dom-query.js";
import { searchQ, serviceFilter } from "./state.js";
import { esc } from "./format.js";

export function renderServices(services) {
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
