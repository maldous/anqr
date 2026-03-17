/**
 * Get module count for a QR version
 */
export function getModuleCount(version: number): number {
  return version * 4 + 17;
}
