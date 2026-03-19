export function getAuditContext(request: Request): {
  method: string;
  pathname: string;
  clientIp: string | null;
  userAgent: string | null;
} {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const clientIp =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-nf-client-connection-ip") ||
    forwardedFor?.split(",")[0]?.trim() ||
    null;

  return {
    method: request.method,
    pathname: new URL(request.url).pathname,
    clientIp,
    userAgent: request.headers.get("user-agent"),
  };
}
