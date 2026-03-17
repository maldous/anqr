/**
 * Validate longitude (-180 to 180)
 */
export function isValidLongitude(lon: number): boolean {
  return !Number.isNaN(lon) && lon >= -180 && lon <= 180;
}
