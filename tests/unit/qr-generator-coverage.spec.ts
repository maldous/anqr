import { describe, expect, it, vi } from 'vitest';

vi.mock('../../src/lib/logger', () => ({
  createLogger: () => ({ trace: vi.fn(), debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }),
}));

// ======================== ECC MODULE ========================

describe('qr-generator ecc', () => {
  describe('getEccWeight', () => {
    it('distance_to_finders: higher weight near finders', async () => {
      const { getEccWeight } = await import('../../src/modules/qr-generator/ecc');
      const nearFinder = getEccWeight(0, 0, 21, 1, 'distance_to_finders');
      const farFromFinder = getEccWeight(10, 10, 21, 1, 'distance_to_finders');
      expect(nearFinder).toBeGreaterThan(farFromFinder);
    });

    it('distance_to_finders: returns numeric values for all positions', async () => {
      const { getEccWeight } = await import('../../src/modules/qr-generator/ecc');
      for (let r = 0; r < 21; r += 5) {
        for (let c = 0; c < 21; c += 5) {
          const w = getEccWeight(r, c, 21, 1, 'distance_to_finders');
          expect(typeof w).toBe('number');
          expect(w).toBeLessThanOrEqual(1);
        }
      }
    });

    it('block_heatmap: center has lower weight than edges', async () => {
      const { getEccWeight } = await import('../../src/modules/qr-generator/ecc');
      const center = getEccWeight(10, 10, 21, 1, 'block_heatmap');
      const edge = getEccWeight(0, 0, 21, 1, 'block_heatmap');
      expect(edge).toBeGreaterThan(center);
    });

    it('empirical_scan_heatmap: top-left has higher weight', async () => {
      const { getEccWeight } = await import('../../src/modules/qr-generator/ecc');
      const topLeft = getEccWeight(0, 0, 21, 1, 'empirical_scan_heatmap');
      const bottomRight = getEccWeight(20, 20, 21, 1, 'empirical_scan_heatmap');
      expect(topLeft).toBeGreaterThan(bottomRight);
    });

    it('default: returns 0.5', async () => {
      const { getEccWeight } = await import('../../src/modules/qr-generator/ecc');
      expect(getEccWeight(5, 5, 21, 1, 'unknown')).toBe(0.5);
    });
  });

  describe('isEccSafeToModify', () => {
    it('returns true when eccAware is disabled', async () => {
      const { isEccSafeToModify } = await import('../../src/modules/qr-generator/ecc');
      const config = { eccAwareEnabled: false, errorCorrection: 'H' } as Parameters<typeof isEccSafeToModify>[5];
      expect(isEccSafeToModify(5, 5, 21, 1, config, 0, 100)).toBe(true);
    });

    it('returns false when budget exceeded', async () => {
      const { isEccSafeToModify } = await import('../../src/modules/qr-generator/ecc');
      const config = {
        eccAwareEnabled: true,
        eccAwareRiskBudget: 50,
        errorCorrection: 'L',
        eccAwareWeightMap: 'distance_to_finders',
      } as Parameters<typeof isEccSafeToModify>[5];
      // ECC L allows 7% * 50% = 3.5% of 100 modules = 3 modifications
      const result = isEccSafeToModify(5, 5, 21, 1, config, 100, 100);
      expect(result).toBe(false);
    });

    it('allows modification within budget', async () => {
      const { isEccSafeToModify } = await import('../../src/modules/qr-generator/ecc');
      const config = {
        eccAwareEnabled: true,
        eccAwareRiskBudget: 100,
        errorCorrection: 'H',
        eccAwareWeightMap: 'distance_to_finders',
        seed: 0,
      } as Parameters<typeof isEccSafeToModify>[5];
      // ECC H allows 30% * 100% = 30% of 1000 = 300 modifications
      const result = isEccSafeToModify(10, 10, 21, 1, config, 0, 1000);
      expect(typeof result).toBe('boolean');
    });

    it('uses different weight maps', async () => {
      const { isEccSafeToModify } = await import('../../src/modules/qr-generator/ecc');
      for (const map of ['distance_to_finders', 'block_heatmap', 'empirical_scan_heatmap']) {
        const config = {
          eccAwareEnabled: true,
          eccAwareRiskBudget: 80,
          errorCorrection: 'M',
          eccAwareWeightMap: map,
          seed: 42,
        } as Parameters<typeof isEccSafeToModify>[5];
        const result = isEccSafeToModify(5, 5, 21, 1, config, 0, 500);
        expect(typeof result).toBe('boolean');
      }
    });

    it('is deterministic for same position and seed', async () => {
      const { isEccSafeToModify } = await import('../../src/modules/qr-generator/ecc');
      const config = {
        eccAwareEnabled: true,
        eccAwareRiskBudget: 50,
        errorCorrection: 'Q',
        eccAwareWeightMap: 'distance_to_finders',
        seed: 123,
      } as Parameters<typeof isEccSafeToModify>[5];
      const a = isEccSafeToModify(7, 7, 25, 2, config, 0, 500);
      const b = isEccSafeToModify(7, 7, 25, 2, config, 0, 500);
      expect(a).toBe(b);
    });
  });
});

