export async function downscaleCameraBlob(blob: Blob, maxEdge: number): Promise<Blob> {
  if (typeof createImageBitmap !== "function") return blob;
  const sourceBitmap = await createImageBitmap(blob);
  const sourceMaxEdge = Math.max(sourceBitmap.width, sourceBitmap.height);
  if (sourceMaxEdge <= maxEdge) {
    sourceBitmap.close();
    return blob;
  }
  const scale = maxEdge / sourceMaxEdge;
  const targetWidth = Math.max(1, Math.round(sourceBitmap.width * scale));
  const targetHeight = Math.max(1, Math.round(sourceBitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d", {
    willReadFrequently: true,
  } as CanvasRenderingContext2DSettings | undefined);
  if (!ctx) {
    sourceBitmap.close();
    return blob;
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(sourceBitmap, 0, 0, targetWidth, targetHeight);
  const resizedBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (value) => {
        if (value) resolve(value);
        else reject(new Error("Could not encode resized camera image"));
      },
      "image/jpeg",
      0.88,
    );
  });
  sourceBitmap.close();
  return resizedBlob;
}
