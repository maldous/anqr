/**
 * Named exit codes for the symphony runner.
 *
 * These are consumed by execute-linear-issue-request.mjs to distinguish
 * between successful completion, lock contention, and real failures.
 */
export const EXIT_LOCK_CONTENTION = 2;
