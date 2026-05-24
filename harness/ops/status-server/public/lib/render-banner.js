import { $ } from "./dom-query.js";

export function renderBanner(h) {
  const b = $("#banner"); const icon = $(".banner-icon"); const text = $(".banner-text");
  if (!h) return;
  if (h.allClear) { b.className = "banner ok"; icon.textContent = "✅"; text.textContent = "All systems operational"; }
  else if (h.criticalDown?.length) { b.className = "banner error"; icon.textContent = "🚨"; text.textContent = `Critical: ${h.criticalDown.join(", ")}`; }
  else { b.className = "banner warn"; icon.textContent = "⚠️"; text.textContent = `${h.summary?.degraded ?? 0} degraded, ${h.summary?.down ?? 0} down`; }
}
