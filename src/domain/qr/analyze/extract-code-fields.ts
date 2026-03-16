import type { ECCLevel } from "../../../modules/qr-analyzer/types";

export function extractCodeFields(code: {
  eccLevel?: ECCLevel | null;
  maskPattern?: number | null;
  errorsCorrected?: number | null;
  erasures?: number | null;
  orientation?: number | null;
  numBits?: number | null;
  structuredAppendSequence?: number | null;
  structuredAppendParity?: number | null;
}) {
  return {
    eccLevel: code.eccLevel || null,
    maskPattern: code.maskPattern ?? null,
    errorsCorrected: code.errorsCorrected ?? null,
    erasures: code.erasures ?? null,
    orientation: code.orientation ?? null,
    numBits: code.numBits ?? null,
    structuredAppendSequence: code.structuredAppendSequence ?? null,
    structuredAppendParity: code.structuredAppendParity ?? null,
  };
}
