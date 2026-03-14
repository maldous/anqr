export function computeCanvasSizing(
  isGeneratorSource: boolean,
  generatedCanvas: HTMLCanvasElement | OffscreenCanvas | null | undefined,
  moduleCount: number,
  marginModules: number,
  renderStateModulePx: number
) {
  if (isGeneratorSource && generatedCanvas) {
    const size = generatedCanvas.width;
    return {
      modulePx: Math.max(1, Math.floor(size / (moduleCount + marginModules * 2))),
      size,
    };
  }

  const totalModules = moduleCount + marginModules * 2;
  const modulePx = Math.max(3, Math.floor(300 / totalModules));
  return { modulePx, size: totalModules * modulePx };
}
