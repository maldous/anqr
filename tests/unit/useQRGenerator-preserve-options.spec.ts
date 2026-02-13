import { describe, expect, it } from 'vitest';
import { resolveOverlayPreservationOptions } from '../../src/hooks/useQRGenerator';

describe('useQRGenerator preserve/protect resolution', () => {
  it('respects user toggles in dithered mode even when safety locks are enabled', () => {
    const resolved = resolveOverlayPreservationOptions({
      overlayEnabled: true,
      overlayMode: 'dithered',
      safetyMode: 'strict',
      safetyLockFinders: true,
      safetyLockTiming: true,
      safetyLockAlign: true,
      safetyLockFormat: true,
      safetyLockVersion: true,
      preserveFinders: false,
      preserveTiming: false,
      preserveAlignment: false,
      protectFormatInfo: false,
      protectVersionInfo: false,
    });

    expect(resolved).toEqual({
      preserveFinders: false,
      preserveTiming: false,
      preserveAlignment: false,
      protectFormatInfo: false,
      protectVersionInfo: false,
    });
  });

  it('applies safety locks for non-dithered overlay modes', () => {
    const resolved = resolveOverlayPreservationOptions({
      overlayEnabled: true,
      overlayMode: 'blend',
      safetyMode: 'strict',
      safetyLockFinders: true,
      safetyLockTiming: true,
      safetyLockAlign: false,
      safetyLockFormat: true,
      safetyLockVersion: false,
      preserveFinders: false,
      preserveTiming: false,
      preserveAlignment: false,
      protectFormatInfo: false,
      protectVersionInfo: false,
    });

    expect(resolved).toEqual({
      preserveFinders: true,
      preserveTiming: true,
      preserveAlignment: false,
      protectFormatInfo: true,
      protectVersionInfo: false,
    });
  });
});
