export function getClientKey(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }

  const realIp =
    request.headers.get("x-nf-client-connection-ip") || request.headers.get("client-ip");
  if (realIp) return realIp;

  return "unknown-client";
}
