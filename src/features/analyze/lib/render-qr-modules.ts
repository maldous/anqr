import { createQRInstance } from "@/modules/qr-encoder";

export function renderQRModules(
  ctx: CanvasRenderingContext2D,
  qr: ReturnType<typeof createQRInstance>,
  moduleCount: number,
  marginModules: number,
  modulePx: number,
) {
  for (let row = 0; row < moduleCount; row += 1) {
    for (let col = 0; col < moduleCount; col += 1) {
      if (!qr.isDark(row, col)) {
        continue;
      }

      ctx.fillRect(
        (marginModules + col) * modulePx,
        (marginModules + row) * modulePx,
        modulePx,
        modulePx,
      );
    }
  }
}
