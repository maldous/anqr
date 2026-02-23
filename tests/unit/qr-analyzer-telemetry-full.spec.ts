import { describe, expect, it, vi } from 'vitest';

vi.mock('../../src/lib/logger', () => ({
  createLogger: () => ({
    trace: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

// Polyfill ImageData for Node
class MockImageData {
  data: Uint8ClampedArray;
  width: number;
  height: number;
  constructor(data: Uint8ClampedArray, w: number, h: number) {
    this.data = data;
    this.width = w;
    this.height = h;
  }
}

if (typeof globalThis.ImageData === 'undefined') {
  (globalThis as Record<string, unknown>).ImageData = MockImageData;
}

// ======================== TELEMETRY-CONTRAST ========================

describe('telemetry-contrast', () => {
  describe('calculateContrastStats', () => {
    it('returns high ratio for black vs white', async () => {
      const { calculateContrastStats } =
        await import('../../src/modules/qr-analyzer/telemetry-contrast');
      const report = calculateContrastStats({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 });
      expect(report.ratio).toBeGreaterThan(15);
      expect(report.meetsAA).toBe(true);
      expect(report.meetsAAA).toBe(true);
      expect(report.meetsAALarge).toBe(true);
      expect(report.darkerColor).toBe('#000000');
      expect(report.lighterColor).toBe('#ffffff');
    });

    it('returns ratio ~1 for same color', async () => {
      const { calculateContrastStats } =
        await import('../../src/modules/qr-analyzer/telemetry-contrast');
      const report = calculateContrastStats({ r: 128, g: 128, b: 128 }, { r: 128, g: 128, b: 128 });
      expect(report.ratio).toBeCloseTo(1, 1);
      expect(report.meetsAA).toBe(false);
      expect(report.meetsAAA).toBe(false);
    });

    it('handles colored inputs', async () => {
      const { calculateContrastStats } =
        await import('../../src/modules/qr-analyzer/telemetry-contrast');
      const report = calculateContrastStats({ r: 255, g: 0, b: 0 }, { r: 0, g: 0, b: 255 });
      expect(report.ratio).toBeGreaterThan(1);
      expect(typeof report.lighterColor).toBe('string');
      expect(typeof report.darkerColor).toBe('string');
    });

    it('correctly identifies lighter and darker colors', async () => {
      const { calculateContrastStats } =
        await import('../../src/modules/qr-analyzer/telemetry-contrast');
      const report = calculateContrastStats({ r: 200, g: 200, b: 200 }, { r: 50, g: 50, b: 50 });
      expect(report.lighterColor).toBe('#c8c8c8');
      expect(report.darkerColor).toBe('#323232');
    });
  });

  describe('checkContrastCompliance', () => {
    it('returns AAA for ratio >= 7', async () => {
      const { checkContrastCompliance } =
        await import('../../src/modules/qr-analyzer/telemetry-contrast');
      expect(checkContrastCompliance(7)).toEqual({ level: 'AAA', passes: true });
      expect(checkContrastCompliance(21)).toEqual({ level: 'AAA', passes: true });
    });

    it('returns AA for ratio >= 4.5 and < 7', async () => {
      const { checkContrastCompliance } =
        await import('../../src/modules/qr-analyzer/telemetry-contrast');
      expect(checkContrastCompliance(4.5)).toEqual({ level: 'AA', passes: true });
      expect(checkContrastCompliance(6.9)).toEqual({ level: 'AA', passes: true });
    });

    it('returns AA-Large for ratio >= 3 and < 4.5', async () => {
      const { checkContrastCompliance } =
        await import('../../src/modules/qr-analyzer/telemetry-contrast');
      expect(checkContrastCompliance(3)).toEqual({ level: 'AA-Large', passes: true });
      expect(checkContrastCompliance(4.4)).toEqual({ level: 'AA-Large', passes: true });
    });

    it('returns Fail for ratio < 3', async () => {
      const { checkContrastCompliance } =
        await import('../../src/modules/qr-analyzer/telemetry-contrast');
      expect(checkContrastCompliance(2.9)).toEqual({ level: 'Fail', passes: false });
      expect(checkContrastCompliance(1)).toEqual({ level: 'Fail', passes: false });
    });
  });
});

// ======================== TELEMETRY-LOGGING ========================

describe('telemetry-logging', () => {
  describe('createScanLogger', () => {
    it('creates a logger with all methods', async () => {
      const { createScanLogger } = await import('../../src/modules/qr-analyzer/telemetry-logging');
      const logger = createScanLogger();
      expect(typeof logger.log).toBe('function');
      expect(typeof logger.getStats).toBe('function');
      expect(typeof logger.getLogs).toBe('function');
      expect(typeof logger.clear).toBe('function');
    });

    it('logs entries and retrieves them', async () => {
      const { createScanLogger } = await import('../../src/modules/qr-analyzer/telemetry-logging');
      const logger = createScanLogger();
      logger.log('test', 'hello', { key: 'value' });
      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].category).toBe('test');
      expect(logs[0].message).toBe('hello');
      expect(logs[0].data).toEqual({ key: 'value' });
      expect(typeof logs[0].timestamp).toBe('number');
    });

    it('tracks scan statistics for successful scans', async () => {
      const { createScanLogger } = await import('../../src/modules/qr-analyzer/telemetry-logging');
      const logger = createScanLogger();
      logger.log('scan', 'scan success', { success: true, duration: 50 });
      logger.log('scan', 'scan success 2', { success: true, duration: 100 });
      const stats = logger.getStats();
      expect(stats.totalScans).toBe(2);
      expect(stats.successfulScans).toBe(2);
      expect(stats.failedScans).toBe(0);
      expect(stats.averageScanTime).toBe(75);
    });

    it('tracks failed scans', async () => {
      const { createScanLogger } = await import('../../src/modules/qr-analyzer/telemetry-logging');
      const logger = createScanLogger();
      logger.log('scan', 'scan failed', { success: false, duration: 30 });
      const stats = logger.getStats();
      expect(stats.totalScans).toBe(1);
      expect(stats.successfulScans).toBe(0);
      expect(stats.failedScans).toBe(1);
      expect(stats.averageScanTime).toBe(30);
    });

    it('handles non-scan categories without incrementing scan counts', async () => {
      const { createScanLogger } = await import('../../src/modules/qr-analyzer/telemetry-logging');
      const logger = createScanLogger();
      logger.log('info', 'just a message');
      const stats = logger.getStats();
      expect(stats.totalScans).toBe(0);
      expect(stats.logs).toHaveLength(1);
    });

    it('clear resets all state', async () => {
      const { createScanLogger } = await import('../../src/modules/qr-analyzer/telemetry-logging');
      const logger = createScanLogger();
      logger.log('scan', 'test', { success: true, duration: 10 });
      logger.log('info', 'other');
      logger.clear();
      expect(logger.getLogs()).toHaveLength(0);
      const stats = logger.getStats();
      expect(stats.totalScans).toBe(0);
      expect(stats.successfulScans).toBe(0);
      expect(stats.failedScans).toBe(0);
      expect(stats.averageScanTime).toBe(0);
    });

    it('getStats returns copy of logs', async () => {
      const { createScanLogger } = await import('../../src/modules/qr-analyzer/telemetry-logging');
      const logger = createScanLogger();
      logger.log('scan', 'test', { success: true });
      const stats = logger.getStats();
      expect(stats.logs).toHaveLength(1);
      // Verify it's a copy
      stats.logs.length = 0;
      expect(logger.getLogs()).toHaveLength(1);
    });
  });
});

// ======================== TELEMETRY-STATS ========================

describe('telemetry-stats', () => {
  describe('calculateAnalysisStats', () => {
    it('returns zeros for empty array', async () => {
      const { calculateAnalysisStats } =
        await import('../../src/modules/qr-analyzer/telemetry-stats');
      const stats = calculateAnalysisStats([]);
      expect(stats.totalAnalyzed).toBe(0);
      expect(stats.successRate).toBe(0);
      expect(stats.averageConfidence).toBe(0);
    });

    it('calculates stats for all successful results', async () => {
      const { calculateAnalysisStats } =
        await import('../../src/modules/qr-analyzer/telemetry-stats');
      const stats = calculateAnalysisStats([
        {
          success: true,
          confidence: 'high',
          version: 5,
          eccLevel: 'H',
          contentType: { type: 'url' },
        },
        {
          success: true,
          confidence: 'medium',
          version: 5,
          eccLevel: 'M',
          contentType: { type: 'text' },
        },
      ]);
      expect(stats.totalAnalyzed).toBe(2);
      expect(stats.successRate).toBe(1);
      expect(stats.averageConfidence).toBeGreaterThan(0);
      expect(stats.versionDistribution[5]).toBe(2);
      expect(stats.eccDistribution['H']).toBe(1);
      expect(stats.eccDistribution['M']).toBe(1);
      expect(stats.contentTypeDistribution['url']).toBe(1);
      expect(stats.contentTypeDistribution['text']).toBe(1);
    });

    it('calculates stats for all failed results', async () => {
      const { calculateAnalysisStats } =
        await import('../../src/modules/qr-analyzer/telemetry-stats');
      const stats = calculateAnalysisStats([{ success: false }, { success: false }]);
      expect(stats.totalAnalyzed).toBe(2);
      expect(stats.successRate).toBe(0);
      expect(stats.averageConfidence).toBe(0);
    });

    it('calculates stats for mixed results', async () => {
      const { calculateAnalysisStats } =
        await import('../../src/modules/qr-analyzer/telemetry-stats');
      const stats = calculateAnalysisStats([
        { success: true, confidence: 'high', version: 3, eccLevel: 'L' },
        { success: false },
        { success: true, confidence: 'low', version: 7, eccLevel: 'L' },
      ]);
      expect(stats.totalAnalyzed).toBe(3);
      expect(stats.successRate).toBeCloseTo(2 / 3, 2);
      expect(stats.versionDistribution[3]).toBe(1);
      expect(stats.versionDistribution[7]).toBe(1);
      expect(stats.eccDistribution['L']).toBe(2);
    });

    it('handles results with null version/ecc', async () => {
      const { calculateAnalysisStats } =
        await import('../../src/modules/qr-analyzer/telemetry-stats');
      const stats = calculateAnalysisStats([{ success: true, version: null, eccLevel: null }]);
      expect(stats.totalAnalyzed).toBe(1);
      expect(Object.keys(stats.versionDistribution)).toHaveLength(0);
      expect(Object.keys(stats.eccDistribution)).toHaveLength(0);
    });

    it('uses default confidence for results without confidence', async () => {
      const { calculateAnalysisStats } =
        await import('../../src/modules/qr-analyzer/telemetry-stats');
      const stats = calculateAnalysisStats([{ success: true }]);
      expect(stats.averageConfidence).toBeCloseTo(0.66, 1);
    });
  });

  describe('aggregateStats', () => {
    it('returns zeros for empty array', async () => {
      const { aggregateStats } = await import('../../src/modules/qr-analyzer/telemetry-stats');
      const result = aggregateStats([]);
      expect(result.totalAnalyzed).toBe(0);
      expect(result.successRate).toBe(0);
      expect(result.averageConfidence).toBe(0);
    });

    it('aggregates multiple stats with weighted averages', async () => {
      const { aggregateStats } = await import('../../src/modules/qr-analyzer/telemetry-stats');
      const result = aggregateStats([
        {
          totalAnalyzed: 10,
          successRate: 1.0,
          averageConfidence: 0.9,
          versionDistribution: { 5: 10 },
          eccDistribution: { H: 10 },
          contentTypeDistribution: { url: 10 },
        },
        {
          totalAnalyzed: 10,
          successRate: 0.5,
          averageConfidence: 0.5,
          versionDistribution: { 5: 5, 3: 5 },
          eccDistribution: { L: 10 },
          contentTypeDistribution: { text: 10 },
        },
      ]);
      expect(result.totalAnalyzed).toBe(20);
      expect(result.successRate).toBeCloseTo(0.75, 2);
      expect(result.averageConfidence).toBeCloseTo(0.7, 2);
      expect(result.versionDistribution[5]).toBe(15);
      expect(result.versionDistribution[3]).toBe(5);
      expect(result.eccDistribution['H']).toBe(10);
      expect(result.eccDistribution['L']).toBe(10);
      expect(result.contentTypeDistribution['url']).toBe(10);
      expect(result.contentTypeDistribution['text']).toBe(10);
    });

    it('handles single stat', async () => {
      const { aggregateStats } = await import('../../src/modules/qr-analyzer/telemetry-stats');
      const input = {
        totalAnalyzed: 5,
        successRate: 0.8,
        averageConfidence: 0.7,
        versionDistribution: { 2: 5 },
        eccDistribution: { M: 5 },
        contentTypeDistribution: {},
      };
      const result = aggregateStats([input]);
      expect(result.totalAnalyzed).toBe(5);
      expect(result.successRate).toBeCloseTo(0.8, 2);
      expect(result.averageConfidence).toBeCloseTo(0.7, 2);
    });
  });
});

// ======================== ANALYZER-CONTENT ========================

describe('analyzer-content', () => {
  function makeImageData(
    width: number,
    height: number,
    r: number,
    g: number,
    b: number,
    a = 255
  ): ImageData {
    const data = new Uint8ClampedArray(width * height * 4);
    for (let i = 0; i < data.length; i += 4) {
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = a;
    }
    return new MockImageData(data, width, height) as unknown as ImageData;
  }

  describe('averageColor', () => {
    it('returns average for uniform image', async () => {
      const { averageColor } = await import('../../src/modules/qr-analyzer/analyzer-content');
      const img = makeImageData(2, 2, 100, 150, 200);
      const avg = averageColor(img);
      expect(avg.r).toBe(100);
      expect(avg.g).toBe(150);
      expect(avg.b).toBe(200);
    });

    it('returns average for mixed pixels', async () => {
      const { averageColor } = await import('../../src/modules/qr-analyzer/analyzer-content');
      const data = new Uint8ClampedArray([0, 0, 0, 255, 200, 200, 200, 255]);
      const img = new MockImageData(data, 2, 1) as unknown as ImageData;
      const avg = averageColor(img);
      expect(avg.r).toBe(100);
      expect(avg.g).toBe(100);
      expect(avg.b).toBe(100);
    });
  });

  describe('calculateContrastRatio', () => {
    it('returns high ratio for black vs white', async () => {
      const { calculateContrastRatio } =
        await import('../../src/modules/qr-analyzer/analyzer-content');
      const ratio = calculateContrastRatio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 });
      expect(ratio).toBeGreaterThan(15);
    });

    it('returns ~1 for identical colors', async () => {
      const { calculateContrastRatio } =
        await import('../../src/modules/qr-analyzer/analyzer-content');
      const ratio = calculateContrastRatio({ r: 128, g: 128, b: 128 }, { r: 128, g: 128, b: 128 });
      expect(ratio).toBeCloseTo(1, 1);
    });
  });

  describe('calculateImageProperties', () => {
    it('returns correct properties', async () => {
      const { calculateImageProperties } =
        await import('../../src/modules/qr-analyzer/analyzer-content');
      const img = makeImageData(200, 100, 0, 0, 0);
      const props = calculateImageProperties(img);
      expect(props.width).toBe(200);
      expect(props.height).toBe(100);
      expect(props.aspectRatio).toBe(2);
      expect(props.estimatedQrSizePx).toBe(100);
    });

    it('handles square images', async () => {
      const { calculateImageProperties } =
        await import('../../src/modules/qr-analyzer/analyzer-content');
      const img = makeImageData(300, 300, 0, 0, 0);
      const props = calculateImageProperties(img);
      expect(props.aspectRatio).toBe(1);
      expect(props.estimatedQrSizePx).toBe(300);
    });
  });

  describe('detectContentType', () => {
    it('detects URL', async () => {
      const { detectContentType } = await import('../../src/modules/qr-analyzer/analyzer-content');
      expect(detectContentType('https://example.com')).toBe('url');
      expect(detectContentType('http://example.com')).toBe('url');
    });

    it('detects WiFi', async () => {
      const { detectContentType } = await import('../../src/modules/qr-analyzer/analyzer-content');
      expect(detectContentType('WIFI:S:MyNetwork;T:WPA;P:password;;')).toBe('wifi');
    });

    it('detects vCard', async () => {
      const { detectContentType } = await import('../../src/modules/qr-analyzer/analyzer-content');
      expect(detectContentType('BEGIN:VCARD\nVERSION:3.0\nN:Doe;John')).toBe('vcard');
    });

    it('detects MeCard', async () => {
      const { detectContentType } = await import('../../src/modules/qr-analyzer/analyzer-content');
      expect(detectContentType('MECARD:N:Doe,John;TEL:+123;')).toBe('mecard');
    });

    it('detects email', async () => {
      const { detectContentType } = await import('../../src/modules/qr-analyzer/analyzer-content');
      expect(detectContentType('mailto:test@example.com')).toBe('email');
    });

    it('detects telephone', async () => {
      const { detectContentType } = await import('../../src/modules/qr-analyzer/analyzer-content');
      expect(detectContentType('tel:+1234567890')).toBe('tel');
    });

    it('detects SMS', async () => {
      const { detectContentType } = await import('../../src/modules/qr-analyzer/analyzer-content');
      expect(detectContentType('sms:+1234567890')).toBe('sms');
      expect(detectContentType('SMSTO:+1234567890')).toBe('sms');
    });

    it('detects geo location', async () => {
      const { detectContentType } = await import('../../src/modules/qr-analyzer/analyzer-content');
      expect(detectContentType('geo:37.7749,-122.4194')).toBe('geo');
    });

    it('detects Bitcoin', async () => {
      const { detectContentType } = await import('../../src/modules/qr-analyzer/analyzer-content');
      expect(detectContentType('bitcoin:1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa')).toBe(
        'crypto_bitcoin'
      );
    });

    it('detects Ethereum', async () => {
      const { detectContentType } = await import('../../src/modules/qr-analyzer/analyzer-content');
      expect(detectContentType('ethereum:0x1234567890abcdef')).toBe('crypto_ethereum');
    });

    it('detects other crypto', async () => {
      const { detectContentType } = await import('../../src/modules/qr-analyzer/analyzer-content');
      expect(detectContentType('litecoin:LcAddress123')).toBe('crypto_other');
      expect(detectContentType('dogecoin:DAddress123')).toBe('crypto_other');
    });

    it('detects EPC/SEPA', async () => {
      const { detectContentType } = await import('../../src/modules/qr-analyzer/analyzer-content');
      expect(detectContentType('BCD\n002\n1\nSCT')).toBe('epc_sepa');
    });

    it('detects UPI', async () => {
      const { detectContentType } = await import('../../src/modules/qr-analyzer/analyzer-content');
      expect(detectContentType('upi://pay?pa=user@bank')).toBe('upi');
    });

    it('detects Swiss QR bill', async () => {
      const { detectContentType } = await import('../../src/modules/qr-analyzer/analyzer-content');
      expect(detectContentType('SPC\n0200\n1')).toBe('swiss_qr_bill');
    });

    it('detects calendar events', async () => {
      const { detectContentType } = await import('../../src/modules/qr-analyzer/analyzer-content');
      expect(detectContentType('BEGIN:VCALENDAR\nBEGIN:VEVENT')).toBe('calendar_event');
      expect(detectContentType('BEGIN:VEVENT\nSUMMARY:Test')).toBe('calendar_event');
    });

    it('detects OTP auth', async () => {
      const { detectContentType } = await import('../../src/modules/qr-analyzer/analyzer-content');
      expect(detectContentType('otpauth://totp/Example:user?secret=ABC')).toBe('otp_auth');
    });

    it('detects EMV QR', async () => {
      const { detectContentType } = await import('../../src/modules/qr-analyzer/analyzer-content');
      expect(detectContentType('000201abcdef6304ABCD')).toBe('emv_qr');
    });

    it('falls back to plain_text', async () => {
      const { detectContentType } = await import('../../src/modules/qr-analyzer/analyzer-content');
      expect(detectContentType('Hello, World!')).toBe('plain_text');
      expect(detectContentType('12345')).toBe('plain_text');
    });
  });

  describe('extractDominantColors', () => {
    it('extracts dominant color from uniform image', async () => {
      const { extractDominantColors } =
        await import('../../src/modules/qr-analyzer/analyzer-content');
      const img = makeImageData(4, 4, 255, 0, 0);
      const colors = extractDominantColors(img, 3);
      expect(colors.length).toBeGreaterThan(0);
      expect(colors[0].percentage).toBeGreaterThan(50);
    });

    it('returns at most maxColors', async () => {
      const { extractDominantColors } =
        await import('../../src/modules/qr-analyzer/analyzer-content');
      const img = makeImageData(4, 4, 128, 128, 128);
      const colors = extractDominantColors(img, 2);
      expect(colors.length).toBeLessThanOrEqual(2);
    });
  });

  describe('parseUrlDetails', () => {
    it('parses a valid URL', async () => {
      const { parseUrlDetails } = await import('../../src/modules/qr-analyzer/analyzer-content');
      const result = parseUrlDetails('https://example.com/path?foo=bar');
      expect(result).not.toBeNull();
      expect(result!.protocol).toBe('https');
      expect(result!.host).toBe('example.com');
      expect(result!.pathname).toBe('/path');
      expect(result!.hasUtmParams).toBe(false);
    });

    it('detects UTM parameters', async () => {
      const { parseUrlDetails } = await import('../../src/modules/qr-analyzer/analyzer-content');
      const result = parseUrlDetails(
        'https://example.com?utm_source=google&utm_medium=cpc&utm_campaign=test'
      );
      expect(result!.hasUtmParams).toBe(true);
      expect(result!.utmSource).toBe('google');
      expect(result!.utmMedium).toBe('cpc');
      expect(result!.utmCampaign).toBe('test');
    });

    it('returns null for invalid URL', async () => {
      const { parseUrlDetails } = await import('../../src/modules/qr-analyzer/analyzer-content');
      expect(parseUrlDetails('not a url')).toBeNull();
    });

    it('handles URL without UTM', async () => {
      const { parseUrlDetails } = await import('../../src/modules/qr-analyzer/analyzer-content');
      const result = parseUrlDetails('https://example.com');
      expect(result!.hasUtmParams).toBe(false);
      expect(result!.utmSource).toBeUndefined();
    });
  });
});
