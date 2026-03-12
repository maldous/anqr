/**
 * Validate Hong Kong FPS ID (7-9 digits)
 */
export function isValidFpsId(fpsId: string): boolean {
  const cleaned = fpsId.replaceAll(/\s/g, '');
  return /^\d{7,9}$/.test(cleaned);
}
