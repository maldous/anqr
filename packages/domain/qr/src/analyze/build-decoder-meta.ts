import type { DecoderMetadata, ECCLevel } from "@/modules/qr-analyzer/types";

export function buildDecoderMeta(code: {
  version?: number | null;
  maskPattern?: number | null;
  eccLevel?: ECCLevel | null;
  errorsCorrected?: number | null;
  erasures?: number | null;
  numBits?: number | null;
  orientation?: number | null;
  structuredAppendSequence?: number | null;
  structuredAppendParity?: number | null;
  dataBytes?: Uint8Array | null;
}): DecoderMetadata {
  return {
    version: code.version ?? null,
    maskPattern: code.maskPattern ?? null,
    eccLevel: code.eccLevel ?? null,
    errorsCorrected: code.errorsCorrected ?? null,
    erasures: code.erasures ?? null,
    numBits: code.numBits ?? null,
    orientation: code.orientation ?? null,
    structuredAppendSequence: code.structuredAppendSequence ?? null,
    structuredAppendParity: code.structuredAppendParity ?? null,
    hasStructuredAppend: (code.structuredAppendSequence ?? -1) >= 0,
    byteSegmentCount: code.dataBytes ? 1 : 0,
    totalByteLength: code.dataBytes?.length ?? 0,
  };
}
