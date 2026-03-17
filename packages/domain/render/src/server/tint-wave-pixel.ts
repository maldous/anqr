export function tintWavePixel(
  data: Uint8ClampedArray,
  i: number,
  waveColor: [number, number, number],
  waveIntensity: number,
): void {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  const brightness = (r + g + b) / 3;
  if (brightness < 128) {
    const tintAmount = waveIntensity * 0.62;
    data[i] = Math.min(255, r + waveColor[0] * tintAmount);
    data[i + 1] = Math.min(255, g + waveColor[1] * tintAmount);
    data[i + 2] = Math.min(255, b + waveColor[2] * tintAmount);
  } else {
    const darkenAmount = waveIntensity * 0.15;
    data[i] = Math.round(r * (1 - darkenAmount));
    data[i + 1] = Math.round(g * (1 - darkenAmount));
    data[i + 2] = Math.round(b * (1 - darkenAmount));
  }
}
