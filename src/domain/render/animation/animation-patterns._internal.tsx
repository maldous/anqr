import type { AnimationPattern, InterpolationMode } from './animation-patterns.types';
// ============================================
// INTERNAL HELPERS
// ============================================

function blendFramePixels(
  sourceA: Uint8ClampedArray,
  sourceB: Uint8ClampedArray,
  blend: number,
  output: Uint8ClampedArray
): void {
  for (let p = 0; p < sourceA.length; p += 4) {
    output[p] = Math.round(sourceA[p] * (1 - blend) + sourceB[p] * blend);
    output[p + 1] = Math.round(sourceA[p + 1] * (1 - blend) + sourceB[p + 1] * blend);
    output[p + 2] = Math.round(sourceA[p + 2] * (1 - blend) + sourceB[p + 2] * blend);
    output[p + 3] = Math.round(sourceA[p + 3] * (1 - blend) + sourceB[p + 3] * blend);
  }
}

export function applyEasing(t: number, mode: InterpolationMode): number {
  switch (mode) {
    case 'ease':
      return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
    case 'ease-in':
      return t * t;
    case 'ease-out':
      return 1 - (1 - t) * (1 - t);
    case 'ease-in-out':
      return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
    default:
      return t;
  }
}

export type PatternFrameApplier = (data: Uint8ClampedArray) => void;

export const TAU = Math.PI * 2;

export const PI4 = Math.PI * 4;

export function clampToByte(value: number): number {
  if (value <= 0) return 0;
  if (value >= 255) return 255;
  return Math.round(value);
}

export function applyUniformBrightness(data: Uint8ClampedArray, factor: number): void {
  for (let i = 0; i < data.length; i += 4) {
    data[i] = clampToByte(data[i] * factor);
    data[i + 1] = clampToByte(data[i + 1] * factor);
    data[i + 2] = clampToByte(data[i + 2] * factor);
  }
}

export function buildWaveApplier(time: number, width: number, height: number): PatternFrameApplier {
  const waveFactors = new Float32Array(width);
  const waveScale = PI4 / Math.max(1, width);
  for (let x = 0; x < width; x++) {
    waveFactors[x] = 0.7 + 0.3 * Math.sin(time + x * waveScale);
  }
  return (data) => {
    for (let y = 0; y < height; y++) {
      let i = y * width * 4;
      for (let x = 0; x < width; x++, i += 4) {
        const factor = waveFactors[x];
        data[i] = clampToByte(data[i] * factor);
        data[i + 1] = clampToByte(data[i + 1] * factor);
        data[i + 2] = clampToByte(data[i + 2] * factor);
      }
    }
  };
}

export function buildSinCosLUT(
  time: number,
  seed: number,
  width: number,
  height: number,
  pattern: 'shimmer' | 'drift'
): {
  colSin: Float32Array;
  colCos: Float32Array;
  rowSin: Float32Array;
  rowCos: Float32Array;
} {
  const colSin = new Float32Array(width);
  const colCos = new Float32Array(width);
  const rowSin = new Float32Array(height);
  const rowCos = new Float32Array(height);

  if (pattern === 'shimmer') {
    const denom = Math.max(1, width + height);
    const shimmerScale = PI4 / denom;
    const base = time + seed;
    for (let x = 0; x < width; x++) {
      const angle = base + x * shimmerScale;
      colSin[x] = Math.sin(angle);
      colCos[x] = Math.cos(angle);
    }
    for (let y = 0; y < height; y++) {
      const angle = y * shimmerScale;
      rowSin[y] = Math.sin(angle);
      rowCos[y] = Math.cos(angle);
    }
  } else {
    const driftX = Math.sin(time + seed) * 0.1;
    const driftY = Math.cos(time + seed) * 0.1;
    const phase = (driftX + driftY) * TAU;
    const invWidth = width > 0 ? 1 / width : 0;
    const invHeight = height > 0 ? 1 / height : 0;
    for (let x = 0; x < width; x++) {
      const angle = x * invWidth * TAU + phase;
      colSin[x] = Math.sin(angle);
      colCos[x] = Math.cos(angle);
    }
    for (let y = 0; y < height; y++) {
      const angle = y * invHeight * TAU;
      rowSin[y] = Math.sin(angle);
      rowCos[y] = Math.cos(angle);
    }
  }

  return { colSin, colCos, rowSin, rowCos };
}

export function buildSinCosApplier(
  lut: ReturnType<typeof buildSinCosLUT>,
  width: number,
  height: number,
  baseScale: number,
  amplitudeScale: number
): PatternFrameApplier {
  return (data) => {
    for (let y = 0; y < height; y++) {
      const rs = lut.rowSin[y];
      const rc = lut.rowCos[y];
      let i = y * width * 4;
      for (let x = 0; x < width; x++, i += 4) {
        const v = lut.colSin[x] * rc + lut.colCos[x] * rs;
        const factor = baseScale + amplitudeScale * v;
        data[i] = clampToByte(data[i] * factor);
        data[i + 1] = clampToByte(data[i + 1] * factor);
        data[i + 2] = clampToByte(data[i + 2] * factor);
      }
    }
  };
}

export function buildPatternFrameApplier(
  pattern: AnimationPattern,
  progress: number,
  speed: number,
  seed: number,
  width: number,
  height: number
): PatternFrameApplier {
  const time = progress * speed * TAU;

  switch (pattern) {
    case 'pulse': {
      const factor = 0.7 + 0.3 * Math.sin(time);
      return (data) => {
        applyUniformBrightness(data, factor);
      };
    }

    case 'wave':
      return buildWaveApplier(time, width, height);

    case 'scanline': {
      const scanY = ((progress * speed) % 1) * height;
      const rowFactors = new Float32Array(height);
      for (let y = 0; y < height; y++) {
        rowFactors[y] = Math.abs(y - scanY) < 20 ? 1.3 : 1;
      }
      return (data) => {
        for (let y = 0; y < height; y++) {
          const factor = rowFactors[y];
          let i = y * width * 4;
          for (let x = 0; x < width; x++, i += 4) {
            data[i] = clampToByte(data[i] * factor);
            data[i + 1] = clampToByte(data[i + 1] * factor);
            data[i + 2] = clampToByte(data[i + 2] * factor);
          }
        }
      };
    }

    case 'shimmer': {
      const lut = buildSinCosLUT(time, seed, width, height, 'shimmer');
      return buildSinCosApplier(lut, width, height, 0.8, 0.2);
    }

    case 'drift': {
      const lut = buildSinCosLUT(time, seed, width, height, 'drift');
      return buildSinCosApplier(lut, width, height, 0.9, 0.1);
    }

    case 'color_cycle': {
      const angle = progress * speed * TAU;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      return (data) => {
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          data[i] = clampToByte(r * cos + g * sin);
          data[i + 1] = clampToByte(g * cos + b * sin);
          data[i + 2] = clampToByte(b * cos + r * sin);
        }
      };
    }

    default:
      return () => {};
  }
}

export function applyPatternToImageData(
  imageData: ImageData,
  pattern: AnimationPattern,
  progress: number,
  speed: number,
  seed: number
): void {
  const { data, width, height } = imageData;
  const applyForFrame = buildPatternFrameApplier(pattern, progress, speed, seed, width, height);
  applyForFrame(data);
}

export { blendFramePixels };
