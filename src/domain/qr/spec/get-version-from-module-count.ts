// ============================================
// VERSION UTILITIES
// ============================================

/** Get QR version from module count */
export function getVersionFromModuleCount(moduleCount: number): number {
  return (moduleCount - 17) / 4;
}
