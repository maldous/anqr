export function closeBitmapSource(source: ImageBitmap | HTMLImageElement): void {
  if ('close' in source && typeof source.close === 'function') source.close();
}
