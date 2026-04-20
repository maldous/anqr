/**
 * Named exit codes for the symphony runner.
 *
 * These are consumed by execute-linear-issue-request.mjs to distinguish
 * between successful completion, lock contention, and real failures.
 *
 * Exit 0 + outcome file = structured result (commit may or may not exist).
 * The outcome file is the single source of truth for what happened.
 */
export const EXIT_LOCK_CONTENTION = 2;
