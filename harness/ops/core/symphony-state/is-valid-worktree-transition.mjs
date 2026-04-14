import { WORKTREE_TRANSITION_MAP } from "./transition-map.mjs";

/**
 * Check whether a worktree state transition is valid.
 *
 * @param {string} from - Current state
 * @param {string} to   - Target state
 * @returns {boolean}
 */
export function isValidWorktreeTransition(from, to) {
  const allowed = WORKTREE_TRANSITION_MAP[from];
  return allowed ? allowed.has(to) : false;
}
