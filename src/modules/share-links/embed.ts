/**
 * Share Links Module - Embed Code Generation
 * Generates HTML, iframe, markdown, and BBCode embed snippets
 */

import { createLogger } from '../../lib/logger';
import type { EmbedOptions } from './types';

const _log = createLogger('SHARE');

/**
 * Convert a shareable app URL to an image API URL
 */
export function convertToImageApiUrl(
  shareableUrl: string,
  size: number = 200,
  width?: number,
  height?: number
): string {
  try {
    const url = new URL(shareableUrl);
    const params = url.searchParams;

    const imageParams = new URLSearchParams();

    const data = params.get('data');
    if (data) {
      imageParams.set('data', data);
    }

    const urlWidth = params.get('w');
    const urlHeight = params.get('h');
    const finalWidth = width ?? (urlWidth ? Number.parseInt(urlWidth, 10) : null);
    const finalHeight = height ?? (urlHeight ? Number.parseInt(urlHeight, 10) : null);

    if (finalWidth !== null || finalHeight !== null) {
      imageParams.set('w', (finalWidth ?? finalHeight ?? size).toString());
      imageParams.set('h', (finalHeight ?? finalWidth ?? size).toString());
    } else {
      imageParams.set('size', size.toString());
    }

    const clientSize = params.get('size');
    if (clientSize) {
      imageParams.set('modulePx', clientSize);
    }

    const passThroughParams = [
      'fg',
      'bg',
      'transparent',
      'ec',
      'margin',
      'enc',
      'v',
      'border',
      'modulePx',
      'maxIntL',
      'maxIntM',
      'maxIntQ',
      'maxIntH',
      'crisp',
      'snap',
      'modColor',
      'cGuard',
      'minContrast',
      'style',
      'finder',
      'align',
      'timing',
      'eyeOuter',
      'eyeInner',
      'eyeScale',
      'radius',
      'gap',
      'gapMode',
      'dotRot',
      'frame',
      'frameText',
      'grad',
      'gradAngle',
      'gradStops',
      'img',
      'mode',
      'intensity',
      'colorMode',
      'logoSize',
      'keepFinders',
      'keepTiming',
      'keepAlign',
      'protectFmt',
      'protectVer',
      'eccAware',
      'eccRisk',
      'eccMap',
      'brightness',
      'contrast',
      'gamma',
      'saturation',
      'hue',
      'invert',
      'blur',
      'sharpen',
      'posterize',
      'threshold',
      'edge',
      'fit',
      'rot',
      'flipX',
      'flipY',
      'ditherKind',
      'diffusionKernel',
      'ditherStrength',
      'finderDither',
      'blendPres',
      'serpentine',
      'matrix',
      'bnTile',
      'bnSeed',
      'colorDither',
      'spGrid',
      'spCenter',
      'spNeutral',
      'spFinder',
      'htCell',
      'htDot',
      'htCurve',
      'duo1',
      'duo2',
      'palette',
      'paletteMode',
      'format',
      'quality',
      'dpi',
      'wmEn',
      'wmKind',
      'wmText',
      'wmPos',
      'wmOpacity',
      'wmBlend',
      'metaTitle',
      'metaAuthor',
      'metaCopy',
      'metaDesc',
      'animPattern',
      'animFrames',
      'animSpeed',
      'animSeed',
      'wmImg',
      'subpixel',
      'spGridNum',
      'jpegQ',
      'webpQ',
      'gifColors',
      'easing',
    ];

    for (const key of passThroughParams) {
      const val = params.get(key);
      if (val) {
        imageParams.set(key, val);
      }
    }

    return `${url.origin}/api/qr?${imageParams.toString()}`;
  } catch {
    return `https://anqr.link/api/qr?data=${encodeURIComponent(shareableUrl)}&size=${size}`;
  }
}

/**
 * Generate HTML embed code for an image
 */
export function generateImageEmbed(
  shareableUrl: string,
  alt: string = 'QR Code',
  options: Partial<EmbedOptions> = {}
): string {
  const opts: EmbedOptions = {
    width: options.width ?? 200,
    height: options.height ?? 200,
    responsive: options.responsive ?? false,
    showBorder: options.showBorder ?? false,
    includeLink: options.includeLink ?? false,
  };

  const imageUrl = convertToImageApiUrl(
    shareableUrl,
    opts.width,
    opts.width === opts.height ? undefined : opts.width,
    opts.width === opts.height ? undefined : opts.height
  );

  const style = opts.responsive
    ? 'max-width: 100%; height: auto;'
    : `width: ${opts.width}px; height: ${opts.height}px;`;

  const border = opts.showBorder ? ' border: 1px solid #ccc;' : '';

  const imgTag = `<img src="${imageUrl}" alt="${alt}" style="${style}${border}" />`;

  if (opts.includeLink) {
    return `<a href="${shareableUrl}" target="_blank">${imgTag}</a>`;
  }

  return imgTag;
}

/**
 * Generate iframe embed code
 */
export function generateIframeEmbed(url: string, options: Partial<EmbedOptions> = {}): string {
  const opts: EmbedOptions = {
    width: options.width ?? 300,
    height: options.height ?? 300,
    responsive: options.responsive ?? false,
    showBorder: options.showBorder ?? false,
    includeLink: options.includeLink ?? false,
  };

  const style = opts.responsive
    ? 'width: 100%; aspect-ratio: 1;'
    : `width: ${opts.width}px; height: ${opts.height}px;`;

  const border = opts.showBorder ? ' border: 1px solid #ccc;' : ' border: none;';

  return `<iframe src="${url}" style="${style}${border}" loading="lazy" title="QR Code"></iframe>`;
}

/**
 * Generate markdown embed
 */
export function generateMarkdownEmbed(
  shareableUrl: string,
  alt: string = 'QR Code',
  size: number = 200,
  width?: number,
  height?: number
): string {
  const imageUrl = convertToImageApiUrl(shareableUrl, size, width, height);
  return `![${alt}](${imageUrl})`;
}

/**
 * Generate BBCode embed
 */
export function generateBBCodeEmbed(imageUrl: string, linkUrl?: string): string {
  if (linkUrl) {
    return `[url=${linkUrl}][img]${imageUrl}[/img][/url]`;
  }
  return `[img]${imageUrl}[/img]`;
}
