import type { FinderPattern } from "./types";

export interface ScoredTriplet {
  ordered: [FinderPattern, FinderPattern, FinderPattern];
  score: number;
  squareness: number;
  moduleSizeVariance: number;
}
