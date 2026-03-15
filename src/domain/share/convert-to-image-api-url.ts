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
      'animTarget',
      'animWaveAxis',
      'animPattern2',
      'animTarget2',
      'animWaveAxis2',
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
