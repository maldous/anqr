export async function aggregateHealth() {
  const results = await Promise.all(SERVICES.map(probeService));
  const healthy = results.filter((r) => r.status === "healthy").length;
  const degraded = results.filter((r) => r.status === "degraded").length;
  const down = results.filter((r) => r.status === "down").length;
  const criticalDown = results.filter((r) => r.critical && r.status !== "healthy");

  return {
    timestamp: new Date().toISOString(),
    summary: { total: results.length, healthy, degraded, down },
    criticalDown: criticalDown.map((r) => r.id),
    allClear: criticalDown.length === 0,
    services: results,
  };
}