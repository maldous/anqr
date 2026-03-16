import { isPrivateIPv4Class192 } from "./is-private-i-pv4-class192";

export function isPrivateIPv4Subnet(a: number, b: number, c: number): boolean {
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192) return isPrivateIPv4Class192(b, c);
  if (a === 169 && b === 254) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  if (a === 198 && b === 51 && c === 100) return true;
  if (a === 203 && b === 0 && c === 113) return true;
  return false;
}
