export async function updateDashboard() {
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