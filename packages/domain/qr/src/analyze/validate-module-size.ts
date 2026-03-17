/**
 * Validate module size for scannability
 */
export function validateModuleSize(
  moduleSize: number,
  minSize = 4,
): { valid: boolean; warning?: string } {
  if (moduleSize < minSize) {
    return {
      valid: false,
      warning: `Module size ${moduleSize}px is below minimum ${minSize}px for reliable scanning`,
    };
  }
  return { valid: true };
}
