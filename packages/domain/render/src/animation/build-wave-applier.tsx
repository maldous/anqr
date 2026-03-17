import { PI4 } from "./pi4";
import { clampToByte } from "./clamp-to-byte";
import type { PatternFrameApplier } from "./pattern-frame-applier";

export function buildWaveApplier(time: number, width: number, height: number): PatternFrameApplier {
  const waveFactors = new Float32Array(width);
  const waveScale = PI4 / Math.max(1, width);
  for (let x = 0; x < width; x++) {
    waveFactors[x] = 0.7 + 0.3 * Math.sin(time + x * waveScale);
  }
  return (data) => {
    for (let y = 0; y < height; y++) {
      let i = y * width * 4;
      for (let x = 0; x < width; x++, i += 4) {
        const factor = waveFactors[x];
        data[i] = clampToByte(data[i] * factor);
        data[i + 1] = clampToByte(data[i + 1] * factor);
        data[i + 2] = clampToByte(data[i + 2] * factor);
      }
    }
  };
}
