import type { DecodeResult, DecoderMetadata, ECCLevelChar } from "../qr-decoder/types";
import { type Result, ResultMetadataType } from "./result-types";
import { detectEncodingMode } from "./adapter-detect-encoding-mode";

export function extractDecodeResult(result: Result, imageData: ImageData): DecodeResult {
  const text = result.getText();
  const metadata = result.getResultMetadata();

  const eccLevel =
    (metadata?.get(ResultMetadataType.ERROR_CORRECTION_LEVEL) as ECCLevelChar) || null;
  const maskPattern =
    (metadata?.get(ResultMetadataType.QR_MASK_PATTERN) as number | undefined) ?? null;
  const versionFromMetadata = metadata?.get(ResultMetadataType.QR_VERSION) as number | undefined;
  const orientation = (metadata?.get(ResultMetadataType.ORIENTATION) as number | undefined) ?? null;
  const structuredAppendSequence =
    (metadata?.get(ResultMetadataType.STRUCTURED_APPEND_SEQUENCE) as number | undefined) ?? null;
  const structuredAppendParity =
    (metadata?.get(ResultMetadataType.STRUCTURED_APPEND_PARITY) as number | undefined) ?? null;

  const byteSegments = metadata?.get(ResultMetadataType.BYTE_SEGMENTS) as Uint8Array[] | undefined;
  let dataBytes: Uint8Array | null = null;
  if (byteSegments && byteSegments.length > 0) {
    let totalLength = 0;
    for (const segment of byteSegments) totalLength += segment.length;
    dataBytes = new Uint8Array(totalLength);
    let offset = 0;
    for (const segment of byteSegments) {
      dataBytes.set(segment, offset);
      offset += segment.length;
    }
  }

  const points = result.getResultPoints();
  let location = {
    topLeftCorner: { x: 0, y: 0 },
    topRightCorner: { x: imageData.width, y: 0 },
    bottomLeftCorner: { x: 0, y: imageData.height },
    bottomRightCorner: { x: imageData.width, y: imageData.height },
  };
  if (points && points.length >= 3) {
    location = {
      bottomLeftCorner: { x: points[0].getX(), y: points[0].getY() },
      topLeftCorner: { x: points[1].getX(), y: points[1].getY() },
      topRightCorner: { x: points[2].getX(), y: points[2].getY() },
      bottomRightCorner:
        points.length >= 4
          ? { x: points[3].getX(), y: points[3].getY() }
          : {
              x: points[2].getX() - points[1].getX() + points[0].getX(),
              y: points[2].getY() - points[1].getY() + points[0].getY(),
            },
    };
  }

  const version =
    typeof versionFromMetadata === "number" && versionFromMetadata >= 1 && versionFromMetadata <= 40
      ? versionFromMetadata
      : null;
  const numBits = result.getNumBits() || null;
  const errorsCorrectedFromMeta = metadata?.get(ResultMetadataType.QR_ERRORS_CORRECTED) as
    | number
    | undefined;
  const erasuresFromMeta = metadata?.get(ResultMetadataType.QR_ERASURES) as number | undefined;
  const errorsCorrected: number | null =
    typeof errorsCorrectedFromMeta === "number" ? errorsCorrectedFromMeta : null;
  const erasures: number | null = typeof erasuresFromMeta === "number" ? erasuresFromMeta : null;
  const encodingMode = detectEncodingMode(text);

  const decoderMetadata: DecoderMetadata = {
    version,
    maskPattern,
    eccLevel,
    errorsCorrected,
    erasures,
    numBits,
    orientation,
    structuredAppendSequence,
    structuredAppendParity,
    hasStructuredAppend: structuredAppendSequence !== null && structuredAppendSequence >= 0,
    byteSegmentCount: byteSegments?.length ?? 0,
    totalByteLength: dataBytes?.length ?? 0,
  };

  return {
    success: true,
    data: text,
    dataBytes,
    error: null,
    location,
    version,
    eccLevel,
    maskPattern,
    encodingMode,
    errorsCorrected,
    erasures,
    orientation,
    numBits,
    structuredAppendSequence,
    structuredAppendParity,
    decoderMetadata,
    structurallyValid: true,
    segmentCount: byteSegments?.length ?? 1,
    segments: undefined,
  };
}
