import { describe, expect, it, vi } from 'vitest';

vi.mock('../../src/lib/logger', () => ({
  createLogger: () => ({ trace: vi.fn(), debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }),
}));

describe('share-links url-params', () => {
  describe('parseUrlParamsFromSearchParams', () => {
    it('parses basic data and QR settings', async () => {
      const { parseUrlParamsFromSearchParams } = await import('../../src/modules/share-links/url-params');
      const params = new URLSearchParams('data=hello&ec=M&v=5&size=30&margin=2&enc=byte&border=2');
      const config = parseUrlParamsFromSearchParams(params);
      expect(config.data).toBe('hello');
      expect(config.ec).toBe('M');
      expect(config.version).toBe(5);
      expect(config.size).toBe(30);
      expect(config.margin).toBe(2);
      expect(config.encodingMode).toBe('byte');
      expect(config.borderModulesExtra).toBe(2);
    });

    it('parses mask as auto', async () => {
      const { parseUrlParamsFromSearchParams } = await import('../../src/modules/share-links/url-params');
      const params = new URLSearchParams('mask=auto');
      const config = parseUrlParamsFromSearchParams(params);
      expect(config.maskPattern).toBe('auto');
    });

    it('parses mask as number', async () => {
      const { parseUrlParamsFromSearchParams } = await import('../../src/modules/share-links/url-params');
      const params = new URLSearchParams('mask=3');
      const config = parseUrlParamsFromSearchParams(params);
      expect(config.maskPattern).toBe(3);
    });

    it('parses color settings with hash prefix', async () => {
      const { parseUrlParamsFromSearchParams } = await import('../../src/modules/share-links/url-params');
      const params = new URLSearchParams('fg=ff0000&bg=00ff00&transparent=1');
      const config = parseUrlParamsFromSearchParams(params);
      expect(config.fg).toBe('#ff0000');
      expect(config.bg).toBe('#00ff00');
      expect(config.transparent).toBe(true);
    });

    it('parses style settings', async () => {
      const { parseUrlParamsFromSearchParams } = await import('../../src/modules/share-links/url-params');
      const params = new URLSearchParams('style=rounded&finder=circle&align=dot&timing=line');
      const config = parseUrlParamsFromSearchParams(params);
      expect(config.style).toBe('rounded');
      expect(config.finder).toBe('circle');
      expect(config.alignmentStyle).toBe('dot');
      expect(config.timingStyle).toBe('line');
    });

    it('parses render settings', async () => {
      const { parseUrlParamsFromSearchParams } = await import('../../src/modules/share-links/url-params');
      const params = new URLSearchParams('gap=2&gapMode=uniform&radius=5&grad=linear&gradAngle=45');
      const config = parseUrlParamsFromSearchParams(params);
      expect(config.moduleGap).toBe(2);
      expect(config.gapMode).toBe('uniform');
      expect(config.cornerRadius).toBe(5);
      expect(config.gradientType).toBe('linear');
      expect(config.gradientAngle).toBe(45);
    });

    it('parses gradient stops', async () => {
      const { parseUrlParamsFromSearchParams } = await import('../../src/modules/share-links/url-params');
      const params = new URLSearchParams('gradStops=ff0000,0,0000ff,1');
      const config = parseUrlParamsFromSearchParams(params);
      expect(config.gradientStops).toEqual([
        { color: '#ff0000', pos: 0 },
        { color: '#0000ff', pos: 1 },
      ]);
    });

    it('parses overlay settings', async () => {
      const { parseUrlParamsFromSearchParams } = await import('../../src/modules/share-links/url-params');
      const params = new URLSearchParams('mode=dithered&intensity=80&logoSize=30&img=https://example.com/img.png&ovType=animated&ovFramePick=first');
      const config = parseUrlParamsFromSearchParams(params);
      expect(config.mode).toBe('dithered');
      expect(config.intensity).toBe(80);
      expect(config.logoSize).toBe(30);
      expect(config.overlayUrl).toBe('https://example.com/img.png');
      expect(config.overlayType).toBe('animated');
      expect(config.overlayFramePick).toBe('first');
    });

    it('parses crop settings', async () => {
      const { parseUrlParamsFromSearchParams } = await import('../../src/modules/share-links/url-params');
      const params = new URLSearchParams('cropEn=1&cropX=0.3&cropY=0.4&cropSize=0.8');
      const config = parseUrlParamsFromSearchParams(params);
      expect(config.cropEnabled).toBe(true);
      expect(config.cropX).toBe(0.3);
      expect(config.cropY).toBe(0.4);
      expect(config.cropSize).toBe(0.8);
    });

    it('parses preprocessing settings', async () => {
      const { parseUrlParamsFromSearchParams } = await import('../../src/modules/share-links/url-params');
      const params = new URLSearchParams('colorMode=grayscale&brightness=10&contrast=20&gamma=1.5&saturation=50&blur=2&sharpen=3&posterize=4&threshold=100&edge=sobel&invert=1&hue=180');
      const config = parseUrlParamsFromSearchParams(params);
      expect(config.colorMode).toBe('grayscale');
      expect(config.brightness).toBe(10);
      expect(config.contrast).toBe(20);
      expect(config.gamma).toBe(1.5);
      expect(config.saturation).toBe(50);
      expect(config.blur).toBe(2);
      expect(config.sharpen).toBe(3);
      expect(config.posterize).toBe(4);
      expect(config.threshold).toBe(100);
      expect(config.edge).toBe('sobel');
      expect(config.invert).toBe(true);
      expect(config.hue).toBe(180);
    });

    it('parses dithering settings', async () => {
      const { parseUrlParamsFromSearchParams } = await import('../../src/modules/share-links/url-params');
      const params = new URLSearchParams('ditherKind=ordered&diffusionKernel=atkinson&ditherStrength=75&serpentine=1&matrix=bayer8&bnTile=32&bnSeed=42&colorDither=pattern');
      const config = parseUrlParamsFromSearchParams(params);
      expect(config.ditherKind).toBe('ordered');
      expect(config.diffusionKernel).toBe('atkinson');
      expect(config.ditherStrength).toBe(75);
      expect(config.ditherSerpentine).toBe(true);
      expect(config.orderedMatrix).toBe('bayer8');
      expect(config.blueNoiseTileSize).toBe(32);
      expect(config.blueNoiseSeed).toBe(42);
      expect(config.colorDither).toBe('pattern');
    });

    it('parses subpixel settings', async () => {
      const { parseUrlParamsFromSearchParams } = await import('../../src/modules/share-links/url-params');
      const params = new URLSearchParams('subpixel=1&spGridNum=5&spGrid=5x5&spCenter=relaxed&spNeutral=808080&spFinder=dithered');
      const config = parseUrlParamsFromSearchParams(params);
      expect(config.subpixelMode).toBe(true);
      expect(config.subpixelGrid).toBe(5);
      expect(config.subpixelGridSize).toBe('5x5');
      expect(config.subpixelCenterRule).toBe('relaxed');
      expect(config.subpixelNeutralColor).toBe('#808080');
      expect(config.subpixelFinderOverride).toBe('dithered');
    });

    it('parses halftone settings', async () => {
      const { parseUrlParamsFromSearchParams } = await import('../../src/modules/share-links/url-params');
      const params = new URLSearchParams('htCell=2x2&htDot=square&htCurve=gamma&duo1=ff0000&duo2=0000ff');
      const config = parseUrlParamsFromSearchParams(params);
      expect(config.halftoneCell).toBe('2x2');
      expect(config.halftoneDotShape).toBe('square');
      expect(config.brightnessCurve).toBe('gamma');
      expect(config.duotoneColor1).toBe('#ff0000');
      expect(config.duotoneColor2).toBe('#0000ff');
    });

    it('parses animation settings', async () => {
      const { parseUrlParamsFromSearchParams } = await import('../../src/modules/share-links/url-params');
      const params = new URLSearchParams('speed=200&loop=0&reverse=1&bounce=1&startF=5&maxF=30&stepF=2&interp=linear&tempDither=blue_noise&animPattern=spiral&jitter=0.5&colorCycle=1&seed=42&easing=ease-in');
      const config = parseUrlParamsFromSearchParams(params);
      expect(config.speed).toBe(200);
      expect(config.loop).toBe(false);
      expect(config.reverse).toBe(true);
      expect(config.bounce).toBe(true);
      expect(config.startFrame).toBe(5);
      expect(config.maxFrames).toBe(30);
      expect(config.frameStep).toBe(2);
      expect(config.interpolate).toBe('linear');
      expect(config.temporalDither).toBe('blue_noise');
      expect(config.pattern).toBe('spiral');
      expect(config.moduleJitter).toBe(0.5);
      expect(config.colorCycle).toBe(true);
      expect(config.seed).toBe(42);
      expect(config.easing).toBe('ease-in');
    });

    it('parses output settings', async () => {
      const { parseUrlParamsFromSearchParams } = await import('../../src/modules/share-links/url-params');
      const params = new URLSearchParams('w=800&h=600&format=png&quality=0.95&jpegQ=85&webpQ=80&gifColors=128&fname=myqr&gifPal=64&gifQuant=octree&gifDith=ordered&gifDisp=none&gifTrans=ffffff&svgVec=1&svgPrec=module&svgEmbed=0&dpi=300&inclQz=0&bgOver=cccccc&fmtExtra=metadata');
      const config = parseUrlParamsFromSearchParams(params);
      expect(config.width).toBe(800);
      expect(config.height).toBe(600);
      expect(config.format).toBe('png');
      expect(config.quality).toBe(0.95);
      expect(config.jpegQuality).toBe(85);
      expect(config.webpQuality).toBe(80);
      expect(config.gifColors).toBe(128);
      expect(config.filename).toBe('myqr');
      expect(config.gifPaletteSize).toBe(64);
      expect(config.gifQuantizer).toBe('octree');
      expect(config.gifDither).toBe('ordered');
      expect(config.gifDisposal).toBe('none');
      expect(config.gifTransparentColor).toBe('#ffffff');
      expect(config.svgTrueVector).toBe(true);
      expect(config.svgShapePrecision).toBe('module');
      expect(config.svgEmbedRasterOverlay).toBe(false);
      expect(config.dpi).toBe(300);
      expect(config.includeQuietZone).toBe(false);
      expect(config.bgOverride).toBe('#cccccc');
      expect(config.formatExtra).toBe('metadata');
    });

    it('parses safety settings', async () => {
      const { parseUrlParamsFromSearchParams } = await import('../../src/modules/share-links/url-params');
      const params = new URLSearchParams('safeMode=strict&safeMinPx=6&safeMinQz=6&lockF=0&lockT=0&lockA=0&lockFmt=0&lockV=0');
      const config = parseUrlParamsFromSearchParams(params);
      expect(config.safetyMode).toBe('strict');
      expect(config.safetyMinModulePx).toBe(6);
      expect(config.safetyMinQuietZone).toBe(6);
      expect(config.lockFinders).toBe(false);
      expect(config.lockTiming).toBe(false);
      expect(config.lockAlign).toBe(false);
      expect(config.lockFormat).toBe(false);
      expect(config.lockVersion).toBe(false);
    });

    it('parses QA settings', async () => {
      const { parseUrlParamsFromSearchParams } = await import('../../src/modules/share-links/url-params');
      const params = new URLSearchParams('qaContrast=1&qaBlur=2.5&qaNoise=10&qaRot=15&qaHeatmap=1');
      const config = parseUrlParamsFromSearchParams(params);
      expect(config.qaContrastCheck).toBe(true);
      expect(config.qaSimulateBlur).toBe(2.5);
      expect(config.qaSimulateNoise).toBe(10);
      expect(config.qaSimulateRotation).toBe(15);
      expect(config.qaShowHeatmap).toBe(true);
    });

    it('parses auto-tuning settings', async () => {
      const { parseUrlParamsFromSearchParams } = await import('../../src/modules/share-links/url-params');
      const params = new URLSearchParams('autoVer=0&autoEcc=1&autoReduce=1');
      const config = parseUrlParamsFromSearchParams(params);
      expect(config.autoPickVersion).toBe(false);
      expect(config.autoPickEcc).toBe(true);
      expect(config.autoReduceIntensity).toBe(true);
    });

    it('parses watermark settings', async () => {
      const { parseUrlParamsFromSearchParams } = await import('../../src/modules/share-links/url-params');
      const params = new URLSearchParams('wmEn=1&wmKind=image&wmText=DRAFT&wmPos=bottom&wmOpacity=75&wmBlend=multiply&wmImg=https://img.com/wm.png');
      const config = parseUrlParamsFromSearchParams(params);
      expect(config.watermarkEnabled).toBe(true);
      expect(config.watermarkKind).toBe('image');
      expect(config.watermarkText).toBe('DRAFT');
      expect(config.watermarkPosition).toBe('bottom');
      expect(config.watermarkOpacity).toBe(75);
      expect(config.watermarkBlend).toBe('multiply');
      expect(config.watermarkImageUrl).toBe('https://img.com/wm.png');
    });

    it('parses animation (server) settings', async () => {
      const { parseUrlParamsFromSearchParams } = await import('../../src/modules/share-links/url-params');
      const params = new URLSearchParams('animPattern=pulse&animFrames=12&animSpeed=150&animSeed=99');
      const config = parseUrlParamsFromSearchParams(params);
      expect(config.animationPattern).toBe('pulse');
      expect(config.animationFrames).toBe(12);
      expect(config.animationSpeed).toBe(150);
      expect(config.animationSeed).toBe(99);
    });

    it('parses metadata settings', async () => {
      const { parseUrlParamsFromSearchParams } = await import('../../src/modules/share-links/url-params');
      const params = new URLSearchParams('metaTitle=MyQR&metaAuthor=John&metaCopy=2024&metaLic=MIT&metaDesc=A+QR+code&metaTime=1&metaKv=key1:val1');
      const config = parseUrlParamsFromSearchParams(params);
      expect(config.metaTitle).toBe('MyQR');
      expect(config.metaAuthor).toBe('John');
      expect(config.metaCopyright).toBe('2024');
      expect(config.metaLicense).toBe('MIT');
      expect(config.metaDescription).toBe('A QR code');
      expect(config.metaCreationTime).toBe(true);
      expect(config.metaCustomKv).toBe('key1:val1');
    });

    it('parses per-ECC intensity limits', async () => {
      const { parseUrlParamsFromSearchParams } = await import('../../src/modules/share-links/url-params');
      const params = new URLSearchParams('maxIntL=30&maxIntM=50&maxIntQ=70&maxIntH=90');
      const config = parseUrlParamsFromSearchParams(params);
      expect(config.maxOverlayIntensityL).toBe(30);
      expect(config.maxOverlayIntensityM).toBe(50);
      expect(config.maxOverlayIntensityQ).toBe(70);
      expect(config.maxOverlayIntensityH).toBe(90);
    });

    it('parses legacy per-ECC keys', async () => {
      const { parseUrlParamsFromSearchParams } = await import('../../src/modules/share-links/url-params');
      const params = new URLSearchParams('maxOverlayIntensityL=25&maxOverlayIntensityM=45');
      const config = parseUrlParamsFromSearchParams(params);
      expect(config.maxOverlayIntensityL).toBe(25);
      expect(config.maxOverlayIntensityM).toBe(45);
    });

    it('parses palette and module pixel settings', async () => {
      const { parseUrlParamsFromSearchParams } = await import('../../src/modules/share-links/url-params');
      const params = new URLSearchParams('palette=pastel&paletteMode=random&modulePx=8');
      const config = parseUrlParamsFromSearchParams(params);
      expect(config.palette).toBe('pastel');
      expect(config.paletteMode).toBe('random');
      expect(config.modulePx).toBe(8);
    });

    it('parses eye style settings', async () => {
      const { parseUrlParamsFromSearchParams } = await import('../../src/modules/share-links/url-params');
      const params = new URLSearchParams('eyeOuter=rounded&eyeInner=circle&eyeScale=110&frame=simple&frameText=SCAN+ME&dotRot=45&crisp=1&snap=round&modColor=gradient&cGuard=1&minContrast=5.5');
      const config = parseUrlParamsFromSearchParams(params);
      expect(config.eyeOuterStyle).toBe('rounded');
      expect(config.eyeInnerStyle).toBe('circle');
      expect(config.eyeScale).toBe(110);
      expect(config.frameStyle).toBe('simple');
      expect(config.frameText).toBe('SCAN ME');
      expect(config.dotRotation).toBe(45);
      expect(config.crispEdges).toBe(true);
      expect(config.pixelSnap).toBe('round');
      expect(config.perModuleColorMode).toBe('gradient');
      expect(config.contrastGuard).toBe(true);
      expect(config.minContrastRatio).toBe(5.5);
    });

    it('parses overlay protection settings', async () => {
      const { parseUrlParamsFromSearchParams } = await import('../../src/modules/share-links/url-params');
      const params = new URLSearchParams('keepFinders=0&keepTiming=1&keepAlign=1&protectFmt=1&protectVer=1&eccAware=1&eccRisk=75&eccMap=block_heatmap');
      const config = parseUrlParamsFromSearchParams(params);
      expect(config.preserveFinders).toBe(false);
      expect(config.preserveTiming).toBe(true);
      expect(config.preserveAlignment).toBe(true);
      expect(config.protectFormatInfo).toBe(true);
      expect(config.protectVersionInfo).toBe(true);
      expect(config.eccAwareEnabled).toBe(true);
      expect(config.eccAwareRiskBudget).toBe(75);
      expect(config.eccAwareWeightMap).toBe('block_heatmap');
    });

    it('parses GIF settings', async () => {
      const { parseUrlParamsFromSearchParams } = await import('../../src/modules/share-links/url-params');
      const params = new URLSearchParams('gifDelays=0&gifMaxFps=15&gifDispH=ignore');
      const config = parseUrlParamsFromSearchParams(params);
      expect(config.gifUseFrameDelays).toBe(false);
      expect(config.gifMaxFps).toBe(15);
      expect(config.gifDisposalHandling).toBe('ignore');
    });

    it('parses transform settings', async () => {
      const { parseUrlParamsFromSearchParams } = await import('../../src/modules/share-links/url-params');
      const params = new URLSearchParams('fit=contain&rot=90&flipX=1&flipY=1');
      const config = parseUrlParamsFromSearchParams(params);
      expect(config.fit).toBe('contain');
      expect(config.rotate).toBe(90);
      expect(config.flipX).toBe(true);
      expect(config.flipY).toBe(true);
    });

    it('parses quiet zone enforce', async () => {
      const { parseUrlParamsFromSearchParams } = await import('../../src/modules/share-links/url-params');
      const params = new URLSearchParams('qzEnforce=1');
      const config = parseUrlParamsFromSearchParams(params);
      expect(config.quietZoneMinEnforce).toBe(true);
    });

    it('parses language', async () => {
      const { parseUrlParamsFromSearchParams } = await import('../../src/modules/share-links/url-params');
      const params = new URLSearchParams('lang=de-DE');
      const config = parseUrlParamsFromSearchParams(params);
      expect(config.lang).toBe('de-DE');
    });
  });

  describe('buildUrlParams', () => {
    it('builds params from non-default values', async () => {
      const { buildUrlParams } = await import('../../src/modules/share-links/url-params');
      const result = buildUrlParams({
        data: 'https://example.com',
        ec: 'M',
        version: 5,
        fg: '#ff0000',
        bg: '#00ff00',
        style: 'rounded',
      });
      expect(result).toContain('data=');
      expect(result).toContain('ec=M');
      expect(result).toContain('v=5');
      expect(result).toContain('fg=ff0000');
      expect(result).toContain('bg=00ff00');
      expect(result).toContain('style=rounded');
    });

    it('omits default values', async () => {
      const { buildUrlParams } = await import('../../src/modules/share-links/url-params');
      const result = buildUrlParams({
        data: 'test',
        ec: 'H',
        fg: '#000000',
        bg: '#ffffff',
        style: 'square',
      });
      expect(result).toContain('data=test');
      expect(result).not.toContain('ec=');
      expect(result).not.toContain('fg=');
      expect(result).not.toContain('bg=');
      expect(result).not.toContain('style=');
    });

    it('builds animation params', async () => {
      const { buildUrlParams } = await import('../../src/modules/share-links/url-params');
      const result = buildUrlParams({
        data: 'test',
        speed: 200,
        loop: false,
        reverse: true,
        bounce: true,
        seed: 42,
        easing: 'ease-in',
      });
      expect(result).toContain('speed=200');
      expect(result).toContain('loop=0');
      expect(result).toContain('reverse=1');
      expect(result).toContain('bounce=1');
      expect(result).toContain('seed=42');
      expect(result).toContain('easing=ease-in');
    });

    it('builds overlay params', async () => {
      const { buildUrlParams } = await import('../../src/modules/share-links/url-params');
      const result = buildUrlParams({
        data: 'test',
        overlayUrl: 'https://img.com/photo.png',
        mode: 'dithered',
        intensity: 80,
      });
      expect(result).toContain('img=');
      expect(result).toContain('mode=dithered');
      expect(result).toContain('intensity=80');
    });

    it('builds watermark params', async () => {
      const { buildUrlParams } = await import('../../src/modules/share-links/url-params');
      const result = buildUrlParams({
        data: 'test',
        watermarkEnabled: true,
        watermarkText: 'DRAFT',
        watermarkPosition: 'bottom',
        watermarkOpacity: 75,
      });
      expect(result).toContain('wmEn=1');
      expect(result).toContain('wmText=DRAFT');
      expect(result).toContain('wmPos=bottom');
      expect(result).toContain('wmOpacity=75');
    });

    it('builds metadata params', async () => {
      const { buildUrlParams } = await import('../../src/modules/share-links/url-params');
      const result = buildUrlParams({
        data: 'test',
        metaTitle: 'My QR',
        metaAuthor: 'Author',
        metaCreationTime: true,
      });
      expect(result).toContain('metaTitle=');
      expect(result).toContain('metaAuthor=');
      expect(result).toContain('metaTime=1');
    });

    it('builds gradient params', async () => {
      const { buildUrlParams } = await import('../../src/modules/share-links/url-params');
      const result = buildUrlParams({
        data: 'test',
        gradientType: 'linear',
        gradientStops: [{ color: '#ff0000', pos: 0 }, { color: '#0000ff', pos: 1 }],
        gradientAngle: 45,
      });
      expect(result).toContain('grad=linear');
      expect(result).toContain('gradStops=ff0000%2C0%2C0000ff%2C1');
      expect(result).toContain('gradAngle=45');
    });

    it('builds per-ECC intensity params', async () => {
      const { buildUrlParams } = await import('../../src/modules/share-links/url-params');
      const result = buildUrlParams({
        data: 'test',
        maxOverlayIntensityL: 30,
        maxOverlayIntensityM: 50,
        maxOverlayIntensityQ: 70,
        maxOverlayIntensityH: 90,
      });
      expect(result).toContain('maxIntL=30');
      expect(result).toContain('maxIntM=50');
      expect(result).toContain('maxIntQ=70');
      expect(result).toContain('maxIntH=90');
    });

    it('returns empty string for empty config', async () => {
      const { buildUrlParams } = await import('../../src/modules/share-links/url-params');
      const result = buildUrlParams({});
      expect(result).toBe('');
    });
  });

  describe('roundtrip: buildUrlParams + parseUrlParamsFromSearchParams', () => {
    it('roundtrips basic settings', async () => {
      const { buildUrlParams, parseUrlParamsFromSearchParams } = await import('../../src/modules/share-links/url-params');
      const original = {
        data: 'https://example.com',
        ec: 'M',
        version: 5,
        fg: '#ff0000',
        bg: '#00ff00',
        style: 'rounded',
        finder: 'circle',
        moduleGap: 3,
      };
      const paramStr = buildUrlParams(original);
      const parsed = parseUrlParamsFromSearchParams(new URLSearchParams(paramStr));
      expect(parsed.data).toBe(original.data);
      expect(parsed.ec).toBe(original.ec);
      expect(parsed.version).toBe(original.version);
      expect(parsed.fg).toBe(original.fg);
      expect(parsed.bg).toBe(original.bg);
      expect(parsed.style).toBe(original.style);
      expect(parsed.finder).toBe(original.finder);
      expect(parsed.moduleGap).toBe(original.moduleGap);
    });

    it('roundtrips overlay settings', async () => {
      const { buildUrlParams, parseUrlParamsFromSearchParams } = await import('../../src/modules/share-links/url-params');
      const original = {
        data: 'test',
        overlayUrl: 'https://img.com/photo.png',
        intensity: 80,
        cropEnabled: true,
        cropX: 0.3,
        cropY: 0.4,
        cropSize: 0.8,
        flipX: true,
        rotate: 90,
      };
      const paramStr = buildUrlParams(original);
      const parsed = parseUrlParamsFromSearchParams(new URLSearchParams(paramStr));
      expect(parsed.overlayUrl).toBe(original.overlayUrl);
      expect(parsed.intensity).toBe(original.intensity);
      expect(parsed.cropEnabled).toBe(true);
      expect(parsed.flipX).toBe(true);
      expect(parsed.rotate).toBe(90);
    });

    it('roundtrips animation settings', async () => {
      const { buildUrlParams, parseUrlParamsFromSearchParams } = await import('../../src/modules/share-links/url-params');
      const original = {
        data: 'test',
        speed: 200,
        reverse: true,
        bounce: true,
        seed: 42,
      };
      const paramStr = buildUrlParams(original);
      const parsed = parseUrlParamsFromSearchParams(new URLSearchParams(paramStr));
      expect(parsed.speed).toBe(200);
      expect(parsed.reverse).toBe(true);
      expect(parsed.bounce).toBe(true);
      expect(parsed.seed).toBe(42);
    });
  });

  describe('checkShareUrlLength', () => {
    it('returns null for short URLs', async () => {
      const { checkShareUrlLength } = await import('../../src/modules/share-links/url-params');
      expect(checkShareUrlLength('https://anqr.link/?data=test')).toBeNull();
    });

    it('returns warning for very long URLs', async () => {
      const { checkShareUrlLength } = await import('../../src/modules/share-links/url-params');
      const longUrl = 'https://anqr.link/?' + 'x'.repeat(5000);
      const warning = checkShareUrlLength(longUrl);
      expect(warning).not.toBeNull();
      expect(warning).toContain('characters');
    });
  });

  describe('getShareableUrl', () => {
    it('uses provided baseUrl', async () => {
      const { getShareableUrl } = await import('../../src/modules/share-links/url-params');
      const result = getShareableUrl({ data: 'test', ec: 'M' }, 'https://anqr.link');
      expect(result).toContain('https://anqr.link?');
      expect(result).toContain('data=test');
    });

    it('returns baseUrl alone when no params', async () => {
      const { getShareableUrl } = await import('../../src/modules/share-links/url-params');
      const result = getShareableUrl({}, 'https://anqr.link');
      expect(result).toBe('https://anqr.link');
    });
  });
});
