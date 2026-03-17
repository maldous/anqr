/**
 * Convert canvas to Blob
 */
export async function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: string = "image/png",
  quality: number = 0.9,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Failed to create blob"))),
      format,
      quality,
    );
  });
}
