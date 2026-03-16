import type { QRGeneratorConfig } from "./types";
import type { DitherAttemptPatch } from "./dither-attempt-patch.type";

export interface ScanGateCallbacks {
  buildAttemptConfig: (patch: DitherAttemptPatch) => QRGeneratorConfig;
  renderScaled: (cfg: QRGeneratorConfig) => Promise<HTMLCanvasElement | OffscreenCanvas>;
  runDecode: (src: HTMLCanvasElement | OffscreenCanvas) => Promise<boolean>;
  rememberPatch: (patch: DitherAttemptPatch) => void;
}
