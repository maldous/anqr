import { isPrivateIPv4 } from "./is-private-i-pv4.ts";
import { isReservedIPv6 } from "./is-reserved-i-pv6.ts";

export function isPrivateOrReservedIP(ip: string): boolean {
  if (ip === "localhost" || ip === "127.0.0.1" || ip === "::1") {
    return true;
  }

  const ipv4Match = ip.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (ipv4Match) {
    const [, a, b, c] = ipv4Match.map(Number);
    return isPrivateIPv4(a, b, c);
  }

  return isReservedIPv6(ip);
}
