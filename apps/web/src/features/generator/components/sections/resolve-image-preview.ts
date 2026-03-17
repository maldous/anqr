export function resolveImagePreview(
  file: File | null,
  url: string,
  setImagePreview: (v: string | null) => void,
  setPreviewImageSize: (v: { width: number; height: number } | null) => void,
): (() => void) | undefined {
  if (file) {
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
    setPreviewImageSize(null);
    return () => URL.revokeObjectURL(objectUrl);
  }
  if (url) {
    setImagePreview(url);
    setPreviewImageSize(null);
  } else {
    setImagePreview(null);
    setPreviewImageSize(null);
  }
  return undefined;
}
