import { describe, expect, it } from 'vitest';

import { resolveAnimationFrameDelay } from '../../src/modules/animation/playback-delay';

describe('animation playback delay resolver', () => {
  it('uses fallback delay when source delays are disabled', () => {
    const delay = resolveAnimationFrameDelay(
      [{ canvas: {} as HTMLCanvasElement, delay: 20, disposalType: 0 }],
      0,
      { useSourceFrameDelays: false, gifMaxFps: 0, fallbackDelayMs: 90 }
    );
    expect(delay).toBe(90);
  });

  it('uses source frame delay when enabled', () => {
    const delay = resolveAnimationFrameDelay(
      [{ canvas: {} as HTMLCanvasElement, delay: 40, disposalType: 0 }],
      0,
      { useSourceFrameDelays: true, gifMaxFps: 0, fallbackDelayMs: 90 }
    );
    expect(delay).toBe(40);
  });

  it('enforces min delay from gifMaxFps', () => {
    const delay = resolveAnimationFrameDelay(
      [{ canvas: {} as HTMLCanvasElement, delay: 10, disposalType: 0 }],
      0,
      { useSourceFrameDelays: true, gifMaxFps: 20, fallbackDelayMs: 90 }
    );
    expect(delay).toBe(50);
  });
});

