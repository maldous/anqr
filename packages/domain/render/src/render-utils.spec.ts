import { describe, it, expect } from "vitest";
import { clampByte } from "./overlay/clamp-byte";
import { clampImageCoordinate } from "./overlay/clamp-image-coordinate";
import { packOverlayColor } from "./overlay/pack-overlay-color";
import { parseGridSize } from "./overlay/parse-grid-size";
import { parseHexColor } from "./overlay/parse-hex-color";
import { rgbToLumaSrgb } from "./overlay/rgb-to-luma-srgb";
import { edgePixelIndex } from "./overlay/edge-pixel-index";
import { COLOR_PRESENT_FLAG } from "./overlay/color-present-flag";
import { SOBEL_X, SOBEL_Y } from "./overlay/sobel-kernels.const";
import { curveIntensity } from "./intensity/curve-intensity";
import { isPrivateIPv4FirstOctet } from "./server/is-private-i-pv4-first-octet";
import { isPrivateIPv4Class192 } from "./server/is-private-i-pv4-class192";
import { isPrivateIPv4Subnet } from "./server/is-private-i-pv4-subnet";
import { isPrivateIPv4 } from "./server/is-private-i-pv4";
import { isReservedIPv6 } from "./server/is-reserved-i-pv6";
import { isPrivateOrReservedIP } from "./server/is-private-or-reserved-ip";
import { isRedirectStatus } from "./server/is-redirect-status";
import { isPathWithinRoot } from "./server/is-path-within-root";
import { computeModuleSize } from "./server/compute-module-size";
import { hue2rgbServer } from "./server/hue2rgb-server";
import { hslToRgbTupleServer } from "./server/hsl-to-rgb-tuple-server";
import { CRC32_TABLE } from "./export/crc32-table.const";
import { calculateCrc32 } from "./export/calculate-crc32";
import { createPngChunk } from "./export/create-png-chunk";
import { createPngPhysChunk } from "./export/create-png-phys-chunk";
import { createPngTextChunk } from "./export/create-png-text-chunk";

