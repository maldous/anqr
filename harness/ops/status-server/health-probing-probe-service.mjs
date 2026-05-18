export async function probeService(service) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(service.url, { signal: controller.signal });
    let data = null;
    try { data = await res.json(); } catch { /* not json */ }

    return {
      id: service.id,
      name: service.name,
      critical: service.critical,
      status: res.ok ? "healthy" : "degraded",
      statusCode: res.status,
      data,
    };
  } catch (err) {
    return {
      id: service.id,
      name: service.name,
      critical: service.critical,
      status: "down",
      statusCode: null,
      error: err.message,
    };
  } finally {
    clearTimeout(timeout);
  }
}