import type { DitherAttemptPatch } from './qr-generator-scan-gate';

export interface ScanGateLoopState {
  bestBaseDecodable: HTMLCanvasElement | OffscreenCanvas | null;
  bestBaseDecodablePatch: DitherAttemptPatch | null;
  prevEdgeImprint: number | null;
}
