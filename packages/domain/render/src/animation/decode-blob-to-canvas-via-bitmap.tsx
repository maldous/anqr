export async function decodeBlobToCanvasViaBitmap(blob: Blob): Promise<HTMLCanvasElement | null> {
  if (typeof createImageBitmap !== "function") {
    return null;
  }

  try {
    const bitmap = await createImageBitmap(blob);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(bitmap, 0, 0);
    }
    if (typeof bitmap.close === "function") {
      bitmap.close();
    }
    return canvas;
  } catch {
    return null;
  }
}
