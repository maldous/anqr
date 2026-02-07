import { describe, expect, it } from 'vitest';

import {
  convertToImageApiUrl,
  generateBBCodeEmbed,
  generateIframeEmbed,
  generateImageEmbed,
  generateMarkdownEmbed,
} from '../../src/modules/share-links/embed';

describe('share-links embed', () => {
  it('converts share urls to image api urls with passthrough params', () => {
    const src =
      'https://anqr.link/?data=https%3A%2F%2Fexample.com&w=320&h=240&size=6&fg=%23112233&bg=%23ffffff&ec=H&mode=artwork';

    const out = convertToImageApiUrl(src);
    const url = new URL(out);

    expect(`${url.origin}${url.pathname}`).toBe('https://anqr.link/api/qr');
    expect(url.searchParams.get('data')).toBe('https://example.com');
    expect(url.searchParams.get('w')).toBe('320');
    expect(url.searchParams.get('h')).toBe('240');
    expect(url.searchParams.get('modulePx')).toBe('6');
    expect(url.searchParams.get('fg')).toBe('#112233');
    expect(url.searchParams.get('mode')).toBe('artwork');
  });

  it('uses explicit width/height overrides and fallback on invalid url', () => {
    const src = 'https://anqr.link/?data=x&w=200&h=200';
    const out = convertToImageApiUrl(src, 100, 512, 256);
    const url = new URL(out);
    expect(url.searchParams.get('w')).toBe('512');
    expect(url.searchParams.get('h')).toBe('256');

    const fallback = convertToImageApiUrl('not-a-url', 180);
    expect(fallback).toContain('https://anqr.link/api/qr?');
    expect(fallback).toContain('size=180');
  });

  it('generates image, iframe, markdown, and bbcode snippets', () => {
    const share = 'https://anqr.link/?data=https%3A%2F%2Fexample.com';

    const image = generateImageEmbed(share, 'Alt', {
      width: 280,
      height: 180,
      responsive: false,
      showBorder: true,
      includeLink: true,
    });
    expect(image).toContain('<a href="https://anqr.link/?data=https%3A%2F%2Fexample.com"');
    expect(image).toContain('width: 280px; height: 180px;');
    expect(image).toContain('border: 1px solid #ccc;');

    const imageNoLink = generateImageEmbed(share, 'Alt2', { includeLink: false, showBorder: false });
    expect(imageNoLink.startsWith('<img src=')).toBe(true);

    const iframe = generateIframeEmbed(share, { responsive: true, showBorder: false });
    expect(iframe).toContain('width: 100%; aspect-ratio: 1;');
    expect(iframe).toContain('border: none;');

    const md = generateMarkdownEmbed(share, 'QR', 222);
    expect(md).toContain('![QR](');
    expect(md).toContain('/api/qr?');

    expect(generateBBCodeEmbed('https://img.test/x.png')).toBe('[img]https://img.test/x.png[/img]');
    expect(generateBBCodeEmbed('https://img.test/x.png', 'https://example.com')).toBe(
      '[url=https://example.com][img]https://img.test/x.png[/img][/url]'
    );
  });
});
