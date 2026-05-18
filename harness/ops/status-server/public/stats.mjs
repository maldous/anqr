export function updateStats(data) {
  els.total.textContent = data.summary.total;
  els.healthy.textContent = data.summary.healthy;
  els.degraded.textContent = data.summary.degraded;
  els.down.textContent = data.summary.down;
}