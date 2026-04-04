export function listWorktrees(): Array<{
  path: string;
  branch: string;
  prunable: boolean;
  head: string;
}>;
