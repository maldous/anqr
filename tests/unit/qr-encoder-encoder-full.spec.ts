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

describe('qr-encoder/encoder.ts', () => {
  async function getQrcode() {
    const { qrcode } = await import('../../src/modules/qr-encoder/encoder');
    return qrcode;
  }

  // ==========================================
  // Basic creation and make()
  // ==========================================

  describe('basic creation', () => {
    it('creates a v1 L QR code', async () => {
      const qrcode = await getQrcode();
      const qr = qrcode(1, 'L');
      qr.addData('1');
      qr.make();
      expect(qr.getModuleCount()).toBe(21);
    });

    it('creates a v1 M QR code', async () => {
      const qrcode = await getQrcode();
      const qr = qrcode(1, 'M');
      qr.addData('1');
      qr.make();
      expect(qr.getModuleCount()).toBe(21);
    });

    it('creates a v1 Q QR code', async () => {
      const qrcode = await getQrcode();
      const qr = qrcode(1, 'Q');
      qr.addData('1');
      qr.make();
      expect(qr.getModuleCount()).toBe(21);
    });

    it('creates a v1 H QR code', async () => {
      const qrcode = await getQrcode();
      const qr = qrcode(1, 'H');
      qr.addData('1');
      qr.make();
      expect(qr.getModuleCount()).toBe(21);
    });

    it('creates v5 with correct module count (37)', async () => {
      const qrcode = await getQrcode();
      const qr = qrcode(5, 'L');
      qr.addData('Hello World');
      qr.make();
      expect(qr.getModuleCount()).toBe(37);
    });

    it('creates v10 with correct module count (57)', async () => {
      const qrcode = await getQrcode();
      const qr = qrcode(10, 'L');
      qr.addData('Test data for version 10 QR code generation');
      qr.make();
      expect(qr.getModuleCount()).toBe(57);
    });
  });

  // ==========================================
  // Auto version (typeNumber = 0)
  // ==========================================

  describe('auto version', () => {
    it('auto-selects version for short data', async () => {
      const qrcode = await getQrcode();
      const qr = qrcode(0, 'M');
      qr.addData('Hello');
      qr.make();
      expect(qr.getModuleCount()).toBeGreaterThanOrEqual(21);
    });

    it('auto-selects version for longer data', async () => {
      const qrcode = await getQrcode();
      const qr = qrcode(0, 'L');
      qr.addData('This is a longer string that needs a higher version QR code to encode properly');
      qr.make();
      expect(qr.getModuleCount()).toBeGreaterThan(21);
    });

    it('auto-selects smallest possible version', async () => {
      const qrcode = await getQrcode();
      const qr = qrcode(0, 'L');
      qr.addData('1');
      qr.make();
      // Version 1 should suffice for a single digit
      expect(qr.getModuleCount()).toBe(21);
    });
  });

  // ==========================================
  // addData with different modes
  // ==========================================

  describe('addData with modes', () => {
    it('adds Numeric data', async () => {
      const qrcode = await getQrcode();
      const qr = qrcode(1, 'L');
      qr.addData('12345', 'Numeric');
      qr.make();
      expect(qr.getModuleCount()).toBe(21);
    });

    it('adds Alphanumeric data', async () => {
      const qrcode = await getQrcode();
      const qr = qrcode(1, 'L');
      qr.addData('HELLO', 'Alphanumeric');
      qr.make();
      expect(qr.getModuleCount()).toBe(21);
    });

    it('adds Byte data (default)', async () => {
      const qrcode = await getQrcode();
      const qr = qrcode(1, 'M');
      qr.addData('test');
      qr.make();
      expect(qr.getModuleCount()).toBe(21);
    });

    it('adds Byte data explicitly', async () => {
      const qrcode = await getQrcode();
      const qr = qrcode(1, 'M');
      qr.addData('test', 'Byte');
      qr.make();
      expect(qr.getModuleCount()).toBe(21);
    });

    it('throws for invalid mode', async () => {
      const qrcode = await getQrcode();
      const qr = qrcode(1, 'L');
      expect(() => qr.addData('test', 'InvalidMode')).toThrow('mode:InvalidMode');
    });

    it('can add multiple data segments', async () => {
      const qrcode = await getQrcode();
      const qr = qrcode(0, 'L');
      qr.addData('12345', 'Numeric');
      qr.addData('HELLO', 'Alphanumeric');
      qr.make();
      expect(qr.getModuleCount()).toBeGreaterThanOrEqual(21);
    });
  });

  // ==========================================
  // make() with mask pattern
  // ==========================================

  describe('make with mask pattern', () => {
    it('uses specified mask pattern 0', async () => {
      const qrcode = await getQrcode();
      const qr = qrcode(1, 'L');
      qr.addData('test');
      qr.make(0);
      expect(qr.getModuleCount()).toBe(21);
    });

    it('uses specified mask pattern 7', async () => {
      const qrcode = await getQrcode();
      const qr = qrcode(1, 'L');
      qr.addData('test');
      qr.make(7);
      expect(qr.getModuleCount()).toBe(21);
    });

    it('auto-selects mask when no pattern given', async () => {
      const qrcode = await getQrcode();
      const qr = qrcode(1, 'L');
      qr.addData('test');
      qr.make();
      expect(qr.getModuleCount()).toBe(21);
    });

    it('different mask patterns produce different matrices', async () => {
      const qrcode = await getQrcode();
      const qr0 = qrcode(1, 'L');
      qr0.addData('test');
      qr0.make(0);

      const qr1 = qrcode(1, 'L');
      qr1.addData('test');
      qr1.make(1);

      // At least some modules should differ (data modules are masked differently)
      let differences = 0;
      for (let r = 0; r < 21; r++) {
        for (let c = 0; c < 21; c++) {
          if (qr0.isDark(r, c) !== qr1.isDark(r, c)) differences++;
        }
      }
      expect(differences).toBeGreaterThan(0);
    });
  });

  // ==========================================
  // isDark
  // ==========================================

  describe('isDark', () => {
    it('returns boolean for valid coordinates', async () => {
      const qrcode = await getQrcode();
      const qr = qrcode(1, 'L');
      qr.addData('test');
      qr.make();
      expect(typeof qr.isDark(0, 0)).toBe('boolean');
    });

    it('finder pattern top-left corner is dark', async () => {
      const qrcode = await getQrcode();
      const qr = qrcode(1, 'L');
      qr.addData('test');
      qr.make();
      // Top-left finder pattern: modules (0,0) through (6,6) outer ring is dark
      expect(qr.isDark(0, 0)).toBe(true);
      expect(qr.isDark(0, 6)).toBe(true);
      expect(qr.isDark(6, 0)).toBe(true);
      expect(qr.isDark(6, 6)).toBe(true);
    });

    it('throws for negative row', async () => {
      const qrcode = await getQrcode();
      const qr = qrcode(1, 'L');
      qr.addData('test');
      qr.make();
      expect(() => qr.isDark(-1, 0)).toThrow();
    });

    it('throws for row >= moduleCount', async () => {
      const qrcode = await getQrcode();
      const qr = qrcode(1, 'L');
      qr.addData('test');
      qr.make();
      expect(() => qr.isDark(21, 0)).toThrow();
    });

    it('throws for negative col', async () => {
      const qrcode = await getQrcode();
      const qr = qrcode(1, 'L');
      qr.addData('test');
      qr.make();
      expect(() => qr.isDark(0, -1)).toThrow();
    });

    it('throws for col >= moduleCount', async () => {
      const qrcode = await getQrcode();
      const qr = qrcode(1, 'L');
      qr.addData('test');
      qr.make();
      expect(() => qr.isDark(0, 21)).toThrow();
    });
  });

  // ==========================================
  // createTableTag
  // ==========================================

  describe('createTableTag', () => {
    it('returns HTML table string', async () => {
      const qrcode = await getQrcode();
      const qr = qrcode(1, 'L');
      qr.addData('test');
      qr.make();
      const html = qr.createTableTag();
      expect(html).toContain('<table');
      expect(html).toContain('</table>');
      expect(html).toContain('<tbody>');
      expect(html).toContain('<tr>');
      expect(html).toContain('<td');
    });

    it('uses custom cellSize', async () => {
      const qrcode = await getQrcode();
      const qr = qrcode(1, 'L');
      qr.addData('test');
      qr.make();
      const html = qr.createTableTag(4);
      expect(html).toContain('width: 4px');
      expect(html).toContain('height: 4px');
    });

    it('uses custom margin', async () => {
      const qrcode = await getQrcode();
      const qr = qrcode(1, 'L');
      qr.addData('test');
      qr.make();
      const html = qr.createTableTag(2, 10);
      expect(html).toContain('margin: 10px');
    });

    it('contains black and white background colors', async () => {
      const qrcode = await getQrcode();
      const qr = qrcode(1, 'L');
      qr.addData('test');
      qr.make();
      const html = qr.createTableTag();
      expect(html).toContain('#000000');
      expect(html).toContain('#ffffff');
    });
  });

  // ==========================================
  // createSvgTag
  // ==========================================

  describe('createSvgTag', () => {
    it('returns SVG string', async () => {
      const qrcode = await getQrcode();
      const qr = qrcode(1, 'L');
      qr.addData('test');
      qr.make();
      const svg = qr.createSvgTag();
      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
      expect(svg).toContain('<path');
      expect(svg).toContain('viewBox');
    });

    it('uses custom cellSize and margin', async () => {
      const qrcode = await getQrcode();
      const qr = qrcode(1, 'L');
      qr.addData('test');
      qr.make();
      const svg = qr.createSvgTag(4, 8);
      expect(svg).toContain('<svg');
      // Size should be moduleCount * 4 + 8 * 2 = 21*4 + 16 = 100
      expect(svg).toContain('width="100px"');
    });

    it('supports options object', async () => {
      const qrcode = await getQrcode();
      const qr = qrcode(1, 'L');
      qr.addData('test');
      qr.make();
      const svg = qr.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
      expect(svg).toContain('<svg');
      expect(svg).not.toMatch(/<svg[^>]+width="\d/);
      expect(svg).toContain('viewBox');
    });

    it('includes title when provided as string', async () => {
      const qrcode = await getQrcode();
      const qr = qrcode(1, 'L');
      qr.addData('test');
      qr.make();
      const svg = qr.createSvgTag(2, 4, undefined, 'My QR Code');
      expect(svg).toContain('<title');
      expect(svg).toContain('My QR Code');
    });

    it('includes alt/description when provided as string', async () => {
      const qrcode = await getQrcode();
      const qr = qrcode(1, 'L');
      qr.addData('test');
      qr.make();
      const svg = qr.createSvgTag(2, 4, 'A QR code for testing');
      expect(svg).toContain('<description');
      expect(svg).toContain('A QR code for testing');
      expect(svg).toContain('role="img"');
    });

    it('includes both alt and title', async () => {
      const qrcode = await getQrcode();
      const qr = qrcode(1, 'L');
      qr.addData('test');
      qr.make();
      const svg = qr.createSvgTag(2, 4, 'QR alt text', 'QR title');
      expect(svg).toContain('<title');
      expect(svg).toContain('QR title');
      expect(svg).toContain('<description');
      expect(svg).toContain('QR alt text');
    });

    it('escapes special XML characters', async () => {
      const qrcode = await getQrcode();
      const qr = qrcode(1, 'L');
      qr.addData('test');
      qr.make();
      const svg = qr.createSvgTag(2, 4, 'Test & "Title"', 'Test <Title>');
      expect(svg).toContain('&amp;');
      expect(svg).toContain('&quot;');
      expect(svg).toContain('&lt;');
      expect(svg).toContain('&gt;');
    });

    it('supports alt as object with text and id', async () => {
      const qrcode = await getQrcode();
      const qr = qrcode(1, 'L');
      qr.addData('test');
      qr.make();
      const svg = qr.createSvgTag(2, 4, { text: 'Custom alt', id: 'custom-id' });
      expect(svg).toContain('custom-id');
      expect(svg).toContain('Custom alt');
    });

    it('supports title as object with text and id', async () => {
      const qrcode = await getQrcode();
      const qr = qrcode(1, 'L');
      qr.addData('test');
      qr.make();
      const svg = qr.createSvgTag(2, 4, undefined, { text: 'Custom title', id: 'title-id' });
      expect(svg).toContain('title-id');
      expect(svg).toContain('Custom title');
    });

    it('includes width/height when not scalable', async () => {
      const qrcode = await getQrcode();
      const qr = qrcode(1, 'L');
      qr.addData('test');
      qr.make();
      const svg = qr.createSvgTag({ cellSize: 2, scalable: false });
      expect(svg).toContain('width=');
      expect(svg).toContain('height=');
    });
  });

  // ==========================================
  // createDataURL
  // ==========================================

  describe('createDataURL', () => {
    it('returns data URI string', async () => {
      const qrcode = await getQrcode();
      const qr = qrcode(1, 'L');
      qr.addData('test');
      qr.make();
      const dataUrl = qr.createDataURL();
      expect(dataUrl).toMatch(/^data:image\/gif;base64,/);
    });

    it('respects custom cellSize', async () => {
      const qrcode = await getQrcode();
      const qr = qrcode(1, 'L');
      qr.addData('test');
      qr.make();
      const dataUrl2 = qr.createDataURL(2);
      const dataUrl4 = qr.createDataURL(4);
      // Larger cellSize = more pixels = longer base64 string
      expect(dataUrl4.length).toBeGreaterThan(dataUrl2.length);
    });

    it('respects custom margin', async () => {
      const qrcode = await getQrcode();
      const qr = qrcode(1, 'L');
      qr.addData('test');
      qr.make();
      const noMargin = qr.createDataURL(2, 0);
      const withMargin = qr.createDataURL(2, 10);
      expect(withMargin.length).toBeGreaterThan(noMargin.length);
    });
  });

  // ==========================================
  // createImgTag
  // ==========================================

  describe('createImgTag', () => {
    it('returns img HTML string', async () => {
      const qrcode = await getQrcode();
      const qr = qrcode(1, 'L');
      qr.addData('test');
      qr.make();
      const img = qr.createImgTag();
      expect(img).toContain('<img');
      expect(img).toContain('src="data:image/gif;base64,');
      expect(img).toContain('width="');
      expect(img).toContain('height="');
    });

    it('includes alt text when provided', async () => {
      const qrcode = await getQrcode();
      const qr = qrcode(1, 'L');
      qr.addData('test');
      qr.make();
      const img = qr.createImgTag(2, undefined, 'QR Code');
      expect(img).toContain('alt="QR Code"');
    });

    it('escapes special characters in alt text', async () => {
      const qrcode = await getQrcode();
      const qr = qrcode(1, 'L');
      qr.addData('test');
      qr.make();
      const img = qr.createImgTag(2, undefined, 'Test & <"Title">');
      expect(img).toContain('&amp;');
      expect(img).toContain('&lt;');
      expect(img).toContain('&gt;');
      expect(img).toContain('&quot;');
    });

    it('omits alt attribute when not provided', async () => {
      const qrcode = await getQrcode();
      const qr = qrcode(1, 'L');
      qr.addData('test');
      qr.make();
      const img = qr.createImgTag();
      expect(img).not.toContain('alt=');
    });
  });

  // ==========================================
  // createASCII
  // ==========================================

  describe('createASCII', () => {
    it('returns ASCII art string with cellSize 1 (half ASCII)', async () => {
      const qrcode = await getQrcode();
      const qr = qrcode(1, 'L');
      qr.addData('test');
      qr.make();
      const ascii = qr.createASCII(1);
      expect(typeof ascii).toBe('string');
      expect(ascii.length).toBeGreaterThan(0);
      // Half ASCII uses block characters
      expect(ascii).toMatch(/[█▀▄ ]/);
    });

    it('returns ASCII art string with cellSize 2 (full ASCII)', async () => {
      const qrcode = await getQrcode();
      const qr = qrcode(1, 'L');
      qr.addData('test');
      qr.make();
      const ascii = qr.createASCII(2);
      expect(typeof ascii).toBe('string');
      expect(ascii.length).toBeGreaterThan(0);
    });

    it('returns ASCII art with default cellSize', async () => {
      const qrcode = await getQrcode();
      const qr = qrcode(1, 'L');
      qr.addData('test');
      qr.make();
      const ascii = qr.createASCII();
      expect(typeof ascii).toBe('string');
      expect(ascii.length).toBeGreaterThan(0);
    });

    it('respects custom margin', async () => {
      const qrcode = await getQrcode();
      const qr = qrcode(1, 'L');
      qr.addData('test');
      qr.make();
      const noMargin = qr.createASCII(1, 0);
      const withMargin = qr.createASCII(1, 4);
      expect(withMargin.length).toBeGreaterThan(noMargin.length);
    });

    it('full ASCII (cellSize 2) is longer than half ASCII (cellSize 1)', async () => {
      const qrcode = await getQrcode();
      const qr = qrcode(1, 'L');
      qr.addData('test');
      qr.make();
      const half = qr.createASCII(1, 0);
      const full = qr.createASCII(2, 0);
      expect(full.length).toBeGreaterThan(half.length);
    });
  });

  // ==========================================
  // renderTo2dContext
  // ==========================================

  describe('renderTo2dContext', () => {
    it('calls fillRect for each module', async () => {
      const qrcode = await getQrcode();
      const qr = qrcode(1, 'L');
      qr.addData('test');
      qr.make();

      const mockCtx = {
        fillStyle: '',
        fillRect: vi.fn(),
      } as unknown as CanvasRenderingContext2D;

      qr.renderTo2dContext(mockCtx, 2);

      const moduleCount = qr.getModuleCount();
      expect(mockCtx.fillRect).toHaveBeenCalledTimes(moduleCount * moduleCount);
    });

    it('uses correct fillStyle for dark and light modules', async () => {
      const qrcode = await getQrcode();
      const qr = qrcode(1, 'L');
      qr.addData('test');
      qr.make();

      const fillStyles: string[] = [];
      const mockCtx = {
        set fillStyle(val: string) {
          fillStyles.push(val);
        },
        get fillStyle() {
          return fillStyles[fillStyles.length - 1] || '';
        },
        fillRect: vi.fn(),
      } as unknown as CanvasRenderingContext2D;

      qr.renderTo2dContext(mockCtx, 2);

      expect(fillStyles).toContain('black');
      expect(fillStyles).toContain('white');
    });

    it('uses default cellSize of 2', async () => {
      const qrcode = await getQrcode();
      const qr = qrcode(1, 'L');
      qr.addData('test');
      qr.make();

      const mockCtx = {
        fillStyle: '',
        fillRect: vi.fn(),
      } as unknown as CanvasRenderingContext2D;

      qr.renderTo2dContext(mockCtx);

      // Check that fillRect was called with cellSize=2 coordinates
      const firstCall = (mockCtx.fillRect as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(firstCall[2]).toBe(2); // width
      expect(firstCall[3]).toBe(2); // height
    });
  });

  // ==========================================
  // getDataCache
  // ==========================================

  describe('getDataCache', () => {
    it('throws before make() is called (typeNumber < 1)', async () => {
      const qrcode = await getQrcode();
      const qr = qrcode(0, 'L');
      qr.addData('test');
      expect(() => qr.getDataCache()).toThrow('not initialized');
    });

    it('returns number array after make()', async () => {
      const qrcode = await getQrcode();
      const qr = qrcode(1, 'L');
      qr.addData('test');
      qr.make();
      const cache = qr.getDataCache();
      expect(Array.isArray(cache)).toBe(true);
      expect(cache.length).toBeGreaterThan(0);
      for (const byte of cache) {
        expect(typeof byte).toBe('number');
        expect(byte).toBeGreaterThanOrEqual(0);
        expect(byte).toBeLessThanOrEqual(255);
      }
    });

    it('returns consistent data on multiple calls', async () => {
      const qrcode = await getQrcode();
      const qr = qrcode(1, 'L');
      qr.addData('test');
      qr.make();
      const cache1 = qr.getDataCache();
      const cache2 = qr.getDataCache();
      expect(cache1).toEqual(cache2);
    });

    it('works for explicit typeNumber without make()', async () => {
      const qrcode = await getQrcode();
      const qr = qrcode(1, 'L');
      qr.addData('test');
      // Don't call make() but typeNumber >= 1 so getDataCache should create data
      const cache = qr.getDataCache();
      expect(Array.isArray(cache)).toBe(true);
      expect(cache.length).toBeGreaterThan(0);
    });
  });

  // ==========================================
  // Version 7+ (setupTypeNumber code path)
  // ==========================================

  describe('version >= 7 code path', () => {
    it('creates v7 QR code (triggers setupTypeNumber)', async () => {
      const qrcode = await getQrcode();
      const qr = qrcode(7, 'L');
      qr.addData('This is enough data for a version 7 QR code');
      qr.make();
      expect(qr.getModuleCount()).toBe(45); // v7 = 7*4+17 = 45
    });

    it('version 7 has correct finder patterns', async () => {
      const qrcode = await getQrcode();
      const qr = qrcode(7, 'L');
      qr.addData('This is enough data for a version 7 QR code');
      qr.make();
      // Top-left finder pattern
      expect(qr.isDark(0, 0)).toBe(true);
      expect(qr.isDark(0, 6)).toBe(true);
      expect(qr.isDark(6, 0)).toBe(true);
      expect(qr.isDark(6, 6)).toBe(true);
      // Inner ring (white)
      expect(qr.isDark(1, 1)).toBe(false);
    });
  });

  // ==========================================
  // Data overflow error
  // ==========================================

  describe('data overflow', () => {
    it('throws on data overflow for small version', async () => {
      const qrcode = await getQrcode();
      const qr = qrcode(1, 'H');
      qr.addData(
        'This string is way too long to fit in a version 1 H QR code because it exceeds capacity'
      );
      expect(() => qr.make()).toThrow('code length overflow');
    });
  });

  // ==========================================
  // Kanji mode
  // ==========================================

  describe('Kanji mode', () => {
    it('throws for Kanji mode in Node (sjis not supported)', async () => {
      const qrcode = await getQrcode();
      const qr = qrcode(0, 'L');
      expect(() => qr.addData('test', 'Kanji')).toThrow('sjis not supported');
    });
  });
});
