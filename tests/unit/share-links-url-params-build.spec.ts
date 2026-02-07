import { describe, expect, it, vi } from 'vitest';

vi.mock('../../src/lib/logger', () => ({
  createLogger: () => ({ trace: vi.fn(), debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }),
}));

// ImageData polyfill for node (some transitive imports may need it)
class MockImageData {
  data: Uint8ClampedArray;
  width: number;
  height: number;
  colorSpace: string;
  constructor(dataOrWidth: Uint8ClampedArray | number, widthOrHeight: number, height?: number) {
    if (typeof dataOrWidth === 'number') {
      this.width = dataOrWidth;
      this.height = widthOrHeight;
      this.data = new Uint8ClampedArray(this.width * this.height * 4);
    } else {
      this.data = dataOrWidth;
      this.width = widthOrHeight;
      this.height = height!;
    }
    this.colorSpace = 'srgb';
  }
}
if (typeof globalThis.ImageData === 'undefined') {
  (globalThis as Record<string, unknown>).ImageData = MockImageData;
}

describe('share-links/url-params.ts', () => {
  async function getMod() {
    return import('../../src/modules/share-links/url-params');
  }

  // ========================================================================
  // buildUrlParams
  // ========================================================================
  describe('buildUrlParams', () => {
    async function build(config: Record<string, unknown>) {
      const mod = await getMod();
      return mod.buildUrlParams(config as never);
    }

    it('returns empty string for empty config', async () => {
      const params = await build({});
      expect(params).toBe('');
    });

    it('serializes data param', async () => {
      const params = await build({ data: 'hello world' });
      expect(params).toContain('data=hello');
    });

    it('does NOT serialize default ec=H', async () => {
      const params = await build({ data: 'test', ec: 'H' });
      expect(params).not.toContain('ec=');
    });

    it('serializes non-default ec=L', async () => {
      const params = await build({ data: 'test', ec: 'L' });
      expect(params).toContain('ec=L');
    });

    it('serializes non-default ec=M', async () => {
      const params = await build({ data: 'test', ec: 'M' });
      expect(params).toContain('ec=M');
    });

    it('serializes non-default ec=Q', async () => {
      const params = await build({ data: 'test', ec: 'Q' });
      expect(params).toContain('ec=Q');
    });

    it('does NOT serialize default version=0', async () => {
      const params = await build({ data: 'test', version: 0 });
      expect(params).not.toContain('v=');
    });

    it('serializes non-default version=5', async () => {
      const params = await build({ data: 'test', version: 5 });
      expect(params).toContain('v=5');
    });

    it('does NOT serialize default size=20', async () => {
      const params = await build({ data: 'test', size: 20 });
      expect(params).not.toContain('size=');
    });

    it('serializes non-default size=30', async () => {
      const params = await build({ data: 'test', size: 30 });
      expect(params).toContain('size=30');
    });

    it('does NOT serialize default margin=4', async () => {
      const params = await build({ data: 'test', margin: 4 });
      expect(params).not.toContain('margin=');
    });

    it('serializes non-default margin=2', async () => {
      const params = await build({ data: 'test', margin: 2 });
      expect(params).toContain('margin=2');
    });

    it('serializes margin=0', async () => {
      const params = await build({ data: 'test', margin: 0 });
      expect(params).toContain('margin=0');
    });

    it('serializes encodingMode when not auto', async () => {
      const params = await build({ data: 'test', encodingMode: 'byte' });
      expect(params).toContain('enc=byte');
    });

    it('does NOT serialize encodingMode=auto', async () => {
      const params = await build({ data: 'test', encodingMode: 'auto' });
      expect(params).not.toContain('enc=');
    });

    it('serializes maskPattern=3', async () => {
      const params = await build({ data: 'test', maskPattern: 3 });
      expect(params).toContain('mask=3');
    });

    it('does NOT serialize default maskPattern=auto', async () => {
      const params = await build({ data: 'test', maskPattern: 'auto' });
      expect(params).not.toContain('mask=');
    });

    it('serializes fg color (strips #)', async () => {
      const params = await build({ data: 'test', fg: '#ff0000' });
      expect(params).toContain('fg=ff0000');
    });

    it('serializes bg color (strips #)', async () => {
      const params = await build({ data: 'test', bg: '#00ff00' });
      expect(params).toContain('bg=00ff00');
    });

    it('serializes transparent=true', async () => {
      const params = await build({ data: 'test', transparent: true });
      expect(params).toContain('transparent=1');
    });

    it('does NOT serialize transparent=false', async () => {
      const params = await build({ data: 'test', transparent: false });
      expect(params).not.toContain('transparent=');
    });

    it('serializes non-default style', async () => {
      const params = await build({ data: 'test', style: 'round' });
      expect(params).toContain('style=round');
    });

    it('does NOT serialize default style=square', async () => {
      const params = await build({ data: 'test', style: 'square' });
      expect(params).not.toContain('style=');
    });

    it('serializes finder, alignment, timing styles', async () => {
      const params = await build({
        data: 'test',
        finder: 'circle',
        alignmentStyle: 'diamond',
        timingStyle: 'dot',
      });
      expect(params).toContain('finder=circle');
      expect(params).toContain('align=diamond');
      expect(params).toContain('timing=dot');
    });

    it('serializes render params (gap, radius, eyeOuter, eyeInner, eyeScale)', async () => {
      const params = await build({
        data: 'test',
        moduleGap: 2,
        cornerRadius: 5,
        eyeOuterStyle: 'rounded',
        eyeInnerStyle: 'circle',
        eyeScale: 120,
      });
      expect(params).toContain('gap=2');
      expect(params).toContain('radius=5');
      expect(params).toContain('eyeOuter=rounded');
      expect(params).toContain('eyeInner=circle');
      expect(params).toContain('eyeScale=120');
    });

    it('serializes gapMode', async () => {
      const params = await build({ data: 'test', gapMode: 'data_only' });
      expect(params).toContain('gapMode=data_only');
    });

    it('serializes gradient params', async () => {
      const params = await build({
        data: 'test',
        gradientType: 'linear',
        gradientAngle: 45,
        gradientStops: [
          { color: '#ff0000', pos: 0 },
          { color: '#0000ff', pos: 1 },
        ],
      });
      expect(params).toContain('grad=linear');
      expect(params).toContain('gradAngle=45');
      expect(params).toContain('gradStops=');
    });

    it('serializes frame and frameText', async () => {
      const params = await build({ data: 'test', frameStyle: 'banner', frameText: 'SCAN ME' });
      expect(params).toContain('frame=banner');
      expect(params).toContain('frameText=SCAN+ME');
    });

    it('serializes dotRotation, crispEdges=false, pixelSnap', async () => {
      const params = await build({
        data: 'test',
        dotRotation: 45,
        crispEdges: false,
        pixelSnap: 'round',
      });
      expect(params).toContain('dotRot=45');
      expect(params).toContain('crisp=0');
      expect(params).toContain('snap=round');
    });

    it('serializes perModuleColorMode and contrastGuard', async () => {
      const params = await build({
        data: 'test',
        perModuleColorMode: 'hue',
        contrastGuard: true,
        minContrastRatio: 7,
      });
      expect(params).toContain('modColor=hue');
      expect(params).toContain('cGuard=1');
      expect(params).toContain('minContrast=7');
    });

    it('serializes overlay params', async () => {
      const params = await build({
        data: 'test',
        mode: 'dithered',
        intensity: 80,
        logoSize: 30,
        overlayUrl: 'https://example.com/logo.png',
        overlayType: 'animated',
        overlayFramePick: 'first',
      });
      expect(params).toContain('mode=dithered');
      expect(params).toContain('intensity=80');
      expect(params).toContain('logoSize=30');
      expect(params).toContain('img=');
      expect(params).toContain('ovType=animated');
      expect(params).toContain('ovFramePick=first');
    });

    it('serializes crop params', async () => {
      const params = await build({
        data: 'test',
        cropEnabled: true,
        cropX: 0.1,
        cropY: 0.2,
        cropSize: 0.5,
      });
      expect(params).toContain('cropEn=1');
      expect(params).toContain('cropX=0.1');
      expect(params).toContain('cropY=0.2');
      expect(params).toContain('cropSize=0.5');
    });

    it('serializes gif params', async () => {
      const params = await build({
        data: 'test',
        gifUseFrameDelays: false,
        gifMaxFps: 15,
        gifDisposalHandling: 'restore',
      });
      expect(params).toContain('gifDelays=0');
      expect(params).toContain('gifMaxFps=15');
      expect(params).toContain('gifDispH=restore');
    });

    it('serializes fit, rotate, flip', async () => {
      const params = await build({
        data: 'test',
        fit: 'contain',
        rotate: 90,
        flipX: true,
        flipY: true,
      });
      expect(params).toContain('fit=contain');
      expect(params).toContain('rot=90');
      expect(params).toContain('flipX=1');
      expect(params).toContain('flipY=1');
    });

    it('serializes preserve/protect flags', async () => {
      const params = await build({
        data: 'test',
        preserveFinders: false,
        preserveTiming: true,
        preserveAlignment: true,
        protectFormatInfo: true,
        protectVersionInfo: true,
      });
      expect(params).toContain('keepFinders=0');
      expect(params).toContain('keepTiming=1');
      expect(params).toContain('keepAlign=1');
      expect(params).toContain('protectFmt=1');
      expect(params).toContain('protectVer=1');
    });

    it('serializes eccAware params', async () => {
      const params = await build({
        data: 'test',
        eccAwareEnabled: true,
        eccAwareRiskBudget: 25,
        eccAwareWeightMap: 'center_heavy',
      });
      expect(params).toContain('eccAware=1');
      expect(params).toContain('eccRisk=25');
      expect(params).toContain('eccMap=center_heavy');
    });

    it('serializes preprocessing params', async () => {
      const params = await build({
        data: 'test',
        colorMode: 'grayscale',
        brightness: 20,
        contrast: 30,
        gamma: 1.5,
        saturation: 80,
        blur: 2,
        sharpen: 3,
        posterize: 4,
        threshold: 100,
        edge: 'sobel',
        invert: true,
        hue: 180,
      });
      expect(params).toContain('colorMode=grayscale');
      expect(params).toContain('brightness=20');
      expect(params).toContain('contrast=30');
      expect(params).toContain('gamma=1.5');
      expect(params).toContain('saturation=80');
      expect(params).toContain('blur=2');
      expect(params).toContain('sharpen=3');
      expect(params).toContain('posterize=4');
      expect(params).toContain('threshold=100');
      expect(params).toContain('edge=sobel');
      expect(params).toContain('invert=1');
      expect(params).toContain('hue=180');
    });

    it('serializes dither params', async () => {
      const params = await build({
        data: 'test',
        ditherKind: 'blue_noise',
        diffusionKernel: 'atkinson',
        ditherStrength: 75,
        ditherSerpentine: true,
        orderedMatrix: 'bayer8',
        blueNoiseTileSize: 128,
        blueNoiseSeed: 42,
        colorDither: 'per_channel',
      });
      expect(params).toContain('ditherKind=blue_noise');
      expect(params).toContain('diffusionKernel=atkinson');
      expect(params).toContain('ditherStrength=75');
      expect(params).toContain('serpentine=1');
      expect(params).toContain('matrix=bayer8');
      expect(params).toContain('bnTile=128');
      expect(params).toContain('bnSeed=42');
      expect(params).toContain('colorDither=per_channel');
    });

    it('serializes subpixel params', async () => {
      const params = await build({
        data: 'test',
        subpixelMode: true,
        subpixelGrid: 4,
        subpixelGridSize: '4x4',
        subpixelCenterRule: 'halftone_center',
        subpixelNeutralColor: '#888888',
        subpixelFinderOverride: 'stylized',
      });
      expect(params).toContain('subpixel=1');
      expect(params).toContain('spGridNum=4');
      expect(params).toContain('spGrid=4x4');
      expect(params).toContain('spCenter=halftone_center');
      expect(params).toContain('spNeutral=888888');
      expect(params).toContain('spFinder=stylized');
    });

    it('serializes halftone params', async () => {
      const params = await build({
        data: 'test',
        halftoneCell: '4x4',
        halftoneDotShape: 'square',
        brightnessCurve: 'gamma',
        duotoneColor1: '#ff0000',
        duotoneColor2: '#0000ff',
      });
      expect(params).toContain('htCell=4x4');
      expect(params).toContain('htDot=square');
      expect(params).toContain('htCurve=gamma');
      expect(params).toContain('duo1=ff0000');
      expect(params).toContain('duo2=0000ff');
    });

    it('serializes animation params', async () => {
      const params = await build({
        data: 'test',
        speed: 200,
        loop: false,
        reverse: true,
        bounce: true,
        startFrame: 5,
        maxFrames: 100,
        frameStep: 2,
        interpolate: 'linear',
        temporalDither: 'blue_noise',
        pattern: 'wave',
        moduleJitter: 0.5,
        colorCycle: true,
        seed: 1234,
        easing: 'ease-in',
      });
      expect(params).toContain('speed=200');
      expect(params).toContain('loop=0');
      expect(params).toContain('reverse=1');
      expect(params).toContain('bounce=1');
      expect(params).toContain('startF=5');
      expect(params).toContain('maxF=100');
      expect(params).toContain('stepF=2');
      expect(params).toContain('interp=linear');
      expect(params).toContain('tempDither=blue_noise');
      expect(params).toContain('animPattern=wave');
      expect(params).toContain('jitter=0.5');
      expect(params).toContain('colorCycle=1');
      expect(params).toContain('seed=1234');
      expect(params).toContain('easing=ease-in');
    });

    it('serializes animation top-level params (animFrames, animSpeed, animSeed)', async () => {
      const params = await build({
        data: 'test',
        animationFrames: 30,
        animationSpeed: 200,
        animationSeed: 42,
      });
      expect(params).toContain('animFrames=30');
      expect(params).toContain('animSpeed=200');
      expect(params).toContain('animSeed=42');
    });

    it('serializes output params', async () => {
      const params = await build({
        data: 'test',
        width: 800,
        height: 600,
        format: 'png',
        quality: 0.8,
        jpegQuality: 85,
        webpQuality: 80,
        gifColors: 128,
        filename: 'myqr',
        dpi: 300,
      });
      expect(params).toContain('w=800');
      expect(params).toContain('h=600');
      expect(params).toContain('format=png');
      expect(params).toContain('quality=0.8');
      expect(params).toContain('jpegQ=85');
      expect(params).toContain('webpQ=80');
      expect(params).toContain('gifColors=128');
      expect(params).toContain('fname=myqr');
      expect(params).toContain('dpi=300');
    });

    it('serializes GIF output params', async () => {
      const params = await build({
        data: 'test',
        gifPaletteSize: 128,
        gifQuantizer: 'octree',
        gifDither: 'floyd_steinberg',
        gifDisposal: 'background',
        gifTransparentColor: '#00ff00',
      });
      expect(params).toContain('gifPal=128');
      expect(params).toContain('gifQuant=octree');
      expect(params).toContain('gifDith=floyd_steinberg');
      expect(params).toContain('gifDisp=background');
      expect(params).toContain('gifTrans=00ff00');
    });

    it('serializes SVG output params', async () => {
      const params = await build({
        data: 'test',
        svgTrueVector: true,
        svgShapePrecision: 'high',
        svgEmbedRasterOverlay: false,
      });
      expect(params).toContain('svgVec=1');
      expect(params).toContain('svgPrec=high');
      expect(params).toContain('svgEmbed=0');
    });

    it('serializes includeQuietZone=false, bgOverride, formatExtra', async () => {
      const params = await build({
        data: 'test',
        includeQuietZone: false,
        bgOverride: '#ff00ff',
        formatExtra: 'test_extra',
      });
      expect(params).toContain('inclQz=0');
      expect(params).toContain('bgOver=ff00ff');
      expect(params).toContain('fmtExtra=test_extra');
    });

    it('serializes safety params', async () => {
      const params = await build({
        data: 'test',
        safetyMode: 'strict',
        safetyMinModulePx: 6,
        safetyMinQuietZone: 5,
      });
      expect(params).toContain('safeMode=strict');
      expect(params).toContain('safeMinPx=6');
      expect(params).toContain('safeMinQz=5');
    });

    it('serializes lock flags (false = non-default)', async () => {
      const params = await build({
        data: 'test',
        lockFinders: false,
        lockTiming: false,
        lockAlign: false,
        lockFormat: false,
        lockVersion: false,
      });
      expect(params).toContain('lockF=0');
      expect(params).toContain('lockT=0');
      expect(params).toContain('lockA=0');
      expect(params).toContain('lockFmt=0');
      expect(params).toContain('lockV=0');
    });

    it('serializes QA params', async () => {
      const params = await build({
        data: 'test',
        qaContrastCheck: true,
        qaSimulateBlur: 2.5,
        qaSimulateNoise: 10,
        qaSimulateRotation: 15,
        qaShowHeatmap: true,
      });
      expect(params).toContain('qaContrast=1');
      expect(params).toContain('qaBlur=2.5');
      expect(params).toContain('qaNoise=10');
      expect(params).toContain('qaRot=15');
      expect(params).toContain('qaHeatmap=1');
    });

    it('serializes auto-tuning params', async () => {
      const params = await build({
        data: 'test',
        autoPickVersion: false,
        autoPickEcc: true,
        autoReduceIntensity: true,
      });
      expect(params).toContain('autoVer=0');
      expect(params).toContain('autoEcc=1');
      expect(params).toContain('autoReduce=1');
    });

    it('serializes watermark params', async () => {
      const params = await build({
        data: 'test',
        watermarkEnabled: true,
        watermarkKind: 'image',
        watermarkText: 'ANQR',
        watermarkPosition: 'bottom',
        watermarkOpacity: 80,
        watermarkBlend: 'multiply',
        watermarkImageUrl: 'https://example.com/wm.png',
      });
      expect(params).toContain('wmEn=1');
      expect(params).toContain('wmKind=image');
      expect(params).toContain('wmText=ANQR');
      expect(params).toContain('wmPos=bottom');
      expect(params).toContain('wmOpacity=80');
      expect(params).toContain('wmBlend=multiply');
      expect(params).toContain('wmImg=');
    });

    it('serializes metadata params', async () => {
      const params = await build({
        data: 'test',
        metaTitle: 'My QR',
        metaAuthor: 'Test Author',
        metaCopyright: 'CC BY 4.0',
        metaLicense: 'MIT',
        metaDescription: 'A test QR code',
        metaCreationTime: true,
        metaCustomKv: 'key1=val1',
      });
      expect(params).toContain('metaTitle=My+QR');
      expect(params).toContain('metaAuthor=Test+Author');
      expect(params).toContain('metaCopy=');
      expect(params).toContain('metaLic=MIT');
      expect(params).toContain('metaDesc=');
      expect(params).toContain('metaTime=1');
      expect(params).toContain('metaKv=');
    });

    it('serializes palette params', async () => {
      const params = await build({
        data: 'test',
        palette: 'viridis',
        paletteMode: 'discrete',
      });
      expect(params).toContain('palette=viridis');
      expect(params).toContain('paletteMode=discrete');
    });

    it('serializes per-ECC limit params', async () => {
      const params = await build({
        data: 'test',
        maxOverlayIntensityL: 25,
        maxOverlayIntensityM: 45,
        maxOverlayIntensityQ: 65,
        maxOverlayIntensityH: 80,
      });
      expect(params).toContain('maxIntL=25');
      expect(params).toContain('maxIntM=45');
      expect(params).toContain('maxIntQ=65');
      expect(params).toContain('maxIntH=80');
    });

    it('does NOT serialize modulePx (parse-only param)', async () => {
      const params = await build({
        data: 'test',
        modulePx: 8,
      });
      expect(params).not.toContain('modulePx=');
    });

    it('serializes language when not en', async () => {
      const params = await build({ data: 'test', lang: 'de' });
      expect(params).toContain('lang=de');
    });

    it('does NOT serialize lang=en', async () => {
      const params = await build({ data: 'test', lang: 'en' });
      expect(params).not.toContain('lang=');
    });

    it('serializes characterEncoding', async () => {
      const params = await build({ data: 'test', characterEncoding: 'UTF-8' });
      expect(params).toContain('charset=UTF-8');
    });

    it('serializes borderModulesExtra', async () => {
      const params = await build({ data: 'test', borderModulesExtra: 2 });
      expect(params).toContain('border=2');
    });

    it('serializes quietZoneMinEnforce', async () => {
      const params = await build({ data: 'test', quietZoneMinEnforce: false });
      expect(params).toContain('qzEnforce=0');
    });
  });

  // ========================================================================
  // Round-trip: buildUrlParams → parseUrlParamsFromSearchParams
  // ========================================================================
  describe('round-trip buildUrlParams → parseUrlParamsFromSearchParams', () => {
    it('recovers data param', async () => {
      const mod = await getMod();
      const config = { data: 'Hello World' };
      const params = mod.buildUrlParams(config as never);
      const parsed = mod.parseUrlParamsFromSearchParams(new URLSearchParams(params));
      expect(parsed.data).toBe('Hello World');
    });

    it('recovers QR settings', async () => {
      const mod = await getMod();
      const config = {
        data: 'test',
        ec: 'L',
        version: 5,
        margin: 2,
        encodingMode: 'byte',
      };
      const params = mod.buildUrlParams(config as never);
      const parsed = mod.parseUrlParamsFromSearchParams(new URLSearchParams(params));
      expect(parsed.ec).toBe('L');
      expect(parsed.version).toBe(5);
      expect(parsed.margin).toBe(2);
      expect(parsed.encodingMode).toBe('byte');
    });

    it('recovers color settings', async () => {
      const mod = await getMod();
      const config = {
        data: 'test',
        fg: '#ff0000',
        bg: '#00ff00',
        transparent: true,
      };
      const params = mod.buildUrlParams(config as never);
      const parsed = mod.parseUrlParamsFromSearchParams(new URLSearchParams(params));
      expect(parsed.fg).toBe('#ff0000');
      expect(parsed.bg).toBe('#00ff00');
      expect(parsed.transparent).toBe(true);
    });

    it('recovers overlay settings', async () => {
      const mod = await getMod();
      const config = {
        data: 'test',
        overlayUrl: 'https://example.com/logo.png',
        mode: 'logo',
        intensity: 75,
        flipX: true,
        flipY: true,
      };
      const params = mod.buildUrlParams(config as never);
      const parsed = mod.parseUrlParamsFromSearchParams(new URLSearchParams(params));
      expect(parsed.mode).toBe('logo');
      expect(parsed.intensity).toBe(75);
      expect(parsed.flipX).toBe(true);
      expect(parsed.flipY).toBe(true);
    });

    it('recovers animation settings', async () => {
      const mod = await getMod();
      const config = {
        data: 'test',
        speed: 200,
        reverse: true,
        bounce: true,
      };
      const params = mod.buildUrlParams(config as never);
      const parsed = mod.parseUrlParamsFromSearchParams(new URLSearchParams(params));
      expect(parsed.speed).toBe(200);
      expect(parsed.reverse).toBe(true);
      expect(parsed.bounce).toBe(true);
    });

    it('recovers safety settings', async () => {
      const mod = await getMod();
      const config = {
        data: 'test',
        safetyMode: 'strict',
        safetyMinModulePx: 6,
        lockFinders: false,
      };
      const params = mod.buildUrlParams(config as never);
      const parsed = mod.parseUrlParamsFromSearchParams(new URLSearchParams(params));
      expect(parsed.safetyMode).toBe('strict');
      expect(parsed.safetyMinModulePx).toBe(6);
      expect(parsed.lockFinders).toBe(false);
    });

    it('recovers watermark settings', async () => {
      const mod = await getMod();
      const config = {
        data: 'test',
        watermarkEnabled: true,
        watermarkKind: 'image',
        watermarkText: 'HELLO',
        watermarkOpacity: 80,
      };
      const params = mod.buildUrlParams(config as never);
      const parsed = mod.parseUrlParamsFromSearchParams(new URLSearchParams(params));
      expect(parsed.watermarkEnabled).toBe(true);
      expect(parsed.watermarkKind).toBe('image');
      expect(parsed.watermarkText).toBe('HELLO');
      expect(parsed.watermarkOpacity).toBe(80);
    });

    it('recovers per-ECC limits', async () => {
      const mod = await getMod();
      const config = {
        data: 'test',
        maxOverlayIntensityL: 25,
        maxOverlayIntensityH: 80,
      };
      const params = mod.buildUrlParams(config as never);
      const parsed = mod.parseUrlParamsFromSearchParams(new URLSearchParams(params));
      expect(parsed.maxOverlayIntensityL).toBe(25);
      expect(parsed.maxOverlayIntensityH).toBe(80);
    });
  });

  // ========================================================================
  // getShareableUrl
  // ========================================================================
  describe('getShareableUrl', () => {
    it('uses provided baseUrl', async () => {
      const mod = await getMod();
      const url = mod.getShareableUrl({ data: 'test' } as never, 'https://custom.example.com');
      expect(url).toContain('https://custom.example.com');
      expect(url).toContain('data=test');
    });

    it('uses anqr.link for localhost origin', async () => {
      const mod = await getMod();
      const originalLocation = globalThis.location;
      (globalThis as Record<string, unknown>).location = {
        hostname: 'localhost',
        origin: 'http://localhost:3000',
        pathname: '/',
        protocol: 'http:',
        search: '',
      };
      try {
        const url = mod.getShareableUrl({ data: 'test' } as never);
        expect(url).toContain('anqr.link');
      } finally {
        (globalThis as Record<string, unknown>).location = originalLocation;
      }
    });

    it('uses anqr.link for capacitor protocol', async () => {
      const mod = await getMod();
      const originalLocation = globalThis.location;
      (globalThis as Record<string, unknown>).location = {
        hostname: 'localhost',
        origin: 'capacitor://localhost',
        pathname: '/',
        protocol: 'capacitor:',
        search: '',
      };
      try {
        const url = mod.getShareableUrl({ data: 'test' } as never);
        expect(url).toContain('anqr.link');
      } finally {
        (globalThis as Record<string, unknown>).location = originalLocation;
      }
    });
  });

  // ========================================================================
  // checkShareUrlLength
  // ========================================================================
  describe('checkShareUrlLength', () => {
    it('returns null for short URL', async () => {
      const mod = await getMod();
      const result = mod.checkShareUrlLength('https://anqr.app/?data=hello');
      expect(result).toBeNull();
    });

    it('returns warning string for very long URL', async () => {
      const mod = await getMod();
      const longUrl = 'https://anqr.app/?' + 'x'.repeat(10000);
      const result = mod.checkShareUrlLength(longUrl);
      expect(result).not.toBeNull();
      expect(typeof result).toBe('string');
    });
  });

  // ========================================================================
  // parseUrlParams (browser-only wrapper)
  // ========================================================================
  describe('parseUrlParams', () => {
    it('reads from globalThis.location.search', async () => {
      const mod = await getMod();
      const originalLocation = globalThis.location;
      (globalThis as Record<string, unknown>).location = { search: '?data=hello&ec=L', origin: 'https://anqr.app' };
      try {
        const parsed = mod.parseUrlParams();
        expect(parsed.data).toBe('hello');
        expect(parsed.ec).toBe('L');
      } finally {
        (globalThis as Record<string, unknown>).location = originalLocation;
      }
    });

    it('returns empty config for empty search', async () => {
      const mod = await getMod();
      const originalLocation = globalThis.location;
      (globalThis as Record<string, unknown>).location = { search: '', origin: 'https://anqr.app' };
      try {
        const parsed = mod.parseUrlParams();
        expect(parsed.data).toBeUndefined();
      } finally {
        (globalThis as Record<string, unknown>).location = originalLocation;
      }
    });
  });
});
