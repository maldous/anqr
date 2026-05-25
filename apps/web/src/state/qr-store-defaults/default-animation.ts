import type { QRState } from "../qr-store";

export const DEFAULT_ANIMATION: QRState["animation"] = {
  speedMs: 100,
  loop: true,
  bounce: false,
  playing: true,
  startFrame: 0,
  maxFrames: 0, // 0 = auto (use source frames, capped for performance)
  frameStep: 1,
  perFrameDelay: [],
  interpolate: "none",
  temporalDither: "off",
  seed: 0,
  pattern: "none",
  target: "result",
  waveAxis: "y",
  pattern2: "none",
  target2: "result",
  waveAxis2: "x",
  moduleJitterPx: 0,
  colorCycle: false,
};
