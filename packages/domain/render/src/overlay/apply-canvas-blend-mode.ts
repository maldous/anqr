import type { OverlayMode } from "./processor.types";

// ============================================
// OVERLAY MODE APPLICATION
// ============================================

export function applyCanvasBlendMode(
  baseCanvas: HTMLCanvasElement,
  overlayCanvas: HTMLCanvasElement,
  mode: OverlayMode,
  opacity: number = 1,
): HTMLCanvasElement {
  const result = document.createElement("canvas");
  result.width = baseCanvas.width;
  result.height = baseCanvas.height;
  const ctx = result.getContext("2d");
  if (!ctx) throw new Error("Could not get 2D context");

  // Draw base
  ctx.drawImage(baseCanvas, 0, 0);

  // Set blend mode
  switch (mode) {
    case "multiply":
      ctx.globalCompositeOperation = "multiply";
      break;
    case "screen":
      ctx.globalCompositeOperation = "screen";
      break;
    case "overlay":
      ctx.globalCompositeOperation = "overlay";
      break;
    case "soft-light":
      ctx.globalCompositeOperation = "soft-light";
      break;
    case "hard-light":
      ctx.globalCompositeOperation = "hard-light";
      break;
    default:
      ctx.globalCompositeOperation = "source-over";
  }

  // Draw overlay with opacity
  ctx.globalAlpha = opacity;
  ctx.drawImage(overlayCanvas, 0, 0, result.width, result.height);

  // Reset
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";

  return result;
}
