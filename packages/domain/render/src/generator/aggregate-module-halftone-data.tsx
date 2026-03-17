import type { PixelDecisionMatrix } from "./types";
import { packColor } from "./pack-color";
import { luma01 } from "./luma01";
import { clamp01 } from "./clamp01";
import { lerp } from "./lerp";

export function aggregateModuleHalftoneData(
  ditheredResult: PixelDecisionMatrix,
  moduleData: Uint8ClampedArray | null,
  mr: number,
  mc: number,
  scale: number,
  moduleCount: number,
  effectiveIntensity: number,
  densityInfluence: number,
  overlayBrightness: Float32Array,
  overlayColorsPacked: Uint32Array,
): void {
  const total = scale * scale;
  let darkCount = 0;
  let sumR = 0;
  let sumG = 0;
  let sumB = 0;
  let colorCount = 0;
  let srcR = 127;
  let srcG = 127;
  let srcB = 127;
  let srcBrightness = 0.5;

  if (moduleData) {
    const srcIdx = (mr * moduleCount + mc) * 4;
    srcR = moduleData[srcIdx];
    srcG = moduleData[srcIdx + 1];
    srcB = moduleData[srcIdx + 2];
    srcBrightness = luma01(srcR, srcG, srcB);
  }

  for (let sy = 0; sy < scale; sy++) {
    for (let sx = 0; sx < scale; sx++) {
      const y = mr * scale + sy;
      const x = mc * scale + sx;
      if (ditheredResult.matrix[y]?.[x]) darkCount++;
      const c = ditheredResult.colors[y]?.[x];
      if (c) {
        sumR += c.r;
        sumG += c.g;
        sumB += c.b;
        colorCount++;
      }
    }
  }

  const density = darkCount / total;
  const densityBrightness = 1 - density;
  const overlayIndex = mr * moduleCount + mc;
  overlayBrightness[overlayIndex] = clamp01(
    lerp(srcBrightness, densityBrightness, densityInfluence),
  );

  if (colorCount > 0) {
    const ditherR = Math.round(sumR / colorCount);
    const ditherG = Math.round(sumG / colorCount);
    const ditherB = Math.round(sumB / colorCount);
    const colorMix = clamp01(0.2 + effectiveIntensity * 0.25);
    overlayColorsPacked[overlayIndex] = packColor(
      Math.round(lerp(srcR, ditherR, colorMix)),
      Math.round(lerp(srcG, ditherG, colorMix)),
      Math.round(lerp(srcB, ditherB, colorMix)),
    );
  } else {
    overlayColorsPacked[overlayIndex] = packColor(srcR, srcG, srcB);
  }
}
