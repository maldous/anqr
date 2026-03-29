export function createWorktree(id: number): string;
export function removeWorktree(id: number): void;
export function listWorktrees(): Array<{
  path: string;
  branch: string;
  prunable: boolean;
  head: string;
}>;
export function getSymphonyWorktrees(): Array<{
  id: number;
  path: string;
  branch: string;
  prunable: boolean;
}>;
export function initWorktreePool(count?: number): Promise<Array<{ id: number; path: string }>>;
export function cleanupWorktreePool(): Promise<void>;
export function repairWorktrees(): Promise<void>;
export function printWorktreeStatus(): void;
