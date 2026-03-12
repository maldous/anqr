import { blendColors } from '../core';

export function blendLightModuleColor(
  ditherR: number,
  ditherG: number,
  ditherB: number,
  whiteBase: number,
  whitePush: number,
  lightMix: number,
  bgColor: string,
  mixScale: number
): string {
  const factor = whiteBase + lightMix * whitePush;
  const lightR = Math.round(ditherR + (255 - ditherR) * factor);
  const lightG = Math.round(ditherG + (255 - ditherG) * factor);
  const lightB = Math.round(ditherB + (255 - ditherB) * factor);
  return blendColors(bgColor, `rgb(${lightR},${lightG},${lightB})`, lightMix * mixScale);
}
