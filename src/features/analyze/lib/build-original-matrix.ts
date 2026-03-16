export function buildOriginalMatrix(
  isGeneratorSource: boolean,
  generatedCanvas: HTMLCanvasElement | OffscreenCanvas | null | undefined,
  moduleCount: number,
  marginModules: number,
  modulePx: number,
): boolean[][] | null {
  if (!(isGeneratorSource && generatedCanvas)) {
    return null;
  }

  const gctx = generatedCanvas.getContext("2d") as CanvasRenderingContext2D | null;
  if (!gctx) {
    return null;
  }

  const pixels = gctx.getImageData(0, 0, generatedCanvas.width, generatedCanvas.height).data;
  return Array.from({ length: moduleCount }, (_, row) =>
    Array.from({ length: moduleCount }, (_, col) => {
      const x = Math.max(
        0,
        Math.min(generatedCanvas.width - 1, Math.floor((marginModules + col + 0.5) * modulePx)),
      );
      const y = Math.max(
        0,
        Math.min(generatedCanvas.height - 1, Math.floor((marginModules + row + 0.5) * modulePx)),
      );
      const pixelIndex = (y * generatedCanvas.width + x) * 4;
      const lum = (pixels[pixelIndex] + pixels[pixelIndex + 1] + pixels[pixelIndex + 2]) / 3;
      return pixels[pixelIndex + 3] > 16 && lum < 128;
    }),
  );
}
