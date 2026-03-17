import { drawShapeMaskModule } from "./draw-shape-mask-module";
import { isStructuralPatternModule } from "./is-structural-pattern-module";
import type { ShapeMaskCtx } from "../scaled-render-types";

export async function applyModuleShapeMask(smctx: ShapeMaskCtx): Promise<void> {
  const {
    ctx,
    size,
    marginPx,
    moduleCount,
    effectiveModuleSize,
    qr,
    config,
    effectiveBgColor,
    getPatternFlags,
    createCanvasFn,
    releaseCanvasFn,
  } = smctx;
  const moduleStyleName = config.moduleStyle || "square";
  if (moduleStyleName === "square" || moduleStyleName === "connected") return;
  const maskCanvas = await createCanvasFn(size, size);
  const maskCtx = maskCanvas.getContext("2d") as CanvasRenderingContext2D;
  maskCtx.imageSmoothingEnabled = false;
  maskCtx.fillStyle = "white";
  maskCtx.fillRect(0, 0, size, marginPx);
  maskCtx.fillRect(0, marginPx, marginPx, size - marginPx);
  const qrRight = marginPx + moduleCount * effectiveModuleSize;
  maskCtx.fillRect(qrRight, 0, Math.max(0, size - qrRight), size);
  maskCtx.fillRect(0, marginPx + moduleCount * effectiveModuleSize, size, size);
  const cornerRadius = config.cornerRadius || 0;
  const dotRotation = config.dotRotationDeg || 0;
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      const mx = marginPx + col * effectiveModuleSize;
      const my = marginPx + row * effectiveModuleSize;
      if (isStructuralPatternModule(getPatternFlags(row, col)) || !qr.isDark(row, col)) {
        maskCtx.fillStyle = "white";
        maskCtx.fillRect(mx, my, effectiveModuleSize, effectiveModuleSize);
        continue;
      }
      drawShapeMaskModule(
        maskCtx,
        mx,
        my,
        effectiveModuleSize,
        config,
        moduleStyleName,
        cornerRadius,
        dotRotation,
      );
    }
  }
  ctx.globalCompositeOperation = "destination-in";
  ctx.drawImage(maskCanvas as CanvasImageSource, 0, 0);
  ctx.globalCompositeOperation = "destination-over";
  if (!config.transparentBg) {
    ctx.fillStyle = effectiveBgColor;
    ctx.fillRect(0, 0, size, size);
  }
  ctx.globalCompositeOperation = "source-over";
  if (releaseCanvasFn) releaseCanvasFn(maskCanvas);
}
