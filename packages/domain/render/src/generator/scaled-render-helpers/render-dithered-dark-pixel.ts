import { adjustLumaPreserveChroma } from "./adjust-luma-preserve-chroma";
import type { PixelColor, PixelGridCtx } from "../scaled-render-types";
import { hash01 } from "../hash01";

export function renderDitheredDarkPixel(
  pgctx: PixelGridCtx,
  x: number,
  y: number,
  dx: number,
  dy: number,
  color: PixelColor | null,
  moduleLocked: boolean,
): void {
  const {
    ctx,
    seed,
    useColorRendering,
    dotMinRadiusPx,
    dotMaxRadiusPx,
    quantizeRadius,
    localVariance,
    drawDitherDot,
  } = pgctx;
  const sourceLuma = color ? (0.299 * color.r + 0.587 * color.g + 0.114 * color.b) / 255 : 0.5;
  let drawLuma: number;
  if (useColorRendering && color) {
    const tone = (1 - sourceLuma) ** 0.86;
    const targetLuma = Math.max(0.04, Math.min(0.21, 0.04 + (1 - tone) * 0.17));
    const dark = adjustLumaPreserveChroma(color, targetLuma, 1.62);
    ctx.fillStyle = `rgb(${dark.r},${dark.g},${dark.b})`;
    drawLuma = (0.299 * dark.r + 0.587 * dark.g + 0.114 * dark.b) / 255;
  } else {
    const mono = Math.round(Math.max(8, Math.min(76, 8 + sourceLuma * 68)));
    ctx.fillStyle = `rgb(${mono},${mono},${mono})`;
    drawLuma = mono / 255;
  }
  const varN = localVariance(x, y);
  const noiseN = hash01(x, y, seed);
  const toneN = (1 - drawLuma) ** 0.9;
  if (!moduleLocked) {
    const dropoutNoise = hash01(x, y, seed + 257);
    const dropoutChance = Math.max(0, Math.min(0.05, 0.004 + (1 - toneN) * 0.03 + varN * 0.012));
    if (dropoutNoise < dropoutChance) return;
  }
  const radiusT = Math.max(
    0,
    Math.min(1, 0.16 + toneN * 0.68 + varN * 0.22 + (noiseN - 0.5) * 0.34),
  );
  const rawRadius = dotMinRadiusPx + radiusT * (dotMaxRadiusPx - dotMinRadiusPx);
  const radius = quantizeRadius(Math.max(dotMinRadiusPx, rawRadius));
  drawDitherDot(dx, dy, radius, 0.66 + 0.34 * hash01(x, y, seed + 7));
}
