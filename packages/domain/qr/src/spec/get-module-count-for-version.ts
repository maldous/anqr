/** Get module count for a QR version */
export function getModuleCountForVersion(version: number): number {
  return version * 4 + 17;
}
