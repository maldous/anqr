export function updateBanner(data) {
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