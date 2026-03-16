import { arraycopy, currentTimeMillis } from "./util";
import { ResultMetadataType } from "./result-metadata.types";
import { ResultPoint } from "./result-point";
import { BarcodeFormat } from "./barcode-format";

/**
 * Encapsulates the result of decoding a barcode
 */
export class Result {
  private resultMetadata: Map<ResultMetadataType, unknown> | null = null;

  constructor(
    private readonly text: string,
    private readonly rawBytes: Uint8Array,
    private readonly numBits: number = rawBytes == null ? 0 : 8 * rawBytes.length,
    private resultPoints: ResultPoint[],
    private readonly format: BarcodeFormat,
    private readonly timestamp: number = currentTimeMillis(),
  ) {
    if (numBits === undefined || numBits === null) {
      this.numBits = rawBytes === null || rawBytes === undefined ? 0 : 8 * rawBytes.length;
    }
    if (timestamp === undefined || timestamp === null) {
      this.timestamp = currentTimeMillis();
    }
  }

  getText(): string {
    return this.text;
  }

  getRawBytes(): Uint8Array {
    return this.rawBytes;
  }

  getNumBits(): number {
    return this.numBits;
  }

  getResultPoints(): ResultPoint[] {
    return this.resultPoints;
  }

  getBarcodeFormat(): BarcodeFormat {
    return this.format;
  }

  getResultMetadata(): Map<ResultMetadataType, unknown> | null {
    return this.resultMetadata;
  }

  putMetadata(type: ResultMetadataType, value: unknown): void {
    this.resultMetadata ??= new Map();
    this.resultMetadata.set(type, value);
  }

  putAllMetadata(metadata: Map<ResultMetadataType, unknown> | null): void {
    if (metadata !== null) {
      if (this.resultMetadata === null) {
        this.resultMetadata = metadata;
      } else {
        this.resultMetadata = new Map(metadata);
      }
    }
  }

  addResultPoints(newPoints: ResultPoint[]): void {
    const oldPoints = this.resultPoints;
    if (oldPoints === null) {
      this.resultPoints = newPoints;
    } else if (newPoints !== null && newPoints.length > 0) {
      const allPoints = Array.from<ResultPoint>({ length: oldPoints.length + newPoints.length });
      arraycopy(oldPoints, 0, allPoints, 0, oldPoints.length);
      arraycopy(newPoints, 0, allPoints, oldPoints.length, newPoints.length);
      this.resultPoints = allPoints;
    }
  }

  getTimestamp(): number {
    return this.timestamp;
  }

  toString(): string {
    return this.text;
  }
}
