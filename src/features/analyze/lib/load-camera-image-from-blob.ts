export function loadCameraImageFromBlob(blob: Blob): Promise<{
  source: ImageBitmap | HTMLImageElement;
  sourceWidth: number;
  sourceHeight: number;
}> {
  if (typeof createImageBitmap === 'function') {
    return createImageBitmap(blob).then((bitmap) => ({
      source: bitmap,
      sourceWidth: bitmap.width,
      sourceHeight: bitmap.height,
    }));
  }
  const objectUrl = URL.createObjectURL(blob);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ source: img, sourceWidth: img.naturalWidth, sourceHeight: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to decode camera image'));
    };
    img.src = objectUrl;
  });
}
