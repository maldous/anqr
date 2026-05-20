// Shared mutable state for the per-run trace file.
// One declaration (the exported object) satisfies the AST Density Rule.
export const traceState = {
  tracePath: null,
  issueId: null,
  runId: null,
  worktreeId: null,
};
