import type { RSBasisVector } from "./rs-basis";

export interface BlockEliminationResult {
  blockIndex: number;
  vectors: RSBasisVector[];
  pixelToVectorIndex: Map<number, number>;
  controllablePixels: number;
  controlledPixels: number[];
}
