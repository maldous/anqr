export function tintScanlinePixel(
  data: Uint8ClampedArray,
  i: number,
  intensity: number,
  scanColor: [number, number, number],
  trailColor: [number, number, number]
): void {
  const r = data[i],
    g = data[i + 1],
    b = data[i + 2];
  const isDark = (r + g + b) / 3 < 128;

  if (isDark) {
    data[i] = Math.min(255, r + scanColor[0] * intensity * 0.8);
    data[i + 1] = Math.min(255, g + scanColor[1] * intensity * 0.8);
    data[i + 2] = Math.min(255, b + scanColor[2] * intensity * 0.8);
  } else {
    data[i] = Math.max(0, r - trailColor[0] * intensity * 0.3);
    data[i + 1] = Math.max(0, g - trailColor[1] * intensity * 0.3);
    data[i + 2] = Math.max(0, b - trailColor[2] * intensity * 0.3);
  }
}

