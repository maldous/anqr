export function isReservedIPv6(ip: string): boolean {
  return (
    ip.startsWith("fe80:") ||
    ip.startsWith("fc") ||
    ip.startsWith("fd") ||
    ip === "::1" ||
    ip.startsWith("::ffff:")
  );
}
