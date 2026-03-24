import { describe, it, expect } from "vitest";
import type { DecoderMetadata } from "./decoder-metadata.contract";

describe("contracts/analyze/decoder-metadata", () => {
  describe("DecoderMetadata", () => {
    it("accepts valid decoder metadata with all fields populated", () => {
      const metadata: DecoderMetadata = {
        version: 5,
        maskPattern: 3,
        eccLevel: "H",
        errorsCorrected: 2,
        erasures: 0,
        numBits: 512,
        orientation: 0,
        structuredAppendSequence: null,
        structuredAppendParity: null,
        hasStructuredAppend: false,
        byteSegmentCount: 1,
        totalByteLength: 64,
      };
      expect(metadata.version).toBe(5);
      expect(metadata.eccLevel).toBe("H");
    });

    it("accepts null values for optional metadata", () => {
      const metadata: DecoderMetadata = {
        version: null,
        maskPattern: null,
        eccLevel: null,
        errorsCorrected: null,
        erasures: null,
        numBits: null,
        orientation: null,
        structuredAppendSequence: null,
        structuredAppendParity: null,
        hasStructuredAppend: false,
        byteSegmentCount: 0,
        totalByteLength: 0,
      };
      expect(metadata.version).toBeNull();
    });

    it("accepts all ECC levels", () => {
      const levels: Array<NonNullable<DecoderMetadata["eccLevel"]>> = ["L", "M", "Q", "H"];
      for (const level of levels) {
        const metadata: DecoderMetadata = {
          version: 1,
          maskPattern: 0,
          eccLevel: level,
          errorsCorrected: 0,
          erasures: 0,
          numBits: 100,
          orientation: 0,
          structuredAppendSequence: null,
          structuredAppendParity: null,
          hasStructuredAppend: false,
          byteSegmentCount: 1,
          totalByteLength: 10,
        };
        expect(metadata.eccLevel).toBe(level);
      }
    });

    it("accepts structured append metadata", () => {
      const metadata: DecoderMetadata = {
        version: 10,
        maskPattern: 2,
        eccLevel: "M",
        errorsCorrected: 1,
        erasures: 0,
        numBits: 1024,
        orientation: 0,
        structuredAppendSequence: 1,
        structuredAppendParity: 42,
        hasStructuredAppend: true,
        byteSegmentCount: 2,
        totalByteLength: 128,
      };
      expect(metadata.hasStructuredAppend).toBe(true);
      expect(metadata.structuredAppendSequence).toBe(1);
    });

    it("accepts version range 1-40", () => {
      const v1: DecoderMetadata = {
        version: 1,
        maskPattern: 0,
        eccLevel: "L",
        errorsCorrected: 0,
        erasures: 0,
        numBits: 152,
        orientation: 0,
        structuredAppendSequence: null,
        structuredAppendParity: null,
        hasStructuredAppend: false,
        byteSegmentCount: 1,
        totalByteLength: 19,
      };
      expect(v1.version).toBe(1);

      const v40: DecoderMetadata = {
        version: 40,
        maskPattern: 7,
        eccLevel: "H",
        errorsCorrected: 5,
        erasures: 0,
        numBits: 23648,
        orientation: 0,
        structuredAppendSequence: null,
        structuredAppendParity: null,
        hasStructuredAppend: false,
        byteSegmentCount: 1,
        totalByteLength: 2953,
      };
      expect(v40.version).toBe(40);
    });
  });
});
