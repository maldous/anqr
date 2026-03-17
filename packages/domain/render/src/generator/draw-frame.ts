import type { QRGeneratorConfig } from "@/modules/qr-generator/types";

/**
 * Draw frame text and border
 */
export function drawFrame(
  ctx: CanvasRenderingContext2D,
  size: number,
  moduleSize: number,
  _margin: number,
  config: QRGeneratorConfig,
): void {
  if (!config.frameStyle || config.frameStyle === "none") return;

  const fgColor = config.fgColor || "#000000";

  // Draw a visible border so the frame is distinguishable even without text.
  // This runs after quiet zone enforcement, so the border won't be erased.
  let defaultRadius: number;
  if (config.frameStyle === "sticker") defaultRadius = 12;
  else if (config.frameStyle === "tag") defaultRadius = 4;
  else defaultRadius = 0;
  const borderRadius = config.frameBorderRadius ?? defaultRadius;
  const lineWidth = Math.max(1, Math.round(size / 200));
  const inset = lineWidth / 2;

  ctx.strokeStyle = fgColor;
  ctx.lineWidth = lineWidth;

  if (borderRadius > 0) {
    const radius = (borderRadius / 100) * (size / 4);
    const r = Math.min(radius, (size - inset * 2) / 2);
    ctx.beginPath();
    ctx.moveTo(inset + r, inset);
    ctx.lineTo(size - inset - r, inset);
    ctx.quadraticCurveTo(size - inset, inset, size - inset, inset + r);
    ctx.lineTo(size - inset, size - inset - r);
    ctx.quadraticCurveTo(size - inset, size - inset, size - inset - r, size - inset);
    ctx.lineTo(inset + r, size - inset);
    ctx.quadraticCurveTo(inset, size - inset, inset, size - inset - r);
    ctx.lineTo(inset, inset + r);
    ctx.quadraticCurveTo(inset, inset, inset + r, inset);
    ctx.closePath();
    ctx.stroke();
  } else {
    ctx.strokeRect(inset, inset, size - inset * 2, size - inset * 2);
  }

  if (!config.frameText) return;

  const textColor = config.frameTextColor || config.fgColor;
  const frameHeight = moduleSize * 4;
  const textY = size - frameHeight * 0.55;
  const frameText = String(config.frameText);
  const maxTextWidth = Math.max(40, size - moduleSize * 8);

  ctx.fillStyle = textColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Use a clean sans-serif stack and size to fit the available frame width.
  let fontSize = Math.max(14, Math.round(frameHeight * 0.72));
  const minFontSize = Math.max(11, Math.round(frameHeight * 0.5));
  const canMeasureText = typeof ctx.measureText === "function";
  while (fontSize > minFontSize) {
    ctx.font = `600 ${fontSize}px "Helvetica Neue", "Segoe UI", Arial, sans-serif`;
    if (!canMeasureText || ctx.measureText(frameText).width <= maxTextWidth) break;
    fontSize -= 1;
  }
  ctx.fillText(frameText, size / 2, textY);
}
