export function computeMarginModules(
  isGeneratorSource: boolean,
  generatedCanvas: HTMLCanvasElement | OffscreenCanvas | null | undefined,
  moduleCount: number,
  renderStateModulePx: number,
  quietZoneTop: number | undefined
): number {
  if (isGeneratorSource && generatedCanvas) {
    const modulePxFromStore = Math.max(1, Math.floor(renderStateModulePx || 1));
    const totalModules = Math.round(generatedCanvas.width / modulePxFromStore);
    return Math.max(0, Math.floor((totalModules - moduleCount) / 2));
  }

  return Math.max(4, quietZoneTop ?? 4);
}
