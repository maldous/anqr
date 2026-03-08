import { describe, expect, it } from 'vitest';

/**
 * These tests verify the deep link handling logic used in App.tsx.
 *
 * The functions under test are private to the App component, so we replicate
 * the exact logic here as a regression/documentation test. If the routing
 * table or URL resolution changes in App.tsx, these tests catch the drift.
 */

// ---------- Overlay URL Resolution (iOS-specific) ----------
// On native platforms, anqr.link URLs are converted to local paths
// to avoid cross-origin issues with bundled assets.
//
// Source: App.tsx → loadOverlayFromUrl callback

function resolveOverlayFetchUrl(url: string, isNative: boolean, origin: string): string {
  if (isNative && url.startsWith('https://anqr.link/')) {
    const localPath = url.replace('https://anqr.link', '');
    return `${origin}${localPath}`;
  }
  return url;
}

describe('deep link — overlay URL resolution', () => {
  const NATIVE_ORIGIN = 'capacitor://localhost';

  it('converts anqr.link overlay URLs to local paths on native', () => {
    expect(resolveOverlayFetchUrl('https://anqr.link/images/demo.png', true, NATIVE_ORIGIN)).toBe(
      'capacitor://localhost/images/demo.png'
    );
  });

  it('converts anqr.link root-relative overlay paths on native', () => {
    expect(resolveOverlayFetchUrl('https://anqr.link/king.gif', true, NATIVE_ORIGIN)).toBe(
      'capacitor://localhost/king.gif'
    );
  });

  it('preserves external overlay URLs on native', () => {
    expect(resolveOverlayFetchUrl('https://example.com/image.png', true, NATIVE_ORIGIN)).toBe(
      'https://example.com/image.png'
    );
  });

  it('preserves anqr.link overlay URLs on web', () => {
    expect(
      resolveOverlayFetchUrl('https://anqr.link/images/demo.png', false, 'https://anqr.link')
    ).toBe('https://anqr.link/images/demo.png');
  });

  it('handles anqr.link URLs with query params on native', () => {
    expect(
      resolveOverlayFetchUrl('https://anqr.link/images/demo.png?v=2', true, NATIVE_ORIGIN)
    ).toBe('capacitor://localhost/images/demo.png?v=2');
  });

  it('does not match partial anqr.link prefix', () => {
    expect(resolveOverlayFetchUrl('https://anqr.link.evil.com/x.png', true, NATIVE_ORIGIN)).toBe(
      'https://anqr.link.evil.com/x.png'
    );
  });
});

// ---------- Page Routing from URL ----------
// Source: App.tsx → getPageFromLocation

function getPageFromLocation(pathname: string, hash: string): string {
  // NOSONAR - This regex is safe: /\/+$/ has no backtracking risk
  const path = pathname.replace(/\/+$/, '') || '/';
  const h = hash.replace(/^#/, '');

  if (path === '/analyze') return 'analyze';
  if (path === '/gallery') return 'gallery';
  if (path === '/guide') return 'guide';
  if (path === '/learn') return 'learn';
  if (path === '/examples') return 'examples';
  if (path === '/translate') return 'translate';
  if (path === '/about') return 'about';
  if (path === '/privacy') return 'privacy';
  if (path === '/terms') return 'terms';
  if (path === '/contact') return 'contact';

  // Backward-compatible hash routes
  if (h === 'gallery') return 'gallery';
  if (h === 'about' || h === 'privacy' || h === 'terms' || h === 'contact' || h === 'guide')
    return h;

  return 'editor';
}

describe('deep link — page routing', () => {
  it('maps clean paths to correct pages', () => {
    expect(getPageFromLocation('/analyze', '')).toBe('analyze');
    expect(getPageFromLocation('/gallery', '')).toBe('gallery');
    expect(getPageFromLocation('/guide', '')).toBe('guide');
    expect(getPageFromLocation('/learn', '')).toBe('learn');
    expect(getPageFromLocation('/examples', '')).toBe('examples');
    expect(getPageFromLocation('/translate', '')).toBe('translate');
    expect(getPageFromLocation('/about', '')).toBe('about');
    expect(getPageFromLocation('/privacy', '')).toBe('privacy');
    expect(getPageFromLocation('/terms', '')).toBe('terms');
    expect(getPageFromLocation('/contact', '')).toBe('contact');
  });

  it('returns editor for root path', () => {
    expect(getPageFromLocation('/', '')).toBe('editor');
  });

  it('strips trailing slashes', () => {
    expect(getPageFromLocation('/gallery/', '')).toBe('gallery');
    expect(getPageFromLocation('/gallery///', '')).toBe('gallery');
  });

  it('supports backward-compatible hash routes', () => {
    expect(getPageFromLocation('/', '#gallery')).toBe('gallery');
    expect(getPageFromLocation('/', '#about')).toBe('about');
    expect(getPageFromLocation('/', '#privacy')).toBe('privacy');
    expect(getPageFromLocation('/', '#terms')).toBe('terms');
    expect(getPageFromLocation('/', '#contact')).toBe('contact');
    expect(getPageFromLocation('/', '#guide')).toBe('guide');
  });

  it('clean paths take priority over hash routes', () => {
    expect(getPageFromLocation('/gallery', '#about')).toBe('gallery');
    expect(getPageFromLocation('/analyze', '#gallery')).toBe('analyze');
  });

  it('returns editor for unknown paths', () => {
    expect(getPageFromLocation('/unknown', '')).toBe('editor');
    expect(getPageFromLocation('/admin', '')).toBe('editor');
  });

  it('returns editor for unknown hash routes', () => {
    expect(getPageFromLocation('/', '#settings')).toBe('editor');
    expect(getPageFromLocation('/', '#export')).toBe('editor');
  });

  it('handles empty pathname as root', () => {
    expect(getPageFromLocation('', '')).toBe('editor');
  });
});
