import { describe, expect, it } from 'vitest';
import { buildUrlParams, parseUrlParamsFromSearchParams } from '../../src/modules/share-links';
import type { ShareConfig } from '../../src/modules/share-links/types';

describe('share-links round trip', () => {
  it('round-trips a representative config subset', () => {
    const config: Partial<ShareConfig> = {
      data: 'https://example.com/share?ok=1',
      lang: 'fr',
      ec: 'Q',
      version: 7,
      fg: '#112233',
      bg: '#ffeecc',
      transparent: true,
      style: 'rounded',
      finder: 'circle',
      mode: 'blend',
      intensity: 70,
      fit: 'contain',
      rotate: 45,
      ditherKind: 'ordered_bayer',
      orderedMatrix: 'bayer8',
      format: 'png',
      width: 512,
      height: 256,
      quality: 0.85,
      safetyMode: 'strict',
      safetyMinModulePx: 3,
      watermarkEnabled: true,
      watermarkKind: 'image',
      watermarkText: 'demo',
      watermarkPosition: 'top_right',
      watermarkOpacity: 40,
      watermarkBlend: 'overlay',
      watermarkImageUrl: 'https://example.com/wm.png',
    };

    const params = buildUrlParams(config);
    const parsed = parseUrlParamsFromSearchParams(new URLSearchParams(params));

    expect(parsed).toMatchObject({
      data: config.data,
      lang: config.lang,
      ec: config.ec,
      version: config.version,
      fg: config.fg,
      bg: config.bg,
      transparent: config.transparent,
      style: config.style,
      finder: config.finder,
      mode: config.mode,
      intensity: config.intensity,
      fit: config.fit,
      rotate: config.rotate,
      ditherKind: config.ditherKind,
      orderedMatrix: config.orderedMatrix,
      format: config.format,
      width: config.width,
      height: config.height,
      quality: config.quality,
      safetyMode: config.safetyMode,
      safetyMinModulePx: config.safetyMinModulePx,
      watermarkEnabled: config.watermarkEnabled,
      watermarkKind: config.watermarkKind,
      watermarkText: config.watermarkText,
      watermarkPosition: config.watermarkPosition,
      watermarkOpacity: config.watermarkOpacity,
      watermarkBlend: config.watermarkBlend,
      watermarkImageUrl: config.watermarkImageUrl,
    });
  });

  it('parses legacy per-ECC intensity aliases', () => {
    const parsed = parseUrlParamsFromSearchParams(
      new URLSearchParams(
        'data=https%3A%2F%2Fexample.com&maxOverlayIntensityL=91&maxOverlayIntensityM=92&maxOverlayIntensityQ=93&maxOverlayIntensityH=94'
      )
    );

    expect(parsed.maxOverlayIntensityL).toBe(91);
    expect(parsed.maxOverlayIntensityM).toBe(92);
    expect(parsed.maxOverlayIntensityQ).toBe(93);
    expect(parsed.maxOverlayIntensityH).toBe(94);
  });
});
