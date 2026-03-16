import type React from "react";
import type { PreviewImageSize } from "./preview-image-size.type";

export function handlePreviewImageLoad(
  e: React.SyntheticEvent<HTMLImageElement>,
  setPreviewImageSize: (v: PreviewImageSize | null) => void,
): void {
  const image = e.currentTarget;
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  if (width > 0 && height > 0) {
    setPreviewImageSize({ width, height });
  }
}
