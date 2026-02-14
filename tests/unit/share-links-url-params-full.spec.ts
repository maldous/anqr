import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../../src/lib/logger', () => ({
  createLogger: () => ({ trace: vi.fn(), debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }),
}));

describe('share-links/url-params', () => {
  let parseUrlParamsFromSearchParams: typeof import('../../src/modules/share-links/url-params').parseUrlParamsFromSearchParams;
  let buildUrlParams: typeof import('../../src/modules/share-links/url-params').buildUrlParams;
  let getShareableUrl: typeof import('../../src/modules/share-links/url-params').getShareableUrl;
  let checkShareUrlLength: typeof import('../../src/modules/share-links/url-params').checkShareUrlLength;

  beforeEach(async () => {
    const mod = await import('../../src/modules/share-links/url-params');
    parseUrlParamsFromSearchParams = mod.parseUrlParamsFromSearchParams;
    buildUrlParams = mod.buildUrlParams;
    getShareableUrl = mod.getShareableUrl;
    checkShareUrlLength = mod.checkShareUrlLength;
  });

  // ==========================================
  // parseUrlParamsFromSearchParams
  // ==========================================

  describe('parseUrlParamsFromSearchParams', () => {
    it('returns mostly-undefined for empty params', () => {
      const result = parseUrlParamsFromSearchParams(new URLSearchParams());
      expect(result.data).toBeUndefined();
      expect(result.ec).toBeUndefined();
      expect(result.fg).toBeUndefined();
    });

    it('parses data param', () => {
      const params = new URLSearchParams('data=Hello+World');
      const result = parseUrlParamsFromSearchParams(params);
      expect(result.data).toBe('Hello World');
    });

    it('parses lang param', () => {
      const params = new URLSearchParams('lang=de-DE');
      const result = parseUrlParamsFromSearchParams(params);
      expect(result.lang).toBe('de-DE');
    });

    it('parses all QR settings', () => {
      const params = new URLSearchParams('ec=M&v=5&size=30&margin=2&enc=byte&charset=utf8&border=2&qzEnforce=1');
      const result = parseUrlParamsFromSearchParams(params);
      expect(result.ec).toBe('M');
      expect(result.version).toBe(5);
      expect(result.size).toBe(30);
      expect(result.margin).toBe(2);
      expect(result.encodingMode).toBe('byte');
      expect(result.characterEncoding).toBe('utf8');
      expect(result.borderModulesExtra).toBe(2);
      expect(result.quietZoneMinEnforce).toBe(true);
    });

    it('parses mask=auto', () => {
      const params = new URLSearchParams('mask=auto');
      const result = parseUrlParamsFromSearchParams(params);
      expect(result.maskPattern).toBe('auto');
    });

    it('parses mask=3 as integer', () => {
      const params = new URLSearchParams('mask=3');
      const result = parseUrlParamsFromSearchParams(params);
      expect(result.maskPattern).toBe(3);
    });

    it('parses color params with # prefix', () => {
      const params = new URLSearchParams('fg=ff0000&bg=00ff00&transparent=1');
      const result = parseUrlParamsFromSearchParams(params);
      expect(result.fg).toBe('#ff0000');
      expect(result.bg).toBe('#00ff00');
      expect(result.transparent).toBe(true);
    });

    it('parses all style params', () => {
      const params = new URLSearchParams('style=dot&finder=circle&align=diamond&timing=dash');
      const result = parseUrlParamsFromSearchParams(params);
      expect(result.style).toBe('dot');
      expect(result.finder).toBe('circle');
      expect(result.alignmentStyle).toBe('diamond');
      expect(result.timingStyle).toBe('dash');
    });

    it('parses all render params', () => {
      const params = new URLSearchParams(
        'gap=2&gapMode=inner&radius=5&grad=linear&gradStops=ff0000,0,00ff00,1&gradAngle=45' +
        '&eyeOuter=rounded&eyeInner=circle&eyeScale=120&frame=box&frameText=Scan+me' +
        '&dotRot=45&crisp=1&snap=round&modColor=position&cGuard=1&minContrast=7&subpixel=1&spGridNum=4'
      );
      const result = parseUrlParamsFromSearchParams(params);
      expect(result.moduleGap).toBe(2);
      expect(result.gapMode).toBe('inner');
      expect(result.cornerRadius).toBe(5);
      expect(result.gradientType).toBe('linear');
      expect(result.gradientStops).toEqual([
        { color: '#ff0000', pos: 0 },
        { color: '#00ff00', pos: 1 },
      ]);
      expect(result.gradientAngle).toBe(45);
      expect(result.eyeOuterStyle).toBe('rounded');
      expect(result.eyeInnerStyle).toBe('circle');
      expect(result.eyeScale).toBe(120);
      expect(result.frameStyle).toBe('box');
      expect(result.frameText).toBe('Scan me');
      expect(result.dotRotation).toBe(45);
      expect(result.crispEdges).toBe(true);
      expect(result.pixelSnap).toBe('round');
      expect(result.perModuleColorMode).toBe('position');
      expect(result.contrastGuard).toBe(true);
      expect(result.minContrastRatio).toBe(7);
      expect(result.subpixelMode).toBe(true);
      expect(result.subpixelGrid).toBe(4);
    });

    it('parses all overlay params', () => {
      const params = new URLSearchParams(
        'mode=logo&intensity=80&logoSize=30&img=https://example.com/logo.png&ovType=animated&ovFramePick=first' +
        '&cropEn=1&cropX=0.3&cropY=0.4&cropSize=0.8' +
        '&gifDelays=0&gifMaxFps=15&gifDispH=ignore' +
        '&fit=contain&rot=90&flipX=1&flipY=1' +
        '&keepFinders=0&keepTiming=1&keepAlign=1&protectFmt=1&protectVer=1' +
        '&eccAware=1&eccRisk=75&eccMap=uniform'
      );
      const result = parseUrlParamsFromSearchParams(params);
      expect(result.mode).toBe('logo');
      expect(result.intensity).toBe(80);
      expect(result.logoSize).toBe(30);
      expect(result.overlayUrl).toBe('https://example.com/logo.png');
      expect(result.overlayType).toBe('animated');
      expect(result.overlayFramePick).toBe('first');
      expect(result.cropEnabled).toBe(true);
      expect(result.cropX).toBe(0.3);
      expect(result.cropY).toBe(0.4);
      expect(result.cropSize).toBe(0.8);
      expect(result.gifUseFrameDelays).toBe(false);
      expect(result.gifMaxFps).toBe(15);
      expect(result.gifDisposalHandling).toBe('ignore');
      expect(result.fit).toBe('contain');
      expect(result.rotate).toBe(90);
      expect(result.flipX).toBe(true);
      expect(result.flipY).toBe(true);
      expect(result.preserveFinders).toBe(false);
      expect(result.preserveTiming).toBe(true);
      expect(result.preserveAlignment).toBe(true);
      expect(result.protectFormatInfo).toBe(true);
      expect(result.protectVersionInfo).toBe(true);
      expect(result.eccAwareEnabled).toBe(true);
      expect(result.eccAwareRiskBudget).toBe(75);
      expect(result.eccAwareWeightMap).toBe('uniform');
    });

    it('parses overlay preprocessing params', () => {
      const params = new URLSearchParams(
        'colorMode=grayscale&brightness=20&contrast=30&gamma=1.5&saturation=50' +
        '&blur=3&sharpen=2&posterize=4&threshold=100&edge=sobel&invert=1&hue=180'
      );
      const result = parseUrlParamsFromSearchParams(params);
      expect(result.colorMode).toBe('grayscale');
      expect(result.brightness).toBe(20);
      expect(result.contrast).toBe(30);
      expect(result.gamma).toBe(1.5);
      expect(result.saturation).toBe(50);
      expect(result.blur).toBe(3);
      expect(result.sharpen).toBe(2);
      expect(result.posterize).toBe(4);
      expect(result.threshold).toBe(100);
      expect(result.edge).toBe('sobel');
      expect(result.invert).toBe(true);
      expect(result.hue).toBe(180);
    });

    it('parses dither params', () => {
      const params = new URLSearchParams(
        'ditherKind=ordered&diffusionKernel=atkinson&ditherStrength=75&finderDither=80&blendPres=1&serpentine=1' +
        '&matrix=bayer8&bnTile=128&bnSeed=42&colorDither=rgb'
      );
      const result = parseUrlParamsFromSearchParams(params);
      expect(result.ditherKind).toBe('ordered');
      expect(result.diffusionKernel).toBe('atkinson');
      expect(result.ditherStrength).toBe(75);
      expect(result.finderDitherStrength).toBe(80);
      expect(result.blendPreservations).toBe(true);
      expect(result.ditherSerpentine).toBe(true);
      expect(result.orderedMatrix).toBe('bayer8');
      expect(result.blueNoiseTileSize).toBe(128);
      expect(result.blueNoiseSeed).toBe(42);
      expect(result.colorDither).toBe('rgb');
    });

    it('parses subpixel params', () => {
      const params = new URLSearchParams('spGrid=4x4&spCenter=halftone_center&spNeutral=808080&spFinder=stylized');
      const result = parseUrlParamsFromSearchParams(params);
      expect(result.subpixelGridSize).toBe('4x4');
      expect(result.subpixelCenterRule).toBe('halftone_center');
      expect(result.subpixelNeutralColor).toBe('#808080');
      expect(result.subpixelFinderOverride).toBe('stylized');
    });

    it('parses halftone params', () => {
      const params = new URLSearchParams('htCell=2x2&htDot=square&htCurve=gamma&duo1=ff0000&duo2=0000ff');
      const result = parseUrlParamsFromSearchParams(params);
      expect(result.halftoneCell).toBe('2x2');
      expect(result.halftoneDotShape).toBe('square');
      expect(result.brightnessCurve).toBe('gamma');
      expect(result.duotoneColor1).toBe('#ff0000');
      expect(result.duotoneColor2).toBe('#0000ff');
    });

    it('parses animation params', () => {
      const params = new URLSearchParams(
        'speed=200&loop=0&reverse=1&bounce=1&startF=5&maxF=20&stepF=2' +
        '&interp=linear&tempDither=blue_noise&animPattern=wave&jitter=0.5&colorCycle=1&seed=42&easing=ease-in'
      );
      const result = parseUrlParamsFromSearchParams(params);
      expect(result.speed).toBe(200);
      expect(result.loop).toBe(false);
      expect(result.reverse).toBe(true);
      expect(result.bounce).toBe(true);
      expect(result.startFrame).toBe(5);
      expect(result.maxFrames).toBe(20);
      expect(result.frameStep).toBe(2);
      expect(result.interpolate).toBe('linear');
      expect(result.temporalDither).toBe('blue_noise');
      expect(result.pattern).toBe('wave');
      expect(result.moduleJitter).toBe(0.5);
      expect(result.colorCycle).toBe(true);
      expect(result.seed).toBe(42);
      expect(result.easing).toBe('ease-in');
    });

    it('parses output params', () => {
      const params = new URLSearchParams(
        'w=800&h=600&format=png&quality=0.95&jpegQ=85&webpQ=80&gifColors=128&fname=myqr' +
        '&gifPal=128&gifQuant=octree&gifDith=ordered&gifDisp=none&gifTrans=ffffff' +
        '&svgVec=1&svgPrec=module&svgEmbed=0&dpi=300&inclQz=0&bgOver=eeeeee&fmtExtra=print'
      );
      const result = parseUrlParamsFromSearchParams(params);
      expect(result.width).toBe(800);
      expect(result.height).toBe(600);
      expect(result.format).toBe('png');
      expect(result.quality).toBe(0.95);
      expect(result.jpegQuality).toBe(85);
      expect(result.webpQuality).toBe(80);
      expect(result.gifColors).toBe(128);
      expect(result.filename).toBe('myqr');
      expect(result.gifPaletteSize).toBe(128);
      expect(result.gifQuantizer).toBe('octree');
      expect(result.gifDither).toBe('ordered');
      expect(result.gifDisposal).toBe('none');
      expect(result.gifTransparentColor).toBe('#ffffff');
      expect(result.svgTrueVector).toBe(true);
      expect(result.svgShapePrecision).toBe('module');
      expect(result.svgEmbedRasterOverlay).toBe(false);
      expect(result.dpi).toBe(300);
      expect(result.includeQuietZone).toBe(false);
      expect(result.bgOverride).toBe('#eeeeee');
      expect(result.formatExtra).toBe('print');
    });

    it('parses safety params', () => {
      const params = new URLSearchParams(
        'safeMode=strict&safeMinPx=6&safeMinQz=6' +
        '&lockF=0&lockT=0&lockA=0&lockFmt=0&lockV=0'
      );
      const result = parseUrlParamsFromSearchParams(params);
      expect(result.safetyMode).toBe('strict');
      expect(result.safetyMinModulePx).toBe(6);
      expect(result.safetyMinQuietZone).toBe(6);
      expect(result.lockFinders).toBe(false);
      expect(result.lockTiming).toBe(false);
      expect(result.lockAlign).toBe(false);
      expect(result.lockFormat).toBe(false);
      expect(result.lockVersion).toBe(false);
    });

    it('parses QA params', () => {
      const params = new URLSearchParams('qaContrast=1&qaBlur=2.5&qaNoise=10&qaRot=15&qaHeatmap=1');
      const result = parseUrlParamsFromSearchParams(params);
      expect(result.qaContrastCheck).toBe(true);
      expect(result.qaSimulateBlur).toBe(2.5);
      expect(result.qaSimulateNoise).toBe(10);
      expect(result.qaSimulateRotation).toBe(15);
      expect(result.qaShowHeatmap).toBe(true);
    });

    it('parses auto-tuning params', () => {
      const params = new URLSearchParams('autoVer=0&autoEcc=1&autoReduce=1');
      const result = parseUrlParamsFromSearchParams(params);
      expect(result.autoPickVersion).toBe(false);
      expect(result.autoPickEcc).toBe(true);
      expect(result.autoReduceIntensity).toBe(true);
    });

    it('parses watermark params', () => {
      const params = new URLSearchParams(
        'wmEn=1&wmKind=image&wmText=Copyright&wmPos=bottom-right&wmOpacity=75&wmBlend=multiply&wmImg=https://example.com/wm.png'
      );
      const result = parseUrlParamsFromSearchParams(params);
      expect(result.watermarkEnabled).toBe(true);
      expect(result.watermarkKind).toBe('image');
      expect(result.watermarkText).toBe('Copyright');
      expect(result.watermarkPosition).toBe('bottom-right');
      expect(result.watermarkOpacity).toBe(75);
      expect(result.watermarkBlend).toBe('multiply');
      expect(result.watermarkImageUrl).toBe('https://example.com/wm.png');
    });

    it('parses animation pattern params', () => {
      const params = new URLSearchParams('animPattern=spiral&animFrames=30&animSpeed=150&animSeed=99');
      const result = parseUrlParamsFromSearchParams(params);
      expect(result.animationPattern).toBe('spiral');
      expect(result.animationFrames).toBe(30);
      expect(result.animationSpeed).toBe(150);
      expect(result.animationSeed).toBe(99);
    });

    it('parses metadata params', () => {
      const params = new URLSearchParams(
        'metaTitle=My+QR&metaAuthor=Alice&metaCopy=2024&metaLic=MIT&metaDesc=A+QR+code&metaTime=1&metaKv=key1:val1'
      );
      const result = parseUrlParamsFromSearchParams(params);
      expect(result.metaTitle).toBe('My QR');
      expect(result.metaAuthor).toBe('Alice');
      expect(result.metaCopyright).toBe('2024');
      expect(result.metaLicense).toBe('MIT');
      expect(result.metaDescription).toBe('A QR code');
      expect(result.metaCreationTime).toBe(true);
      expect(result.metaCustomKv).toBe('key1:val1');
    });

    it('parses palette params', () => {
      const params = new URLSearchParams('palette=rainbow&paletteMode=brightness');
      const result = parseUrlParamsFromSearchParams(params);
      expect(result.palette).toBe('rainbow');
      expect(result.paletteMode).toBe('brightness');
    });

    it('parses per-ECC overlay intensity limits (canonical keys)', () => {
      const params = new URLSearchParams('maxIntL=40&maxIntM=60&maxIntQ=80&maxIntH=90');
      const result = parseUrlParamsFromSearchParams(params);
      expect(result.maxOverlayIntensityL).toBe(40);
      expect(result.maxOverlayIntensityM).toBe(60);
      expect(result.maxOverlayIntensityQ).toBe(80);
      expect(result.maxOverlayIntensityH).toBe(90);
    });

    it('parses per-ECC overlay intensity limits (legacy keys)', () => {
      const params = new URLSearchParams(
        'maxOverlayIntensityL=35&maxOverlayIntensityM=55&maxOverlayIntensityQ=75&maxOverlayIntensityH=85'
      );
      const result = parseUrlParamsFromSearchParams(params);
      expect(result.maxOverlayIntensityL).toBe(35);
      expect(result.maxOverlayIntensityM).toBe(55);
      expect(result.maxOverlayIntensityQ).toBe(75);
      expect(result.maxOverlayIntensityH).toBe(85);
    });

    it('parses modulePx param', () => {
      const params = new URLSearchParams('modulePx=10');
      const result = parseUrlParamsFromSearchParams(params);
      expect(result.modulePx).toBe(10);
    });
  });

  // ==========================================
  // buildUrlParams
  // ==========================================

  describe('buildUrlParams', () => {
    it('returns empty string for empty config', () => {
      expect(buildUrlParams({})).toBe('');
    });

    it('serializes data only', () => {
      const result = buildUrlParams({ data: 'Hello' });
      expect(result).toContain('data=Hello');
    });

    it('does NOT serialize default values', () => {
      const result = buildUrlParams({
        data: 'test',
        ec: 'H', // default
        style: 'square', // default
        finder: 'square', // default
        margin: 4, // default
        moduleGap: 0, // default
        cornerRadius: 0, // default
      });
      expect(result).not.toContain('ec=');
      expect(result).not.toContain('style=');
      expect(result).not.toContain('finder=');
      expect(result).not.toContain('margin=');
      expect(result).not.toContain('gap=');
      expect(result).not.toContain('radius=');
    });

    it('serializes non-default QR settings', () => {
      const result = buildUrlParams({
        ec: 'M',
        version: 5,
        size: 30,
        margin: 2,
        encodingMode: 'byte',
      });
      expect(result).toContain('ec=M');
      expect(result).toContain('v=5');
      expect(result).toContain('size=30');
      expect(result).toContain('margin=2');
      expect(result).toContain('enc=byte');
    });

    it('serializes colors without # prefix', () => {
      const result = buildUrlParams({
        fg: '#ff0000',
        bg: '#00ff00',
        transparent: true,
      });
      expect(result).toContain('fg=ff0000');
      expect(result).toContain('bg=00ff00');
      expect(result).toContain('transparent=1');
    });

    it('serializes gradient stops', () => {
      const result = buildUrlParams({
        gradientType: 'linear',
        gradientStops: [
          { color: '#ff0000', pos: 0 },
          { color: '#00ff00', pos: 1 },
        ],
        gradientAngle: 45,
      });
      expect(result).toContain('grad=linear');
      expect(result).toContain('gradStops=');
      expect(result).toContain('gradAngle=45');
    });

    it('serializes overlay params', () => {
      const result = buildUrlParams({
        overlayUrl: 'https://example.com/img.png',
        intensity: 80,
        fit: 'contain',
        rotate: 90,
        flipX: true,
        preserveFinders: false,
      });
      expect(result).toContain('img=');
      expect(result).toContain('intensity=80');
      expect(result).toContain('fit=contain');
      expect(result).toContain('rot=90');
      expect(result).toContain('flipX=1');
      expect(result).toContain('keepFinders=0');
    });

    it('serializes dithering params', () => {
      const result = buildUrlParams({
        ditherKind: 'ordered',
        diffusionKernel: 'atkinson',
        ditherStrength: 75,
        finderDitherStrength: 80,
        blendPreservations: true,
        ditherSerpentine: true,
      });
      expect(result).toContain('ditherKind=ordered');
      expect(result).toContain('diffusionKernel=atkinson');
      expect(result).toContain('ditherStrength=75');
      expect(result).toContain('finderDither=80');
      expect(result).toContain('blendPres=1');
      expect(result).toContain('serpentine=1');
    });

    it('serializes animation params', () => {
      const result = buildUrlParams({
        speed: 200,
        loop: false,
        reverse: true,
        bounce: true,
        easing: 'ease-in',
      });
      expect(result).toContain('speed=200');
      expect(result).toContain('loop=0');
      expect(result).toContain('reverse=1');
      expect(result).toContain('bounce=1');
      expect(result).toContain('easing=ease-in');
    });

    it('serializes output params', () => {
      const result = buildUrlParams({
        width: 800,
        height: 600,
        format: 'png',
        dpi: 300,
        includeQuietZone: false,
      });
      expect(result).toContain('w=800');
      expect(result).toContain('h=600');
      expect(result).toContain('format=png');
      expect(result).toContain('dpi=300');
      expect(result).toContain('inclQz=0');
    });

    it('serializes safety params', () => {
      const result = buildUrlParams({
        safetyMode: 'strict',
        safetyMinModulePx: 6,
        lockFinders: false,
        lockTiming: false,
      });
      expect(result).toContain('safeMode=strict');
      expect(result).toContain('safeMinPx=6');
      expect(result).toContain('lockF=0');
      expect(result).toContain('lockT=0');
    });

    it('serializes watermark params', () => {
      const result = buildUrlParams({
        watermarkEnabled: true,
        watermarkText: 'Copyright',
        watermarkPosition: 'bottom-right',
        watermarkOpacity: 75,
      });
      expect(result).toContain('wmEn=1');
      expect(result).toContain('wmText=Copyright');
      expect(result).toContain('wmPos=bottom-right');
      expect(result).toContain('wmOpacity=75');
    });

    it('serializes metadata params', () => {
      const result = buildUrlParams({
        metaTitle: 'My QR',
        metaAuthor: 'Alice',
        metaCreationTime: true,
      });
      expect(result).toContain('metaTitle=My+QR');
      expect(result).toContain('metaAuthor=Alice');
      expect(result).toContain('metaTime=1');
    });

    it('serializes per-ECC overlay intensity limits', () => {
      const result = buildUrlParams({
        maxOverlayIntensityL: 40,
        maxOverlayIntensityM: 60,
        maxOverlayIntensityQ: 80,
        maxOverlayIntensityH: 90,
      });
      expect(result).toContain('maxIntL=40');
      expect(result).toContain('maxIntM=60');
      expect(result).toContain('maxIntQ=80');
      expect(result).toContain('maxIntH=90');
    });

    it('serializes QA params', () => {
      const result = buildUrlParams({
        qaContrastCheck: true,
        qaSimulateBlur: 2.5,
        qaSimulateNoise: 10,
        qaShowHeatmap: true,
      });
      expect(result).toContain('qaContrast=1');
      expect(result).toContain('qaBlur=2.5');
      expect(result).toContain('qaNoise=10');
      expect(result).toContain('qaHeatmap=1');
    });

    it('serializes auto-tuning params', () => {
      const result = buildUrlParams({
        autoPickVersion: false,
        autoPickEcc: true,
        autoReduceIntensity: true,
      });
      expect(result).toContain('autoVer=0');
      expect(result).toContain('autoEcc=1');
      expect(result).toContain('autoReduce=1');
    });

    it('serializes subpixel params', () => {
      const result = buildUrlParams({
        subpixelGridSize: '4x4',
        subpixelCenterRule: 'halftone_center',
        subpixelNeutralColor: '#cccccc',
        subpixelFinderOverride: 'stylized',
      });
      expect(result).toContain('spGrid=4x4');
      expect(result).toContain('spCenter=halftone_center');
      expect(result).toContain('spNeutral=cccccc');
      expect(result).toContain('spFinder=stylized');
    });

    it('serializes halftone params', () => {
      const result = buildUrlParams({
        halftoneCell: '2x2',
        halftoneDotShape: 'square',
        brightnessCurve: 'gamma',
        duotoneColor1: '#ff0000',
        duotoneColor2: '#0000ff',
      });
      expect(result).toContain('htCell=2x2');
      expect(result).toContain('htDot=square');
      expect(result).toContain('htCurve=gamma');
      expect(result).toContain('duo1=ff0000');
      expect(result).toContain('duo2=0000ff');
    });

    it('serializes palette params', () => {
      const result = buildUrlParams({
        palette: 'rainbow',
        paletteMode: 'brightness',
      });
      expect(result).toContain('palette=rainbow');
      expect(result).toContain('paletteMode=brightness');
    });

    it('serializes mode when overlayUrl present', () => {
      const result = buildUrlParams({
        overlayUrl: 'https://example.com/img.png',
        mode: 'dithered',
      });
      expect(result).toContain('mode=dithered');
      expect(result).toContain('img=');
    });

    it('serializes mode when NOT default even without overlay', () => {
      const result = buildUrlParams({
        mode: 'logo',
      });
      expect(result).toContain('mode=logo');
    });

    it('serializes svgEmbedRasterOverlay=false', () => {
      const result = buildUrlParams({ svgEmbedRasterOverlay: false });
      expect(result).toContain('svgEmbed=0');
    });

    it('serializes gifTransparentColor', () => {
      const result = buildUrlParams({ gifTransparentColor: '#00ff00' });
      expect(result).toContain('gifTrans=00ff00');
    });

    it('serializes lang when not en', () => {
      const result = buildUrlParams({ lang: 'de' });
      expect(result).toContain('lang=de');
    });

    it('does not serialize lang=en', () => {
      const result = buildUrlParams({ lang: 'en' });
      expect(result).not.toContain('lang=');
    });
  });

  // ==========================================
  // Round-trip tests (parse → build → parse)
  // ==========================================

  describe('round-trip parse→build→parse', () => {
    it('round-trips basic config', () => {
      const original = { data: 'Hello', ec: 'M', version: 5 };
      const urlStr = buildUrlParams(original);
      const parsed = parseUrlParamsFromSearchParams(new URLSearchParams(urlStr));
      expect(parsed.data).toBe('Hello');
      expect(parsed.ec).toBe('M');
      expect(parsed.version).toBe(5);
    });

    it('round-trips overlay config', () => {
      const original = {
        overlayUrl: 'https://example.com/img.png',
        intensity: 80,
        fit: 'contain' as const,
        cropEnabled: true,
        cropX: 0.3,
        cropY: 0.4,
      };
      const urlStr = buildUrlParams(original);
      const parsed = parseUrlParamsFromSearchParams(new URLSearchParams(urlStr));
      expect(parsed.overlayUrl).toBe(original.overlayUrl);
      expect(parsed.intensity).toBe(original.intensity);
      expect(parsed.fit).toBe(original.fit);
      expect(parsed.cropEnabled).toBe(true);
      expect(parsed.cropX).toBe(0.3);
      expect(parsed.cropY).toBe(0.4);
    });

    it('round-trips colors', () => {
      const original = { fg: '#ff0000', bg: '#00ff00' };
      const urlStr = buildUrlParams(original);
      const parsed = parseUrlParamsFromSearchParams(new URLSearchParams(urlStr));
      expect(parsed.fg).toBe('#ff0000');
      expect(parsed.bg).toBe('#00ff00');
    });
  });

  // ==========================================
  // getShareableUrl
  // ==========================================

  describe('getShareableUrl', () => {
    it('uses provided baseUrl', () => {
      const url = getShareableUrl({ data: 'test' }, 'https://anqr.link/');
      expect(url).toContain('https://anqr.link/?data=test');
    });

    it('returns just baseUrl when no params', () => {
      const url = getShareableUrl({}, 'https://anqr.link/');
      expect(url).toBe('https://anqr.link/');
    });

    it('detects localhost and uses anqr.link', () => {
      const origLocation = globalThis.location;
      Object.defineProperty(globalThis, 'location', {
        value: {
          hostname: 'localhost',
          origin: 'http://localhost:3000',
          pathname: '/',
          protocol: 'http:',
        },
        writable: true,
        configurable: true,
      });
      const url = getShareableUrl({ data: 'test' });
      expect(url).toContain('https://anqr.link/');
      Object.defineProperty(globalThis, 'location', { value: origLocation, writable: true, configurable: true });
    });

    it('detects capacitor:// protocol', () => {
      const origLocation = globalThis.location;
      Object.defineProperty(globalThis, 'location', {
        value: {
          hostname: 'localhost',
          origin: 'capacitor://localhost',
          pathname: '/',
          protocol: 'capacitor:',
        },
        writable: true,
        configurable: true,
      });
      const url = getShareableUrl({ data: 'test' });
      expect(url).toContain('https://anqr.link/');
      Object.defineProperty(globalThis, 'location', { value: origLocation, writable: true, configurable: true });
    });

    it('uses actual origin for production URLs', () => {
      const origLocation = globalThis.location;
      Object.defineProperty(globalThis, 'location', {
        value: {
          hostname: 'anqr.link',
          origin: 'https://anqr.link',
          pathname: '/',
          protocol: 'https:',
        },
        writable: true,
        configurable: true,
      });
      const url = getShareableUrl({ data: 'test' });
      expect(url).toContain('https://anqr.link/?data=test');
      Object.defineProperty(globalThis, 'location', { value: origLocation, writable: true, configurable: true });
    });
  });

  // ==========================================
  // checkShareUrlLength
  // ==========================================

  describe('checkShareUrlLength', () => {
    it('returns null for short URL', () => {
      expect(checkShareUrlLength('https://anqr.link/?data=test')).toBeNull();
    });

    it('returns warning for URL exceeding max length', () => {
      const longUrl = 'https://anqr.link/?' + 'a'.repeat(2100);
      const result = checkShareUrlLength(longUrl);
      expect(result).not.toBeNull();
      expect(result).toContain('characters');
      expect(result).toContain('2048');
    });

    it('returns null for URL exactly at limit', () => {
      const url = 'x'.repeat(2048);
      expect(checkShareUrlLength(url)).toBeNull();
    });

    it('returns warning for URL one over limit', () => {
      const url = 'x'.repeat(2049);
      expect(checkShareUrlLength(url)).not.toBeNull();
    });
  });
});
