export interface FragmentSearchResult {
  fragment: string;
  url: string;
  score: number;
  matchingModules: number;
  totalControllable: number;
  matchPercentage: number;
}
