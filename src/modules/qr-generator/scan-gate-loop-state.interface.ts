import type { DitherAttemptPatch } from './dither-attempt-patch.type';

export interface ScanGateLoopState {
  bestBaseDecodable: HTMLCanvasElement | OffscreenCanvas | null;
  bestBaseDecodablePatch: DitherAttemptPatch | null;
  prevEdgeImprint: number | null;
}