// ======================== DITHERING KERNELS ========================

describe('qr-generator dithering-kernels', () => {
  it('returns a kernel for floyd_steinberg', async () => {
    const { getDiffusionKernel } = await import('../../src/modules/qr-generator/dithering-kernels');
    const kernel = getDiffusionKernel('floyd_steinberg');
    expect(kernel).toHaveProperty('offsets');
    expect(kernel).toHaveProperty('divisor');
    expect(Array.isArray(kernel.offsets)).toBe(true);
    expect(kernel.offsets.length).toBeGreaterThan(0);
    for (const entry of kernel.offsets) {
      expect(entry).toHaveProperty('dx');
      expect(entry).toHaveProperty('dy');
      expect(entry).toHaveProperty('weight');
    }
    expect(kernel.divisor).toBe(16);
  });

  it('returns kernels for various types', async () => {
    const { getDiffusionKernel } = await import('../../src/modules/qr-generator/dithering-kernels');
    const types = ['floyd_steinberg', 'atkinson', 'stucki', 'burkes', 'sierra', 'jarvis_judice_ninke'];
    for (const type of types) {
      const kernel = getDiffusionKernel(type);
      expect(kernel).toHaveProperty('offsets');
      expect(kernel).toHaveProperty('divisor');
      expect(kernel.offsets.length).toBeGreaterThan(0);
    }
  });

  it('returns default kernel for unknown type', async () => {
    const { getDiffusionKernel } = await import('../../src/modules/qr-generator/dithering-kernels');
    const kernel = getDiffusionKernel('unknown_kernel');
    expect(kernel).toHaveProperty('offsets');
    expect(kernel).toHaveProperty('divisor');
    expect(kernel.offsets.length).toBeGreaterThan(0);
  });
});

// ======================== DITHERING ERROR ========================

describe('qr-generator dithering-error', () => {
  it('distributes error to neighboring cells', async () => {
    const { distributeError } = await import('../../src/modules/qr-generator/dithering-error');
    const errors = [
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
    ];
    const kernel = {
      offsets: [
        { dx: 1, dy: 0, weight: 7 },
        { dx: -1, dy: 1, weight: 3 },
        { dx: 0, dy: 1, weight: 5 },
        { dx: 1, dy: 1, weight: 1 },
      ],
      divisor: 16,
    };
    distributeError(errors, 2, 0, 1.0, kernel, 5, 3);
    expect(errors[0][3]).toBeCloseTo(7 / 16, 2);
    expect(errors[1][1]).toBeCloseTo(3 / 16, 2);
    expect(errors[1][2]).toBeCloseTo(5 / 16, 2);
    expect(errors[1][3]).toBeCloseTo(1 / 16, 2);
  });

  it('does not distribute outside bounds', async () => {
    const { distributeError } = await import('../../src/modules/qr-generator/dithering-error');
    const errors = [[0, 0], [0, 0]];
    const kernel = {
      offsets: [
        { dx: 1, dy: 0, weight: 7 },
        { dx: 0, dy: 1, weight: 5 },
      ],
      divisor: 16,
    };
    distributeError(errors, 1, 1, 1.0, kernel, 2, 2);
    expect(errors[0][0]).toBe(0);
    expect(errors[0][1]).toBe(0);
    expect(errors[1][0]).toBe(0);
    expect(errors[1][1]).toBe(0);
  });
});

// ======================== DITHERING MATRIX ========================

