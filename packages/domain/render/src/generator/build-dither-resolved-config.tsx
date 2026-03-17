import type { QRGeneratorConfig } from "./types";
import { resolveDitherKind } from "./resolve-dither-kind";
import { resolveDiffusionKernel } from "./resolve-diffusion-kernel";
import { resolveOrderedMatrixName } from "./resolve-ordered-matrix-name";
import { resolveThresholdPattern } from "./resolve-threshold-pattern";
import { isThresholdOnlyDitherKind } from "./is-threshold-only-dither-kind";
import { getDitherStaticState } from "./get-dither-static-state";
import { clamp01 } from "./clamp01";
import type { DitherResolvedConfig } from "./dither-resolved-config";

export function buildDitherResolvedConfig(
  config: QRGeneratorConfig,
  moduleCount: number,
  effectiveIntensity: number,
  scaledSize: number,
): DitherResolvedConfig {
  const rawIntensity = effectiveIntensity;
  const intensity = clamp01(rawIntensity);
  const rawStrength = config.ditherStrength ?? 0.85;
  const ditherStrength = rawStrength > 1 ? rawStrength / 100 : rawStrength;
  const ditherScale = Math.max(0, config.ditherScale ?? 1);
  const version = config.typeNumber || Math.ceil((moduleCount - 17) / 4);

  const serpentine = config.ditherSerpentine ?? true;
  const colorDitherMode = config.colorDither ?? "none";
  const useColorDither = colorDitherMode !== "none";
  const ditherKind = resolveDitherKind(config);
  const thresholdPattern = resolveThresholdPattern(ditherKind);
  const thresholdOnly = isThresholdOnlyDitherKind(ditherKind);
  const kernelName = resolveDiffusionKernel(config.diffusionKernel, ditherKind);
  const seed = config.blueNoiseSeed ?? config.seed ?? 1337;
  const tileSize = config.blueNoiseTileSize ?? 64;
  const orderedMatrixName = resolveOrderedMatrixName(ditherKind, config.orderedMatrix);
  const staticState = getDitherStaticState({
    ditherKind,
    tileSize,
    seed,
    orderedMatrixName,
    kernelName,
    colorDitherMode,
    scaledSize,
  });
  const noiseTile = staticState.noiseTile;
  const frameIndex = config.frameIndex ?? 0;
  const temporalOffsetX = (frameIndex * 17) % tileSize;
  const temporalOffsetY = (frameIndex * 29) % tileSize;
  const mix = clamp01(intensity * ditherStrength * ditherScale);
  const qrBitBiasStrength = clamp01(config.qrBitBiasStrength ?? 0);

  return {
    intensity,
    version,
    serpentine,
    colorDitherMode,
    useColorDither,
    ditherKind,
    thresholdPattern,
    thresholdOnly,
    kernelName,
    tileSize,
    staticState,
    noiseTile,
    temporalOffsetX,
    temporalOffsetY,
    mix,
    qrBitBiasStrength,
  };
}
