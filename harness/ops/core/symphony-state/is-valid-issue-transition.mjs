import { ISSUE_TRANSITION_MAP } from "./transition-map.mjs";

/**
 * Check whether an issue phase transition is valid.
 *
 * @param {string} from - Current phase
 * @param {string} to   - Target phase
 * @returns {boolean}
 */
export function isValidIssueTransition(from, to) {
  const allowed = ISSUE_TRANSITION_MAP[from];
  return allowed ? allowed.has(to) : false;
}
