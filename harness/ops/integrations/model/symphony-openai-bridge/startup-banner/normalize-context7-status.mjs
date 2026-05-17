export function normalizeContext7Status(status) {
  const normalized = String(status || "unreachable").toLowerCase();
  if (normalized === "ok" || normalized === "healthy" || normalized === "ready") return "ok";
  if (normalized === "degraded" || normalized === "warming" || normalized === "starting") {
    return "warming";
  }
  return normalized;
}
