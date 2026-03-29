/**
 * worktree-config.mjs — Centralized worktree path configuration
 *
 * Single source of truth for worktree path calculation to prevent
 * configuration drift between Symphony runner, worktree pool manager,
 * and systemd service templates.
 *
 * Path convention: /home/user/src/anqr-wt{id}
 * - Main repository: /home/user/src/anqr
 * - Worktree 1: /home/user/src/anqr-wt1
 * - Worktree 2: /home/user/src/anqr-wt2
 * - Worktree N: /home/user/src/anqr-wtN
 */

import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Project root directory (main repository)
 * @type {string}
 */
export const PROJECT_ROOT = resolve(__dirname, "..", "..", "..");

/**
 * Worktree prefix for directory naming
 * @type {string}
 */
export const WORKTREE_PREFIX = "anqr-wt";

/**
 * Git branch prefix for worktree branches
 * @type {string}
 */
export const WORKTREE_BRANCH_PREFIX = "symphony/wt";

/**
 * Get absolute path to a worktree directory
 * @param {number|string} id - Worktree ID (1, 2, 3, ...)
 * @returns {string} - Absolute path to worktree
 * @example
 * getWorktreePath(1) // => "/home/user/src/anqr-wt1"
 * getWorktreePath("2") // => "/home/user/src/anqr-wt2"
 */
export function getWorktreePath(id) {
  if (!id) {
    throw new Error("Worktree ID is required");
  }
  return resolve(PROJECT_ROOT, "..", `${WORKTREE_PREFIX}${id}`);
}

/**
 * Get branch name for a worktree
 * @param {number|string} id - Worktree ID
 * @returns {string} - Branch name
 * @example
 * getWorktreeBranch(1) // => "symphony/wt1"
 */
export function getWorktreeBranch(id) {
  if (!id) {
    throw new Error("Worktree ID is required");
  }
  return `${WORKTREE_BRANCH_PREFIX}${id}`;
}
