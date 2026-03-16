import { polyIsZero } from "./poly-is-zero";

/**
 * Check if syndrome polynomial indicates no errors
 */
export function isSyndromeZero(syndromePoly: number[]): boolean {
  return polyIsZero(syndromePoly);
}
