export async function canvasToPngDataUrl(canvas: HTMLCanvasElement): Promise<string> {
  if (typeof canvas.toBlob !== "function") {
    return canvas.toDataURL("image/png");
  }

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((nextBlob) => resolve(nextBlob), "image/png");
  });
  if (!blob) {
    return canvas.toDataURL("image/png");
  }

  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("Failed to read PNG data URL"));
    };
    reader.onerror = () => reject(new Error("Failed to encode PNG data URL"));
    reader.readAsDataURL(blob);
  });
}
