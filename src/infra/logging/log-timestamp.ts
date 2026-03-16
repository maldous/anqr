export function logTimestamp(): string {
  return new Date().toISOString().replaceAll(/[:.]/g, "-");
}
