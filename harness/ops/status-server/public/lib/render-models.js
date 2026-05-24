import { $ } from "./dom-query.js";
import { searchQ } from "./state.js";
import { esc } from "./format.js";
import { fmtNum } from "./fmt-num.js";
import { shortName } from "./short-name.js";

export function renderModels(data) {
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
