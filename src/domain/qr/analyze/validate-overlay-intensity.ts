import { calculateSafeIntensity } from './calculate-safe-intensity';

/**
 * Validate overlay intensity
 */
export function validateOverlayIntensity(
  intensity: number,
  eccLevel: string
): { valid: boolean; warning?: string } {
  const maxSafe = calculateSafeIntensity(eccLevel);
  if (intensity > maxSafe) {
    return {
      valid: false,
      warning: `Overlay intensity ${intensity}% exceeds safe limit ${maxSafe}% for ECC level ${eccLevel}`,
    };
  }
  return { valid: true };
}
