import { applyAnimationWave } from "@/modules/animation";
import type { AnimationWaveAxis } from "./animation-wave-axis.types";
import { hslToRgbTupleServer } from "./hsl-to-rgb-tuple-server";
import { tintWavePixel } from "./tint-wave-pixel";

export function applyAnimationWaveWithAxisServer(
  data: Uint8ClampedArray,
  progress: number,
  width: number,
  height: number,
  seed: number,
  axis: AnimationWaveAxis = "y",
): void {
  if (axis === "y") {
    applyAnimationWave(data, progress, width, height, seed);
    return;
  }

  const waveFrequencyX = 3 + (seed % 5);
  const waveFrequencyY = 2 + ((seed * 3) % 5);
  const baseHue = (seed * 23) % 360;
  const twoPi = Math.PI * 2;

  for (let y = 0; y < height; y++) {
    const phaseY = Math.sin((y / height) * waveFrequencyY * twoPi + progress * twoPi);
    for (let x = 0; x < width; x++) {
      const phaseX = Math.sin((x / width) * waveFrequencyX * twoPi + progress * twoPi);
      const wavePhase =
        axis === "xy" ? Math.max(-1, Math.min(1, phaseX * 0.65 + phaseY * 0.35)) : phaseX;
      const waveIntensity = (wavePhase + 1) / 2;
      const hueShift = axis === "xy" ? wavePhase * 45 + (phaseX - phaseY) * 15 : wavePhase * 30;
      const waveColor = hslToRgbTupleServer(baseHue + hueShift, 72, 50);
      const i = (y * width + x) * 4;
      if (data[i + 3] === 0) continue;
      tintWavePixel(data, i, waveColor, waveIntensity);
    }
  }
}
