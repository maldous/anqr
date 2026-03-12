/**
 * Validate quiet zone size
 */
export function validateQuietZone(
  quietZone: number,
  minModules = 4
): { valid: boolean; warning?: string } {
  if (quietZone < minModules) {
    return {
      valid: false,
      warning: `Quiet zone ${quietZone} modules is below minimum ${minModules} modules`,
    };
  }
  return { valid: true };
}
