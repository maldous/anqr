export function isPrivateIPv4Class192(b: number, c: number): boolean {
  if (b === 168) return true;
  if (b === 0 && c === 0) return true;
  if (b === 0 && c === 2) return true;
  return false;
}
