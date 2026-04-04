import { MAIN_REPO_ROOT } from "./main-repo-root.mjs";

export function assertMutationContext(ctx) {
  if (ctx.executionMode !== "mutating") return; // Read-only requests can pass through

  if (!ctx.worktreeId) {
    throw new Error(
      "Mutation blocked: missing worktreeId - mutating requests must have assigned worktree",
    );
  }
  if (!ctx.leaseId) {
    throw new Error("Mutation blocked: missing leaseId - mutating requests must have valid lease");
  }
  if (!ctx.projectRoot) {
    throw new Error(
      "Mutation blocked: missing projectRoot - mutating requests must specify project root",
    );
  }
  const resolvedProjectRoot = ctx.projectRoot.replaceAll("\\", "/");
  const resolvedMainRoot = MAIN_REPO_ROOT;
  if (resolvedProjectRoot === resolvedMainRoot) {
    throw new Error(
      "Mutation blocked: main repo is forbidden for mutating requests - must use worktree",
    );
  }
  if (ctx.worktreeRoot && resolvedProjectRoot !== ctx.worktreeRoot.replaceAll("\\", "/")) {
    throw new Error("Mutation blocked: projectRoot must equal worktreeRoot for mutating requests");
  }
}
