export function preserveFixedDarkModule(
  ctx: CanvasRenderingContext2D,
  marginPx: number,
  moduleCount: number,
  effectiveModuleSize: number,
  darkFill: string | CanvasGradient
): void {
  const dmRow = moduleCount - 8;
  const dmCol = 8;
  if (dmRow >= 0 && dmRow < moduleCount && dmCol >= 0 && dmCol < moduleCount) {
    ctx.fillStyle = darkFill;
    ctx.fillRect(
      marginPx + dmCol * effectiveModuleSize,
      marginPx + dmRow * effectiveModuleSize,
      effectiveModuleSize,
      effectiveModuleSize
    );
  }
}
