/**
 * Named exit codes for the symphony runner, shared between
 * orchestration (main.mjs) and integrations (execute-linear-issue-request.mjs).
 *
 * Extracted to core/ so integrations can reference exit codes without
 * importing from orchestration/ (which violates the harness hexagonal
 * architecture: integrations → orchestration is forbidden).
 *
 * Exit 0 + outcome file = structured result (commit may or may not exist).
 * The outcome file is the single source of truth for what happened.
 */
export const EXIT_LOCK_CONTENTION = 2;
