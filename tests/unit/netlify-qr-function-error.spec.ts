// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';

describe('netlify qr function error handling', () => {
  it('returns 500 with Error message when generator throws Error', async () => {
    vi.resetModules();
    const captureException = vi.fn();
    vi.doMock('@sentry/node', () => ({ init: vi.fn(), captureException }));
    vi.doMock('../../src/modules/qr-generator', () => ({
      QRGenerator: class {
        constructor() {}
        async generate() {
          throw new Error('boom-error');
        }
      },
    }));
    const { default: handler } = await import('../../netlify/functions/qr');
    const res = await handler(new Request('https://anqr.link/api/qr?data=https%3A%2F%2Fanqr.link'));
    expect(res.status).toBe(500);
    expect(await res.text()).toContain('boom-error');
    expect(captureException).toHaveBeenCalled();
  });

  it('returns 500 with Unknown error when generator throws non-Error', async () => {
    vi.resetModules();
    const captureException = vi.fn();
    vi.doMock('@sentry/node', () => ({ init: vi.fn(), captureException }));
    vi.doMock('../../src/modules/qr-generator', () => ({
      QRGenerator: class {
        constructor() {}
        async generate() {
          throw 'boom-string';
        }
      },
    }));
    const { default: handler } = await import('../../netlify/functions/qr');
    const res = await handler(new Request('https://anqr.link/api/qr?data=https%3A%2F%2Fanqr.link'));
    expect(res.status).toBe(500);
    expect(await res.text()).toContain('Unknown error');
    expect(captureException).toHaveBeenCalled();
  });
});
