import { describe, expect, it, vi } from 'vitest';

vi.mock('../../src/lib/logger', () => ({
  createLogger: () => ({ trace: vi.fn(), debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }),
}));

import { getSocialShareUrls } from '../../src/modules/share-links/social';
import { clamp, clamp01, createRNG, createSeededRandom, lerp } from '../../src/modules/core/math';

describe('share links social + core math', () => {
  it('builds social share urls with encoded title and url', () => {
    const urls = getSocialShareUrls('https://example.com/a?b=1', 'QR Title');
    expect(urls.twitter).toContain('twitter.com/intent/tweet');
    expect(urls.facebook).toContain('facebook.com/sharer');
    expect(urls.linkedin).toContain('linkedin.com/shareArticle');
    expect(urls.reddit).toContain('reddit.com/submit');
    expect(urls.email).toContain('mailto:?subject=QR%20Title');
    expect(urls.whatsapp).toContain('wa.me');
    expect(urls.telegram).toContain('t.me/share/url');
  });

  it('covers math helpers and deterministic rng behavior', () => {
    expect(clamp(-9)).toBe(0);
    expect(clamp(300)).toBe(255);
    expect(clamp(12.8)).toBe(13);

    expect(clamp01(-1)).toBe(0);
    expect(clamp01(2)).toBe(1);
    expect(clamp01(0.4)).toBe(0.4);

    expect(lerp(10, 20, 0.25)).toBe(12.5);

    const seededA = createSeededRandom(42);
    const seededB = createSeededRandom(42);
    expect(seededA()).toBeCloseTo(seededB(), 10);
    expect(seededA()).toBeGreaterThanOrEqual(0);
    expect(seededA()).toBeLessThan(1);

    const rngA = createRNG(123);
    const rngB = createRNG(123);
    expect(rngA()).toBeCloseTo(rngB(), 10);
    const next = rngA();
    expect(next).toBeGreaterThanOrEqual(0);
    expect(next).toBeLessThan(1);
  });
});
