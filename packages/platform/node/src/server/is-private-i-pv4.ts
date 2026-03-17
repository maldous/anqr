import { isPrivateIPv4FirstOctet } from "./is-private-i-pv4-first-octet";
import { isPrivateIPv4Subnet } from "./is-private-i-pv4-subnet";

export function isPrivateIPv4(a: number, b: number, c: number): boolean {
  return isPrivateIPv4FirstOctet(a) || isPrivateIPv4Subnet(a, b, c);
}