describe("domain/render/overlay", () => {
  describe("clampByte", () => {
    it("returns 0 for values <= 0", () => {
      expect(clampByte(0)).toBe(0);
      expect(clampByte(-1)).toBe(0);
      expect(clampByte(-100)).toBe(0);
    });

    it("returns 255 for values >= 255", () => {
      expect(clampByte(255)).toBe(255);
      expect(clampByte(256)).toBe(255);
      expect(clampByte(1000)).toBe(255);
    });

    it("rounds fractional values in range", () => {
      expect(clampByte(127.4)).toBe(127);
      expect(clampByte(127.5)).toBe(128);
      expect(clampByte(0.6)).toBe(1);
    });

    it("passes through integer values in range", () => {
      expect(clampByte(128)).toBe(128);
      expect(clampByte(1)).toBe(1);
      expect(clampByte(254)).toBe(254);
    });
  });

  describe("clampImageCoordinate", () => {
    it("clamps to 0 for negative values", () => {
      expect(clampImageCoordinate(-5, 100)).toBe(0);
    });

    it("clamps to max for values above max", () => {
      expect(clampImageCoordinate(150, 100)).toBe(100);
    });

    it("returns value when within range", () => {
      expect(clampImageCoordinate(50, 100)).toBe(50);
    });

    it("returns boundaries exactly", () => {
      expect(clampImageCoordinate(0, 100)).toBe(0);
      expect(clampImageCoordinate(100, 100)).toBe(100);
    });
  });

  describe("COLOR_PRESENT_FLAG", () => {
    it("is 0x01000000", () => {
      expect(COLOR_PRESENT_FLAG).toBe(0x01000000);
    });
  });

  describe("packOverlayColor", () => {
    it("packs RGB with COLOR_PRESENT_FLAG", () => {
      const packed = packOverlayColor(255, 128, 64);
      expect(packed & COLOR_PRESENT_FLAG).toBe(COLOR_PRESENT_FLAG);
    });

    it("encodes red in bits 16-23", () => {
      const packed = packOverlayColor(0xab, 0, 0);
      expect((packed >> 16) & 0xff).toBe(0xab);
    });

    it("encodes green in bits 8-15", () => {
      const packed = packOverlayColor(0, 0xcd, 0);
      expect((packed >> 8) & 0xff).toBe(0xcd);
    });

    it("encodes blue in bits 0-7", () => {
      const packed = packOverlayColor(0, 0, 0xef);
      expect(packed & 0xff).toBe(0xef);
    });

    it("packs black as COLOR_PRESENT_FLAG only", () => {
      expect(packOverlayColor(0, 0, 0)).toBe(COLOR_PRESENT_FLAG);
    });

    it("packs white correctly", () => {
      const packed = packOverlayColor(255, 255, 255);
      expect(packed).toBe(COLOR_PRESENT_FLAG | 0x00ffffff);
    });
  });

  describe("parseGridSize", () => {
    it("parses '2x2' to 2", () => {
      expect(parseGridSize("2x2")).toBe(2);
    });

    it("parses '3x3' to 3", () => {
      expect(parseGridSize("3x3")).toBe(3);
    });

    it("parses '4x4' to 4", () => {
      expect(parseGridSize("4x4")).toBe(4);
    });

    it("defaults to 3 for undefined", () => {
      expect(parseGridSize(undefined)).toBe(3);
    });

    it("defaults to 3 for invalid format", () => {
      expect(parseGridSize("abc")).toBe(3);
      expect(parseGridSize("")).toBe(3);
    });
  });

  describe("parseHexColor", () => {
    it("parses 6-digit hex with #", () => {
      expect(parseHexColor("#ff0000")).toEqual({ r: 255, g: 0, b: 0 });
    });

    it("parses 6-digit hex without #", () => {
      expect(parseHexColor("00ff00")).toEqual({ r: 0, g: 255, b: 0 });
    });

    it("parses mixed case", () => {
      expect(parseHexColor("#AaBbCc")).toEqual({ r: 170, g: 187, b: 204 });
    });

    it("returns null for undefined", () => {
      expect(parseHexColor(undefined)).toBeNull();
    });

    it("returns null for invalid hex", () => {
      expect(parseHexColor("xyz")).toBeNull();
      expect(parseHexColor("#gg0000")).toBeNull();
    });

    it("returns null for 3-digit shorthand (not supported)", () => {
      expect(parseHexColor("#abc")).toBeNull();
    });
  });

  describe("rgbToLumaSrgb", () => {
    it("returns 0 for black", () => {
      expect(rgbToLumaSrgb(0, 0, 0)).toBe(0);
    });

    it("returns 1 for white", () => {
      expect(rgbToLumaSrgb(255, 255, 255)).toBeCloseTo(1, 5);
    });

    it("uses BT.601 weights normalized to 0..1", () => {
      expect(rgbToLumaSrgb(255, 0, 0)).toBeCloseTo(0.299, 3);
      expect(rgbToLumaSrgb(0, 255, 0)).toBeCloseTo(0.587, 3);
      expect(rgbToLumaSrgb(0, 0, 255)).toBeCloseTo(0.114, 3);
    });
  });

  describe("edgePixelIndex", () => {
    it("returns 0 for (0,0)", () => {
      expect(edgePixelIndex(100, 0, 0)).toBe(0);
    });

    it("returns 4 for (1,0) in RGBA layout", () => {
      expect(edgePixelIndex(100, 1, 0)).toBe(4);
    });

    it("accounts for row stride", () => {
      expect(edgePixelIndex(10, 0, 1)).toBe(40);
      expect(edgePixelIndex(10, 5, 3)).toBe((3 * 10 + 5) * 4);
    });
  });

  describe("SOBEL_X / SOBEL_Y", () => {
    it("SOBEL_X is a 3x3 matrix", () => {
      expect(SOBEL_X).toHaveLength(3);
      expect(SOBEL_X[0]).toHaveLength(3);
    });

    it("SOBEL_Y is a 3x3 matrix", () => {
      expect(SOBEL_Y).toHaveLength(3);
      expect(SOBEL_Y[0]).toHaveLength(3);
    });

    it("SOBEL_X center column is all zeros", () => {
      expect(SOBEL_X[0][1]).toBe(0);
      expect(SOBEL_X[1][1]).toBe(0);
      expect(SOBEL_X[2][1]).toBe(0);
    });

    it("SOBEL_Y center row is all zeros", () => {
      expect(SOBEL_Y[1][0]).toBe(0);
      expect(SOBEL_Y[1][1]).toBe(0);
      expect(SOBEL_Y[1][2]).toBe(0);
    });
  });
});

