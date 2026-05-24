import { $ } from "./dom-query.js";

export function renderProvidersChip(m) {
  const el = $("#providersChip");
  if (!m || !m.totalConfigured) { el.style.display = "none"; return; }
  el.textContent = `${m.totalAvailable}/${m.totalConfigured} providers`;
  el.style.display = "";
}
