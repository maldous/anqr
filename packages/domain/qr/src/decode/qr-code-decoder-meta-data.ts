import { type ResultPoint } from "./result-types";

/**
 * Metadata holder for QR code decoder information
 */
export class QRCodeDecoderMetaData {
  constructor(private readonly mirrored: boolean) {}

  isMirrored(): boolean {
    return this.mirrored;
  }

  applyMirroredCorrection(points: ResultPoint[]): void {
    if (!(this.mirrored && points) || points.length < 3) {
      return;
    }
    // Swap bottom-left and top-right points
    const temp = points[0];
    points[0] = points[2];
    points[2] = temp;
  }
}
