import { getRelatedHues } from "./get-related-hues";

/**
 * Get analogous colors (adjacent on color wheel)
 */
export function getAnalogous(color: string, angle = 30): [string, string] {
  return getRelatedHues(color, [angle, -angle]);
}
