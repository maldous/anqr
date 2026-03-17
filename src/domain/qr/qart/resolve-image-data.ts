export function resolveImageData(
  image: ImageData | HTMLCanvasElement | OffscreenCanvas,
): ImageData | null {
  const isCanvasLike = (value: unknown): value is HTMLCanvasElement | OffscreenCanvas =>
    !!value &&
    typeof (value as { getContext?: unknown }).getContext === "function" &&
    typeof (value as { width?: unknown }).width === "number" &&
    typeof (value as { height?: unknown }).height === "number";

  const isImageDataLike = (
    value: unknown,
  ): value is { width: number; height: number; data: Uint8ClampedArray | ArrayLike<number> } => {
    if (!value) return false;
    const candidate = value as {
      width?: unknown;
      height?: unknown;
      data?: unknown;
    };
    if (typeof candidate.width !== "number" || typeof candidate.height !== "number") return false;
    if (candidate.data == null || typeof candidate.data === "function") return false;

    const data = candidate.data as { length?: unknown };
    if (typeof data.length !== "number") return false;
    if (data.length < candidate.width * candidate.height * 4) return false;
    return true;
  };

  if (typeof ImageData !== "undefined" && image instanceof ImageData) {
    return image;
  }
  if (isCanvasLike(image)) {
    const ctx = image.getContext("2d");
    if (!ctx) return null;
    return ctx.getImageData(0, 0, image.width, image.height);
  }
  if (isImageDataLike(image)) {
    const candidate = image;
    const data = candidate.data;
    return {
      data:
        data instanceof Uint8ClampedArray ? data : new Uint8ClampedArray(data as ArrayLike<number>),
      width: candidate.width,
      height: candidate.height,
    } as ImageData;
  }
  return null;
}
