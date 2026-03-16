import { generateBlueNoiseTile, sampleBlueNoise } from "../dither";
import { clamp01 } from "./clamp01";
import type { DitherThresholdPattern } from "./dither-threshold-pattern";
import type { DitherStaticState } from "./dither-static-state";

export function computeDitherThreshold(
  x: number,
  y: number,
  sampleIdx: number,
  overlayDark: number,
  mix: number,
  thresholdPattern: DitherThresholdPattern,
  staticState: DitherStaticState,
  noiseTile: ReturnType<typeof generateBlueNoiseTile>,
  tileSize: number,
  temporalOffsetX: number,
  temporalOffsetY: number,
): number {
  const centered = (value01: number): number => clamp01(0.5 + (value01 - 0.5) * mix);
  switch (thresholdPattern) {
    case "white_noise":
      return centered(staticState.whiteNoiseField[sampleIdx]);
    case "gaussian_noise":
      return centered(staticState.gaussianNoiseField[sampleIdx]);
    case "triangular_noise":
      return centered(staticState.triangularNoiseField[sampleIdx]);
    case "ordered": {
      const rank =
        staticState.orderedMatrix[y % staticState.orderedH]?.[x % staticState.orderedW] ?? 0;
      return centered((rank + 0.5) / staticState.orderedDivisor);
    }
    case "screened_blue_noise": {
      const blue = sampleBlueNoise(x, y, noiseTile, tileSize);
      const screen = clamp01(0.5 + 0.5 * Math.sin(x * 0.37 + y * 0.29));
      return centered(blue * 0.72 + screen * 0.28);
    }
    case "temporal_blue_noise":
      return centered(
        sampleBlueNoise(x + temporalOffsetX, y + temporalOffsetY, noiseTile, tileSize),
      );
    case "adaptive_threshold":
      return centered(clamp01(0.55 - (overlayDark - 0.5) * 0.9));
    default:
      return centered(sampleBlueNoise(x, y, noiseTile, tileSize));
  }
}
