import { describe, expect, it } from 'vitest';
import { getCompatibleMode, optimizeSegments } from '../../src/modules/qr-encoder';

// getCompatibleMode

describe('qr-encoder utils', () => {
  it('getCompatibleMode selects numeric for digits', () => {
    expect(getCompatibleMode('1234567890', 'auto')).toBe('numeric');
  });

  it('getCompatibleMode selects alphanumeric for uppercase set', () => {
    expect(getCompatibleMode('HELLO WORLD 123', 'auto')).toBe('alphanumeric');
  });

  it('getCompatibleMode falls back to byte for lowercase', () => {
    expect(getCompatibleMode('Hello World', 'auto')).toBe('byte');
  });

  it('getCompatibleMode respects requested mode when valid', () => {
    expect(getCompatibleMode('12345', 'numeric')).toBe('numeric');
    expect(getCompatibleMode('HELLO', 'alphanumeric')).toBe('alphanumeric');
  });

  it('getCompatibleMode falls back to byte when requested mode invalid', () => {
    expect(getCompatibleMode('Hello123', 'alphanumeric')).toBe('byte');
  });

  it('optimizeSegments chooses numeric for long digit runs', () => {
    const segments = optimizeSegments('abc1234567890def');
    // Lowercase forces byte mode around the numeric run
    expect(segments.some((s) => s.mode === 'numeric')).toBe(true);
  });

  it('optimizeSegments chooses alphanumeric for uppercase runs', () => {
    const segments = optimizeSegments('HELLO-WORLD-123');
    expect(segments.some((s) => s.mode === 'alphanumeric')).toBe(true);
  });
});
