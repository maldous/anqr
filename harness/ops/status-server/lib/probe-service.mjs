export async function probeService(service) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  const start = Date.now();
  try {
    const res = await fetch(service.url, { signal: controller.signal });
    const responseTime = Date.now() - start;
    let data = null;
    try { data = await res.json(); } catch { /* not json */ }
    return { id: service.id, name: service.name, critical: service.critical,
      status: res.ok ? "healthy" : "degraded", statusCode: res.status, responseTime, data };
  } catch (err) {
    return { id: service.id, name: service.name, critical: service.critical,
      status: "down", statusCode: null, responseTime: Date.now() - start, error: err.message };
  } finally { clearTimeout(timeout); }
}
