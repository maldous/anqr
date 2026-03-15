import type { AnimationPattern } from './animation-patterns.types';
import { TAU } from './tau';
import { clampToByte } from './clamp-to-byte';
import { applyUniformBrightness } from './apply-uniform-brightness';
import { buildWaveApplier } from './build-wave-applier';
import { buildSinCosLUT } from './build-sin-cos-lut';
import { buildSinCosApplier } from './build-sin-cos-applier';
import type { PatternFrameApplier } from './pattern-frame-applier';

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
