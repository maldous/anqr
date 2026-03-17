export async function resolveImageSource(
  src: HTMLCanvasElement,
): Promise<{ source: CanvasImageSource; bitmap: ImageBitmap | null } | null> {
  if (typeof createImageBitmap === "function" && typeof src.toBlob === "function") {
    const blob = await new Promise<Blob | null>((resolve) => {
      src.toBlob((nextBlob) => resolve(nextBlob), "image/png");
    });

    if (!blob) {
      throw new Error("final-raster blob encode failed");
    }

    const bitmap = await createImageBitmap(blob);
    return { source: bitmap, bitmap };
  }

  if (typeof Image !== "undefined" && typeof src.toDataURL === "function") {
    const pngDataUrl = src.toDataURL("image/png");
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("final-raster roundtrip failed"));
      el.src = pngDataUrl;
    });
    return { source: img, bitmap: null };
  }

  return null;
}
