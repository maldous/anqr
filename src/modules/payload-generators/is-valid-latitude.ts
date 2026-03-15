/**
 * Validate latitude (-90 to 90)
 */
export function isValidLatitude(lat: number): boolean {
  return !Number.isNaN(lat) && lat >= -90 && lat <= 90;
}
