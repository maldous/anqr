import { qrcode } from "./encoder";
import type { ECCLevel, QROptions, QRInstance } from "./encoder-api.types";
import type { QRErrorCorrectionLevelChar } from "./types";
import { optimizeSegments } from "./optimize-segments";
import { createQRInstanceWithSegments } from "./create-qr-instance-with-segments";
import { toEncoderModeToken } from "./to-encoder-mode-token";

export function createQRInstance(
  data: string,
  errorCorrectionLevel: ECCLevel = "M",
  version: number = 0,
  options: Pick<QROptions, "mode" | "maskPattern"> = {},
): QRInstance {
  if (options.mode === "mixed" || options.mode === "auto") {
    const segments = optimizeSegments(data);
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
