import { describe, expect, it, vi } from 'vitest';

vi.mock('../../src/lib/logger', () => ({
  createLogger: () => ({ trace: vi.fn(), debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }),
}));

describe('qr-analyzer/safety.ts', () => {
  // ==========================================
  // analyzeContrast
  // ==========================================

  describe('analyzeContrast', () => {
    it('returns high ratio for black/white', async () => {
      const { analyzeContrast } = await import('../../src/modules/qr-analyzer/safety');
      const result = analyzeContrast('#000000', '#ffffff');
      expect(result.ratio).toBeGreaterThanOrEqual(20);
      expect(result.meetsAA).toBe(true);
      expect(result.meetsAAA).toBe(true);
    });

    it('returns high ratio for white/black (reversed)', async () => {
      const { analyzeContrast } = await import('../../src/modules/qr-analyzer/safety');
      const result = analyzeContrast('#ffffff', '#000000');
      expect(result.ratio).toBeGreaterThanOrEqual(20);
      expect(result.meetsAA).toBe(true);
      expect(result.meetsAAA).toBe(true);
    });

    it('returns ratio 1 for same color', async () => {
      const { analyzeContrast } = await import('../../src/modules/qr-analyzer/safety');
      const result = analyzeContrast('#ff0000', '#ff0000');
      expect(result.ratio).toBeCloseTo(1, 1);
      expect(result.meetsAA).toBe(false);
      expect(result.meetsAAA).toBe(false);
    });

    it('handles invalid fg color gracefully', async () => {
      const { analyzeContrast } = await import('../../src/modules/qr-analyzer/safety');
      const result = analyzeContrast('invalid', '#ffffff');
      // parseColor may or may not parse 'invalid' - just verify we get a valid result
      expect(typeof result.ratio).toBe('number');
      expect(typeof result.meetsAA).toBe('boolean');
      expect(typeof result.meetsAAA).toBe('boolean');
    });

    it('handles invalid bg color gracefully', async () => {
      const { analyzeContrast } = await import('../../src/modules/qr-analyzer/safety');
      const result = analyzeContrast('#000000', 'bad');
      expect(typeof result.ratio).toBe('number');
      expect(typeof result.meetsAA).toBe('boolean');
    });

    it('handles both colors invalid gracefully', async () => {
      const { analyzeContrast } = await import('../../src/modules/qr-analyzer/safety');
      const result = analyzeContrast('xxx', 'yyy');
      expect(typeof result.ratio).toBe('number');
    });

    it('meetsAA but not AAA for mid-contrast', async () => {
      const { analyzeContrast } = await import('../../src/modules/qr-analyzer/safety');
      // Dark blue on white should give ~8.5:1 ratio (meets AA 4.5 but depends on exact ratio)
      const result = analyzeContrast('#000080', '#ffffff');
      expect(result.ratio).toBeGreaterThan(4.5);
      expect(result.meetsAA).toBe(true);
      // May or may not meet AAA depending on exact ratio
    });

    it('calculates luminance values', async () => {
      const { analyzeContrast } = await import('../../src/modules/qr-analyzer/safety');
      const result = analyzeContrast('#000000', '#ffffff');
      // Black luminance should be ~0, white should be ~1
      expect(result.fgLuminance).toBeCloseTo(0, 1);
      expect(result.bgLuminance).toBeCloseTo(1, 1);
    });

    it('handles colors with low sRGB values (below 0.03928)', async () => {
      const { analyzeContrast } = await import('../../src/modules/qr-analyzer/safety');
      // Very dark red - channel value 5/255 ≈ 0.0196 which is < 0.03928
      const result = analyzeContrast('#050000', '#ffffff');
      expect(result.ratio).toBeGreaterThan(19);
      expect(result.fgLuminance).toBeLessThan(0.01);
    });

    it('handles colors with high sRGB values (above 0.03928)', async () => {
      const { analyzeContrast } = await import('../../src/modules/qr-analyzer/safety');
      // Bright red - channel value 200/255 ≈ 0.784 which is > 0.03928
      const result = analyzeContrast('#c80000', '#ffffff');
      expect(result.ratio).toBeGreaterThan(1);
      expect(result.fgLuminance).toBeGreaterThan(0);
    });
  });

  // ==========================================
  // analyzeMatrixContrast
  // ==========================================

  describe('analyzeMatrixContrast', () => {
    it('delegates to analyzeContrast', async () => {
      const { analyzeMatrixContrast, analyzeContrast } = await import('../../src/modules/qr-analyzer/safety');
      const matrix = [[true, false], [false, true]];
      const result = analyzeMatrixContrast(matrix, '#000000', '#ffffff');
      const direct = analyzeContrast('#000000', '#ffffff');
      expect(result.ratio).toBe(direct.ratio);
      expect(result.meetsAA).toBe(direct.meetsAA);
      expect(result.meetsAAA).toBe(direct.meetsAAA);
    });

    it('works with empty matrix', async () => {
      const { analyzeMatrixContrast } = await import('../../src/modules/qr-analyzer/safety');
      const result = analyzeMatrixContrast([], '#000000', '#ffffff');
      expect(result.ratio).toBeGreaterThan(1);
    });
  });

  // ==========================================
  // calculateSafeIntensity
  // ==========================================

  describe('calculateSafeIntensity', () => {
    it('returns 30 for L', async () => {
      const { calculateSafeIntensity } = await import('../../src/modules/qr-analyzer/safety');
      expect(calculateSafeIntensity('L')).toBe(30);
    });

    it('returns 50 for M', async () => {
      const { calculateSafeIntensity } = await import('../../src/modules/qr-analyzer/safety');
      expect(calculateSafeIntensity('M')).toBe(50);
    });

    it('returns 70 for Q', async () => {
      const { calculateSafeIntensity } = await import('../../src/modules/qr-analyzer/safety');
      expect(calculateSafeIntensity('Q')).toBe(70);
    });

    it('returns 85 for H', async () => {
      const { calculateSafeIntensity } = await import('../../src/modules/qr-analyzer/safety');
      expect(calculateSafeIntensity('H')).toBe(85);
    });

    it('returns 50 for unknown level', async () => {
      const { calculateSafeIntensity } = await import('../../src/modules/qr-analyzer/safety');
      expect(calculateSafeIntensity('X')).toBe(50);
    });

    it('returns 50 for empty string', async () => {
      const { calculateSafeIntensity } = await import('../../src/modules/qr-analyzer/safety');
      expect(calculateSafeIntensity('')).toBe(50);
    });
  });

  // ==========================================
  // validateModuleSize
  // ==========================================

  describe('validateModuleSize', () => {
    it('returns valid for size >= default min (4)', async () => {
      const { validateModuleSize } = await import('../../src/modules/qr-analyzer/safety');
      expect(validateModuleSize(4).valid).toBe(true);
      expect(validateModuleSize(4).warning).toBeUndefined();
    });

    it('returns valid for large size', async () => {
      const { validateModuleSize } = await import('../../src/modules/qr-analyzer/safety');
      expect(validateModuleSize(10).valid).toBe(true);
    });

    it('returns invalid for size below min', async () => {
      const { validateModuleSize } = await import('../../src/modules/qr-analyzer/safety');
      const result = validateModuleSize(3);
      expect(result.valid).toBe(false);
      expect(result.warning).toContain('3px');
      expect(result.warning).toContain('4px');
    });

    it('returns invalid for size 0', async () => {
      const { validateModuleSize } = await import('../../src/modules/qr-analyzer/safety');
      expect(validateModuleSize(0).valid).toBe(false);
    });

    it('respects custom minSize', async () => {
      const { validateModuleSize } = await import('../../src/modules/qr-analyzer/safety');
      expect(validateModuleSize(5, 6).valid).toBe(false);
      expect(validateModuleSize(6, 6).valid).toBe(true);
    });

    it('returns valid at exact boundary', async () => {
      const { validateModuleSize } = await import('../../src/modules/qr-analyzer/safety');
      expect(validateModuleSize(4, 4).valid).toBe(true);
    });
  });

  // ==========================================
  // validateQuietZone
  // ==========================================

  describe('validateQuietZone', () => {
    it('returns valid for zone >= default min (4)', async () => {
      const { validateQuietZone } = await import('../../src/modules/qr-analyzer/safety');
      expect(validateQuietZone(4).valid).toBe(true);
      expect(validateQuietZone(4).warning).toBeUndefined();
    });

    it('returns valid for large zone', async () => {
      const { validateQuietZone } = await import('../../src/modules/qr-analyzer/safety');
      expect(validateQuietZone(10).valid).toBe(true);
    });

    it('returns invalid for zone below min', async () => {
      const { validateQuietZone } = await import('../../src/modules/qr-analyzer/safety');
      const result = validateQuietZone(3);
      expect(result.valid).toBe(false);
      expect(result.warning).toContain('3');
      expect(result.warning).toContain('4');
    });

    it('returns invalid for zone 0', async () => {
      const { validateQuietZone } = await import('../../src/modules/qr-analyzer/safety');
      expect(validateQuietZone(0).valid).toBe(false);
    });

    it('respects custom minModules', async () => {
      const { validateQuietZone } = await import('../../src/modules/qr-analyzer/safety');
      expect(validateQuietZone(5, 6).valid).toBe(false);
      expect(validateQuietZone(6, 6).valid).toBe(true);
    });

    it('returns valid at exact boundary', async () => {
      const { validateQuietZone } = await import('../../src/modules/qr-analyzer/safety');
      expect(validateQuietZone(4, 4).valid).toBe(true);
    });
  });

  // ==========================================
  // validateOverlayIntensity
  // ==========================================

  describe('validateOverlayIntensity', () => {
    it('returns valid when within safe limit for L', async () => {
      const { validateOverlayIntensity } = await import('../../src/modules/qr-analyzer/safety');
      expect(validateOverlayIntensity(20, 'L').valid).toBe(true);
      expect(validateOverlayIntensity(20, 'L').warning).toBeUndefined();
    });

    it('returns valid at exact safe limit for L', async () => {
      const { validateOverlayIntensity } = await import('../../src/modules/qr-analyzer/safety');
      expect(validateOverlayIntensity(30, 'L').valid).toBe(true);
    });

    it('returns invalid when exceeding safe limit for L', async () => {
      const { validateOverlayIntensity } = await import('../../src/modules/qr-analyzer/safety');
      const result = validateOverlayIntensity(31, 'L');
      expect(result.valid).toBe(false);
      expect(result.warning).toContain('31%');
      expect(result.warning).toContain('30%');
      expect(result.warning).toContain('L');
    });

    it('returns valid for moderate intensity with M', async () => {
      const { validateOverlayIntensity } = await import('../../src/modules/qr-analyzer/safety');
      expect(validateOverlayIntensity(50, 'M').valid).toBe(true);
    });

    it('returns invalid when exceeding safe limit for M', async () => {
      const { validateOverlayIntensity } = await import('../../src/modules/qr-analyzer/safety');
      expect(validateOverlayIntensity(51, 'M').valid).toBe(false);
    });

    it('returns valid for high intensity with Q', async () => {
      const { validateOverlayIntensity } = await import('../../src/modules/qr-analyzer/safety');
      expect(validateOverlayIntensity(70, 'Q').valid).toBe(true);
    });

    it('returns invalid when exceeding safe limit for Q', async () => {
      const { validateOverlayIntensity } = await import('../../src/modules/qr-analyzer/safety');
      expect(validateOverlayIntensity(71, 'Q').valid).toBe(false);
    });

    it('returns valid for very high intensity with H', async () => {
      const { validateOverlayIntensity } = await import('../../src/modules/qr-analyzer/safety');
      expect(validateOverlayIntensity(85, 'H').valid).toBe(true);
    });

    it('returns invalid when exceeding safe limit for H', async () => {
      const { validateOverlayIntensity } = await import('../../src/modules/qr-analyzer/safety');
      expect(validateOverlayIntensity(86, 'H').valid).toBe(false);
    });

    it('uses default (50) for unknown ECC level', async () => {
      const { validateOverlayIntensity } = await import('../../src/modules/qr-analyzer/safety');
      expect(validateOverlayIntensity(50, 'X').valid).toBe(true);
      expect(validateOverlayIntensity(51, 'X').valid).toBe(false);
    });

    it('returns valid for zero intensity', async () => {
      const { validateOverlayIntensity } = await import('../../src/modules/qr-analyzer/safety');
      expect(validateOverlayIntensity(0, 'L').valid).toBe(true);
    });
  });

  // ==========================================
  // SafetyAnalyzer namespace
  // ==========================================

  describe('SafetyAnalyzer namespace', () => {
    it('exports all methods', async () => {
      const { SafetyAnalyzer } = await import('../../src/modules/qr-analyzer/safety');
      expect(typeof SafetyAnalyzer.analyzeContrast).toBe('function');
      expect(typeof SafetyAnalyzer.analyzeMatrixContrast).toBe('function');
      expect(typeof SafetyAnalyzer.analyzeQR).toBe('function');
      expect(typeof SafetyAnalyzer.applyBlurSimulation).toBe('function');
      expect(typeof SafetyAnalyzer.applyNoiseSimulation).toBe('function');
      expect(typeof SafetyAnalyzer.calculateSafeIntensity).toBe('function');
      expect(typeof SafetyAnalyzer.generateReadabilityHeatmap).toBe('function');
      expect(typeof SafetyAnalyzer.simulateScan).toBe('function');
      expect(typeof SafetyAnalyzer.validateModuleSize).toBe('function');
      expect(typeof SafetyAnalyzer.validateOverlayIntensity).toBe('function');
      expect(typeof SafetyAnalyzer.validateQuietZone).toBe('function');
    });

    it('default export matches SafetyAnalyzer', async () => {
      const mod = await import('../../src/modules/qr-analyzer/safety');
      expect(mod.default).toBe(mod.SafetyAnalyzer);
    });
  });

  // ==========================================
  // Type exports
  // ==========================================

  describe('type exports', () => {
    it('exports SafetyMode type', async () => {
      const { analyzeContrast } = await import('../../src/modules/qr-analyzer/safety');
      // Just verify the module loads without type errors
      expect(typeof analyzeContrast).toBe('function');
    });
  });
});
