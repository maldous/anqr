export interface CodewordBuildState {
  currentByte: number;
  bitsRead: number;
  visitedModules: number;
  skippedAsFunction: number;
}
