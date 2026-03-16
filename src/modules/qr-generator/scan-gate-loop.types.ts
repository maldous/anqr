import type { DitherAttemptPatch } from "./dither-attempt-patch.types";

export interface ScanGateLoopState {
  bestBaseDecodable: HTMLCanvasElement | OffscreenCanvas | null;
  bestBaseDecodablePatch: DitherAttemptPatch | null;
  prevEdgeImprint: number | null;
}
