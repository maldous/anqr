export function isPrivateIPv4FirstOctet(a: number): boolean {
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 0) return true;
  if (a >= 224 && a <= 239) return true;
  if (a >= 240) return true;
  return false;
}
