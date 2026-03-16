export interface FragmentSearchState {
  targets: boolean[][] | null;
  importance: number[][] | null;
  cachedModuleCount: number;
  bestFragment: string;
  bestScore: number;
  bestMatchingModules: number;
  bestTotalControllable: number;
}
