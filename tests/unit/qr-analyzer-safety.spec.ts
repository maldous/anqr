import { describe, expect, it } from 'vitest';
import {
  analyzeContrast,
  analyzeMatrixContrast,
  calculateSafeIntensity,
  validateOverlayIntensity,
  validateModuleSize,
  validateQuietZone,
} from '../../src/modules/qr-analyzer/safety';

describe('qr-analyzer safety (pure functions)', () => {
  it('analyzeContrast reports high ratio for black/white', () => {
    const report = analyzeContrast('#000000', '#ffffff');
    expect(report.ratio).toBeGreaterThan(10);
    expect(report.meetsAA).toBe(true);
    expect(report.meetsAAA).toBe(true);
  });

  it('analyzeMatrixContrast mirrors analyzeContrast', () => {
    const report = analyzeMatrixContrast([[true]], '#000000', '#ffffff');
    expect(report.ratio).toBeGreaterThan(10);
  });

  it('calculateSafeIntensity returns expected defaults', () => {
    expect(calculateSafeIntensity('L')).toBe(30);
    expect(calculateSafeIntensity('M')).toBe(50);
    expect(calculateSafeIntensity('Q')).toBe(70);
    expect(calculateSafeIntensity('H')).toBe(85);
  });

  it('validateModuleSize flags small modules', () => {
    const result = validateModuleSize(2, 4);
    expect(result.valid).toBe(false);
    expect(result.warning).toBeDefined();
  });

  it('validateQuietZone flags small quiet zone', () => {
    const result = validateQuietZone(2, 4);
    expect(result.valid).toBe(false);
    expect(result.warning).toBeDefined();
  });

  it('validateOverlayIntensity enforces ECC-specific limits', () => {
    expect(validateOverlayIntensity(30, 'L').valid).toBe(true);
    expect(validateOverlayIntensity(31, 'L').valid).toBe(false);
    expect(validateOverlayIntensity(50, 'M').valid).toBe(true);
    expect(validateOverlayIntensity(70, 'Q').valid).toBe(true);
    expect(validateOverlayIntensity(85, 'H').valid).toBe(true);
    expect(validateOverlayIntensity(86, 'H').valid).toBe(false);
  });
});
