import { getRelatedHues } from './get-related-hues';

/**
 * Get triadic colors (evenly spaced on color wheel)
 */
export function getTriadic(color: string): [string, string] {
  return getRelatedHues(color, [120, 240]);
}
