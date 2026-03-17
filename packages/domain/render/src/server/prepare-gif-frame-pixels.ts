export function prepareGifFramePixels(
  rgba: Uint8ClampedArray,
  bgRgb: [number, number, number],
  preserveTransparency: boolean,
): Uint8ClampedArray {
  // Always copy incoming frame data so no caller can hold a mutable live ImageData view.
  const frame = new Uint8ClampedArray(rgba);

  if (preserveTransparency) {
    return frame;
  }

  let hasTransparency = false;
  for (let i = 3; i < frame.length; i += 4) {
    if (frame[i] !== 255) {
      hasTransparency = true;
      break;
    }
  }
  if (!hasTransparency) {
    return frame;
  }

  const [bgR, bgG, bgB] = bgRgb;
  const flattened = new Uint8ClampedArray(frame.length);
  for (let i = 0; i < frame.length; i += 4) {
    const a = frame[i + 3];
    if (a <= 0) {
      flattened[i] = bgR;
      flattened[i + 1] = bgG;
      flattened[i + 2] = bgB;
      flattened[i + 3] = 255;
      continue;
    }
    if (a >= 255) {
      flattened[i] = frame[i];
      flattened[i + 1] = frame[i + 1];
      flattened[i + 2] = frame[i + 2];
      flattened[i + 3] = 255;
      continue;
    }

    const alpha = a / 255;
    const invAlpha = 1 - alpha;
    flattened[i] = Math.round(frame[i] * alpha + bgR * invAlpha);
    flattened[i + 1] = Math.round(frame[i + 1] * alpha + bgG * invAlpha);
    flattened[i + 2] = Math.round(frame[i + 2] * alpha + bgB * invAlpha);
    flattened[i + 3] = 255;
  }

  return flattened;
}