describe("domain/render/intensity", () => {
  describe("curveIntensity", () => {
    it("returns 1 for pct=100", () => {
      expect(curveIntensity(100)).toBe(1);
    });

    it("returns 0 for pct=0", () => {
      expect(curveIntensity(0)).toBe(0);
    });

    it("returns quartic curve value for 50%", () => {
      const t = 0.5;
      expect(curveIntensity(50)).toBeCloseTo(t * t * t * t, 5);
    });

    it("clamps negative values to 0", () => {
      expect(curveIntensity(-10)).toBe(0);
    });

    it("clamps values above 100 to 1", () => {
      expect(curveIntensity(200)).toBe(1);
    });

    it("is monotonically increasing from 0 to 100", () => {
      let prev = curveIntensity(0);
      for (let pct = 1; pct <= 100; pct++) {
        const curr = curveIntensity(pct);
        expect(curr).toBeGreaterThanOrEqual(prev);
        prev = curr;
      }
    });
  });
});

describe("domain/render/server", () => {
  describe("isPrivateIPv4FirstOctet", () => {
    it("returns true for 10.x.x.x", () => {
      expect(isPrivateIPv4FirstOctet(10)).toBe(true);
    });

    it("returns true for 127.x.x.x (loopback)", () => {
      expect(isPrivateIPv4FirstOctet(127)).toBe(true);
    });

    it("returns true for 0.x.x.x", () => {
      expect(isPrivateIPv4FirstOctet(0)).toBe(true);
    });

    it("returns true for multicast range 224-239", () => {
      expect(isPrivateIPv4FirstOctet(224)).toBe(true);
      expect(isPrivateIPv4FirstOctet(239)).toBe(true);
    });

    it("returns true for reserved range 240+", () => {
      expect(isPrivateIPv4FirstOctet(240)).toBe(true);
      expect(isPrivateIPv4FirstOctet(255)).toBe(true);
    });

    it("returns false for public first octets", () => {
      expect(isPrivateIPv4FirstOctet(1)).toBe(false);
      expect(isPrivateIPv4FirstOctet(8)).toBe(false);
      expect(isPrivateIPv4FirstOctet(74)).toBe(false);
      expect(isPrivateIPv4FirstOctet(223)).toBe(false);
    });
  });

  describe("isPrivateIPv4Class192", () => {
    it("returns true for 192.168.x.x", () => {
      expect(isPrivateIPv4Class192(168, 0)).toBe(true);
      expect(isPrivateIPv4Class192(168, 1)).toBe(true);
    });

    it("returns true for 192.0.0.x", () => {
      expect(isPrivateIPv4Class192(0, 0)).toBe(true);
    });

    it("returns true for 192.0.2.x (TEST-NET-1)", () => {
      expect(isPrivateIPv4Class192(0, 2)).toBe(true);
    });

    it("returns false for public 192.x.x.x subnets", () => {
      expect(isPrivateIPv4Class192(30, 1)).toBe(false);
      expect(isPrivateIPv4Class192(100, 50)).toBe(false);
    });
  });

  describe("isPrivateIPv4Subnet", () => {
    it("returns true for 172.16-31.x.x", () => {
      expect(isPrivateIPv4Subnet(172, 16, 0)).toBe(true);
      expect(isPrivateIPv4Subnet(172, 31, 255)).toBe(true);
    });

    it("returns false for 172.32.x.x", () => {
      expect(isPrivateIPv4Subnet(172, 32, 0)).toBe(false);
    });

    it("returns true for 169.254.x.x (link-local)", () => {
      expect(isPrivateIPv4Subnet(169, 254, 0)).toBe(true);
    });

    it("returns true for 100.64-127.x.x (CGN)", () => {
      expect(isPrivateIPv4Subnet(100, 64, 0)).toBe(true);
      expect(isPrivateIPv4Subnet(100, 127, 0)).toBe(true);
    });

    it("returns true for 198.51.100.x (TEST-NET-2)", () => {
      expect(isPrivateIPv4Subnet(198, 51, 100)).toBe(true);
    });

    it("returns true for 203.0.113.x (TEST-NET-3)", () => {
      expect(isPrivateIPv4Subnet(203, 0, 113)).toBe(true);
    });

    it("delegates 192.x to isPrivateIPv4Class192", () => {
      expect(isPrivateIPv4Subnet(192, 168, 1)).toBe(true);
    });
  });

  describe("isPrivateIPv4", () => {
    it("returns true for first-octet private (10.0.0.1)", () => {
      expect(isPrivateIPv4(10, 0, 0)).toBe(true);
    });

    it("returns true for subnet private (172.16.0.0)", () => {
      expect(isPrivateIPv4(172, 16, 0)).toBe(true);
    });

    it("returns false for public IPs", () => {
      expect(isPrivateIPv4(8, 8, 8)).toBe(false);
      expect(isPrivateIPv4(1, 1, 1)).toBe(false);
    });
  });

  describe("isReservedIPv6", () => {
    it("returns true for link-local (fe80:)", () => {
      expect(isReservedIPv6("fe80::1")).toBe(true);
    });

    it("returns true for unique local (fc/fd)", () => {
      expect(isReservedIPv6("fc00::1")).toBe(true);
      expect(isReservedIPv6("fd00::1")).toBe(true);
    });

    it("returns true for loopback (::1)", () => {
      expect(isReservedIPv6("::1")).toBe(true);
    });

    it("returns true for IPv4-mapped (::ffff:)", () => {
      expect(isReservedIPv6("::ffff:192.168.1.1")).toBe(true);
    });

    it("returns false for global unicast", () => {
      expect(isReservedIPv6("2001:db8::1")).toBe(false);
      expect(isReservedIPv6("2607:f8b0:4004::1")).toBe(false);
    });
  });

  describe("isPrivateOrReservedIP", () => {
    it("returns true for localhost", () => {
      expect(isPrivateOrReservedIP("localhost")).toBe(true);
    });

    it("returns true for 127.0.0.1", () => {
      expect(isPrivateOrReservedIP("127.0.0.1")).toBe(true);
    });

    it("returns true for ::1", () => {
      expect(isPrivateOrReservedIP("::1")).toBe(true);
    });

    it("returns true for private IPv4 (10.0.0.1)", () => {
      expect(isPrivateOrReservedIP("10.0.0.1")).toBe(true);
    });

    it("returns true for private IPv4 (192.168.1.1)", () => {
      expect(isPrivateOrReservedIP("192.168.1.1")).toBe(true);
    });

    it("returns true for reserved IPv6", () => {
      expect(isPrivateOrReservedIP("fe80::1")).toBe(true);
    });

    it("returns false for public IPv4", () => {
      expect(isPrivateOrReservedIP("8.8.8.8")).toBe(false);
      expect(isPrivateOrReservedIP("1.1.1.1")).toBe(false);
    });

    it("returns false for public IPv6", () => {
      expect(isPrivateOrReservedIP("2607:f8b0:4004::1")).toBe(false);
    });
  });

  describe("isRedirectStatus", () => {
    it("returns true for HTTP redirect status codes", () => {
      expect(isRedirectStatus(301)).toBe(true);
      expect(isRedirectStatus(302)).toBe(true);
      expect(isRedirectStatus(303)).toBe(true);
      expect(isRedirectStatus(307)).toBe(true);
      expect(isRedirectStatus(308)).toBe(true);
    });

    it("returns false for non-redirect status codes", () => {
      expect(isRedirectStatus(200)).toBe(false);
      expect(isRedirectStatus(404)).toBe(false);
      expect(isRedirectStatus(500)).toBe(false);
      expect(isRedirectStatus(304)).toBe(false);
    });
  });

  describe("isPathWithinRoot", () => {
    it("returns true when path is inside root", () => {
      expect(isPathWithinRoot("/app/data/file.txt", "/app")).toBe(true);
    });

    it("returns true when path equals root", () => {
      expect(isPathWithinRoot("/app", "/app")).toBe(true);
    });

    it("returns false for path traversal", () => {
      expect(isPathWithinRoot("/app/../etc/passwd", "/app")).toBe(false);
    });

    it("returns false when path is outside root", () => {
      expect(isPathWithinRoot("/other/file.txt", "/app")).toBe(false);
    });

    it("handles similar prefixes correctly", () => {
      expect(isPathWithinRoot("/app-data/file.txt", "/app")).toBe(false);
    });
  });

  describe("computeModuleSize", () => {
    it("returns modulePxParam when provided", () => {
      expect(computeModuleSize(10, 400, 4, 25)).toBe(10);
    });

    it("clamps modulePxParam to 1-50 when truthy", () => {
      expect(computeModuleSize(100, 400, 4, 25)).toBe(50);
    });

    it("falls through to calculation when modulePxParam is 0 (falsy)", () => {
      const result = computeModuleSize(0, 400, 4, 25);
      expect(result).toBeGreaterThanOrEqual(1);
    });

    it("calculates from size when no modulePxParam", () => {
      const result = computeModuleSize(undefined, 400, 4, 25);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(400);
    });

    it("returns at least 1 for very small sizes", () => {
      expect(computeModuleSize(undefined, 10, 0, 100)).toBeGreaterThanOrEqual(1);
    });
  });

  describe("hue2rgbServer", () => {
    it("returns p when t >= 2/3", () => {
      expect(hue2rgbServer(0.2, 0.8, 0.8)).toBe(0.2);
    });

    it("returns q when 1/6 <= t < 1/2", () => {
      expect(hue2rgbServer(0.2, 0.8, 0.3)).toBe(0.8);
    });

    it("interpolates for t < 1/6", () => {
      const result = hue2rgbServer(0.2, 0.8, 0.1);
      expect(result).toBeGreaterThan(0.2);
      expect(result).toBeLessThanOrEqual(0.8);
    });

    it("wraps negative t values", () => {
      const result = hue2rgbServer(0, 1, -0.1);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
    });

    it("wraps t values above 1", () => {
      const result = hue2rgbServer(0, 1, 1.1);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
    });
  });

  describe("hslToRgbTupleServer", () => {
    it("converts pure red (0, 100, 50) to [255, 0, 0]", () => {
      expect(hslToRgbTupleServer(0, 100, 50)).toEqual([255, 0, 0]);
    });

    it("converts pure green (120, 100, 50) to [0, 255, 0]", () => {
      expect(hslToRgbTupleServer(120, 100, 50)).toEqual([0, 255, 0]);
    });

    it("converts pure blue (240, 100, 50) to [0, 0, 255]", () => {
      expect(hslToRgbTupleServer(240, 100, 50)).toEqual([0, 0, 255]);
    });

    it("converts black (0, 0, 0) to [0, 0, 0]", () => {
      expect(hslToRgbTupleServer(0, 0, 0)).toEqual([0, 0, 0]);
    });

    it("converts white (0, 0, 100) to [255, 255, 255]", () => {
      expect(hslToRgbTupleServer(0, 0, 100)).toEqual([255, 255, 255]);
    });

    it("converts gray (0, 0, 50) to [128, 128, 128]", () => {
      expect(hslToRgbTupleServer(0, 0, 50)).toEqual([128, 128, 128]);
    });

    it("handles negative hue by wrapping", () => {
      const result = hslToRgbTupleServer(-120, 100, 50);
      expect(result).toEqual(hslToRgbTupleServer(240, 100, 50));
    });

    it("handles hue > 360 by wrapping", () => {
      const result = hslToRgbTupleServer(480, 100, 50);
      expect(result).toEqual(hslToRgbTupleServer(120, 100, 50));
    });

    it("returns [r, g, b] tuple with values 0-255", () => {
      for (let h = 0; h < 360; h += 60) {
        const [r, g, b] = hslToRgbTupleServer(h, 50, 50);
        expect(r).toBeGreaterThanOrEqual(0);
        expect(r).toBeLessThanOrEqual(255);
        expect(g).toBeGreaterThanOrEqual(0);
        expect(g).toBeLessThanOrEqual(255);
        expect(b).toBeGreaterThanOrEqual(0);
        expect(b).toBeLessThanOrEqual(255);
      }
    });
  });
});