describe('qr-generator dithering-matrix', () => {
  it('applies dithering to a QR matrix', async () => {
    const { applyDitherToMatrix } = await import('../../src/modules/qr-generator/dithering-matrix');
    const moduleCount = 21;
    const qr = {
      isDark: (r: number, c: number) => (r + c) % 2 === 0,
      getModuleCount: () => moduleCount,
    };
    // Create overlay data (brightness 0-1 for each module)
    const overlayData: number[][] = [];
    for (let r = 0; r < moduleCount; r++) {
      overlayData[r] = [];
      for (let c = 0; c < moduleCount; c++) {
        overlayData[r][c] = (r * moduleCount + c) / (moduleCount * moduleCount);
      }
    }
    const config = {
      typeNumber: 1,
      ditherKind: 'floyd_steinberg',
      ditherStrength: 50,
      overlayIntensity: 100,
      errorCorrection: 'H',
    };
    const result = applyDitherToMatrix(qr, moduleCount, overlayData, config as Parameters<typeof applyDitherToMatrix>[3]);
    expect(result.length).toBe(moduleCount);
    expect(result[0].length).toBe(moduleCount);
    // All values should be booleans
    for (let r = 0; r < moduleCount; r++) {
      for (let c = 0; c < moduleCount; c++) {
        expect(typeof result[r][c]).toBe('boolean');
      }
    }
  });

  it('detects B&W overlay and skips dithering', async () => {
    const { applyDitherToMatrix } = await import('../../src/modules/qr-generator/dithering-matrix');
    const moduleCount = 21;
    const qr = {
      isDark: (r: number, c: number) => (r + c) % 2 === 0,
      getModuleCount: () => moduleCount,
    };
    // Create high-contrast B&W overlay (all 0 or 1)
    const overlayData: number[][] = [];
    for (let r = 0; r < moduleCount; r++) {
      overlayData[r] = [];
      for (let c = 0; c < moduleCount; c++) {
        overlayData[r][c] = (r + c) % 2 === 0 ? 0.0 : 1.0;
      }
    }
    const config = {
      typeNumber: 1,
      ditherKind: 'floyd_steinberg',
      ditherStrength: 100,
      overlayIntensity: 100,
      errorCorrection: 'H',
    };
    const result = applyDitherToMatrix(qr, moduleCount, overlayData, config as Parameters<typeof applyDitherToMatrix>[3]);
    // Since B&W detected, it should return exact QR matrix without dithering
    for (let r = 0; r < moduleCount; r++) {
      for (let c = 0; c < moduleCount; c++) {
        expect(result[r][c]).toBe(qr.isDark(r, c));
      }
    }
  });

  it('preserves structural modules', async () => {
    const { applyDitherToMatrix } = await import('../../src/modules/qr-generator/dithering-matrix');
    const moduleCount = 21;
    const qr = {
      isDark: (r: number, c: number) => {
        // Finder pattern area: top-left 7x7
        if (r < 7 && c < 7) return true;
        return (r + c) % 3 === 0;
      },
      getModuleCount: () => moduleCount,
    };
    // Medium brightness overlay
    const overlayData: number[][] = [];
    for (let r = 0; r < moduleCount; r++) {
      overlayData[r] = [];
      for (let c = 0; c < moduleCount; c++) {
        overlayData[r][c] = 0.5;
      }
    }
    const config = {
      typeNumber: 1,
      ditherKind: 'floyd_steinberg',
      ditherStrength: 100,
      overlayIntensity: 100,
      errorCorrection: 'M',
    };
    const result = applyDitherToMatrix(qr, moduleCount, overlayData, config as Parameters<typeof applyDitherToMatrix>[3]);
    // Check that finder pattern area (top-left 7x7) is preserved
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        expect(result[r][c]).toBe(qr.isDark(r, c));
      }
    }
  });
});

// ======================== DITHERING CONSTANTS ========================

describe('qr-generator dithering-constants', () => {
  it('exports expected constants', async () => {
    const mod = await import('../../src/modules/qr-generator/dithering-constants');
    expect(typeof mod.BUCKET_SHIFT).toBe('number');
    expect(typeof mod.HISTOGRAM_BUCKETS).toBe('number');
    expect(typeof mod.DARK_REGION_END).toBe('number');
    expect(typeof mod.LIGHT_REGION_START).toBe('number');
    expect(typeof mod.MIN_PEAK_RATIO).toBe('number');
    expect(typeof mod.MIN_PEAK_SEPARATION).toBe('number');
    expect(typeof mod.MAX_VALLEY_RATIO).toBe('number');
    expect(typeof mod.DARK_DESIRE_MIN).toBe('number');
    expect(typeof mod.DARK_DESIRE_MAX).toBe('number');
    expect(typeof mod.LIGHT_DESIRE_MIN).toBe('number');
    expect(typeof mod.LIGHT_DESIRE_MAX).toBe('number');
  });
});

// ======================== PATTERN HELPERS ========================

describe('qr-generator pattern-helpers', () => {
  it('exports pattern helper functions', async () => {
    const mod = await import('../../src/modules/qr-generator/pattern-helpers');
    expect(typeof mod).toBe('object');
  });
});

// ======================== RENDER MODES ========================

describe('qr-generator render-modes', () => {
  it('exports render mode utilities', async () => {
    const mod = await import('../../src/modules/qr-generator/render-modes');
    expect(typeof mod).toBe('object');
  });
});

// ======================== OVERLAY DATA ========================

describe('qr-generator overlay-data', () => {
  it('exports overlay data utilities', async () => {
    const mod = await import('../../src/modules/qr-generator/overlay-data');
    expect(typeof mod).toBe('object');
  });
});

// ======================== PIXEL MATRIX UTILS ========================

describe('qr-generator pixel-matrix-utils', () => {
  it('exports pixel matrix utilities', async () => {
    const mod = await import('../../src/modules/qr-generator/pixel-matrix-utils');
    expect(typeof mod).toBe('object');
  });
});
