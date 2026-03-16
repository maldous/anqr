import { qrcode } from "../../domain/qr/encode/encoder";
import type { QRErrorCorrectionLevelChar } from "./types";
import type { ECCLevel, QROptions, QRInstance } from "./encoder-api.types";
import { optimizeSegments } from "./optimize-segments";
import { createQRInstanceWithSegments } from "./create-qr-instance-with-segments";
import { toEncoderModeToken } from "./to-encoder-mode-token";

/**
 * Create a QR code instance
 * When mode is 'mixed' or 'auto', automatically optimizes into multiple segments
 * for maximum encoding efficiency (crucial for QArt URL patterns)
 */
export function createQRInstance(
  data: string,
  errorCorrectionLevel: ECCLevel = "M",
  version: number = 0,
  options: Pick<QROptions, "mode" | "maskPattern"> = {},
): QRInstance {
  // Use mixed mode optimization for 'mixed' or 'auto' modes
  if (options.mode === "mixed" || options.mode === "auto") {
    const segments = optimizeSegments(data);
    // Only use multi-segment if we found multiple segments or numeric optimization
    if (segments.length > 1 || (segments.length === 1 && segments[0].mode !== "byte")) {
      return createQRInstanceWithSegments(segments, errorCorrectionLevel, version, options);
    }
  }

  const typeNumber = version === 0 ? 0 : version;
  const qr = qrcode(
    typeNumber,
    errorCorrectionLevel as QRErrorCorrectionLevelChar,
  ) as unknown as QRInstance;

  const modeToken =
    options.mode && options.mode !== "mixed" ? toEncoderModeToken(options.mode, data) : undefined;
  qr.addData(data, modeToken);

  const mask = options.maskPattern;
  const maskPattern = typeof mask === "number" && mask >= 0 && mask <= 7 ? mask : undefined;
  qr.make(maskPattern);

  return qr;
}