describe("domain/render/export", () => {
  describe("CRC32_TABLE", () => {
    it("has 256 entries", () => {
      expect(CRC32_TABLE).toHaveLength(256);
    });

    it("first entry is 0", () => {
      expect(CRC32_TABLE[0]).toBe(0);
    });

    it("all entries are 32-bit integers", () => {
      for (const entry of CRC32_TABLE) {
        expect(Number.isInteger(entry)).toBe(true);
        expect(entry).toBeGreaterThanOrEqual(-2147483648);
        expect(entry).toBeLessThanOrEqual(2147483647);
      }
    });
  });

  describe("calculateCrc32", () => {
    it("returns a 32-bit unsigned integer", () => {
      const crc = calculateCrc32(new Uint8Array([1, 2, 3]));
      expect(crc).toBeGreaterThanOrEqual(0);
      expect(crc).toBeLessThanOrEqual(0xffffffff);
    });

    it("is deterministic", () => {
      const data = new Uint8Array([72, 101, 108, 108, 111]);
      expect(calculateCrc32(data)).toBe(calculateCrc32(data));
    });

    it("produces different CRCs for different data", () => {
      const a = calculateCrc32(new Uint8Array([1, 2, 3]));
      const b = calculateCrc32(new Uint8Array([4, 5, 6]));
      expect(a).not.toBe(b);
    });

    it("handles empty input", () => {
      const crc = calculateCrc32(new Uint8Array([]));
      expect(crc).toBe(0);
    });

    it("computes known CRC32 for 'IEND'", () => {
      const data = new TextEncoder().encode("IEND");
      const crc = calculateCrc32(data);
      expect(crc).toBe(0xae426082);
    });
  });

  describe("createPngChunk", () => {
    it("creates a valid PNG chunk structure", () => {
      const data = new Uint8Array([0xde, 0xad]);
      const chunk = createPngChunk("tEXt", data);

      expect(chunk).toBeInstanceOf(Uint8Array);
      expect(chunk.length).toBe(4 + 4 + data.length + 4);
    });

    it("encodes chunk length in first 4 bytes (big-endian)", () => {
      const data = new Uint8Array([1, 2, 3]);
      const chunk = createPngChunk("tEXt", data);
      const view = new DataView(chunk.buffer);

      expect(view.getUint32(0, false)).toBe(3);
    });

    it("encodes chunk type in bytes 4-7", () => {
      const chunk = createPngChunk("IHDR", new Uint8Array([]));
      const typeBytes = new TextDecoder().decode(chunk.slice(4, 8));

      expect(typeBytes).toBe("IHDR");
    });

    it("includes chunk data after type", () => {
      const data = new Uint8Array([0xaa, 0xbb]);
      const chunk = createPngChunk("tEXt", data);

      expect(chunk[8]).toBe(0xaa);
      expect(chunk[9]).toBe(0xbb);
    });

    it("appends CRC32 in last 4 bytes", () => {
      const data = new Uint8Array([0x00]);
      const chunk = createPngChunk("tEXt", data);
      const view = new DataView(chunk.buffer);
      const crc = view.getUint32(chunk.length - 4, false);

      expect(crc).toBeGreaterThan(0);
    });
  });

  describe("createPngPhysChunk", () => {
    it("creates a pHYs chunk", () => {
      const chunk = createPngPhysChunk(72);
      expect(chunk).toBeInstanceOf(Uint8Array);
    });

    it("contains pHYs type identifier", () => {
      const chunk = createPngPhysChunk(72);
      const typeBytes = new TextDecoder().decode(chunk.slice(4, 8));
      expect(typeBytes).toBe("pHYs");
    });

    it("chunk data length is 9 (4+4+1)", () => {
      const chunk = createPngPhysChunk(72);
      const view = new DataView(chunk.buffer);
      expect(view.getUint32(0, false)).toBe(9);
    });

    it("converts DPI to pixels per meter", () => {
      const chunk = createPngPhysChunk(72);
      const view = new DataView(chunk.buffer);
      const ppm = view.getUint32(8, false);
      expect(ppm).toBe(Math.round(72 / 0.0254));
    });

    it("sets unit specifier to 1 (meter)", () => {
      const chunk = createPngPhysChunk(300);
      expect(chunk[16]).toBe(1);
    });
  });

  describe("createPngTextChunk", () => {
    it("creates an iTXt chunk", () => {
      const chunk = createPngTextChunk("Author", "ANQR");
      expect(chunk).toBeInstanceOf(Uint8Array);
    });

    it("contains iTXt type identifier", () => {
      const chunk = createPngTextChunk("Title", "Test");
      const typeBytes = new TextDecoder().decode(chunk.slice(4, 8));
      expect(typeBytes).toBe("iTXt");
    });

    it("embeds the keyword followed by null byte", () => {
      const chunk = createPngTextChunk("Title", "Test");
      const keywordEnd = chunk.indexOf(0, 8);
      const keyword = new TextDecoder().decode(chunk.slice(8, keywordEnd));
      expect(keyword).toBe("Title");
    });

    it("sets compression flag to 0", () => {
      const chunk = createPngTextChunk("Title", "Test");
      const keywordEnd = chunk.indexOf(0, 8);
      expect(chunk[keywordEnd + 1]).toBe(0);
    });

    it("encodes UTF-8 text", () => {
      const chunk = createPngTextChunk("Desc", "Hello World");
      const decoded = new TextDecoder().decode(chunk);
      expect(decoded).toContain("Hello World");
    });
  });
});
