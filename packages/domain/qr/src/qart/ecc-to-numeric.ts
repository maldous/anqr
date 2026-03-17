import { QRErrorCorrectionLevel } from "@/modules/qr-encoder/types";
import type { ECCLevel } from "./bit-mapping.types";

/**
 * Convert ECC level character to numeric value
 */
export function eccToNumeric(ecc: ECCLevel): number {
  switch (ecc) {
    case "L":
      return QRErrorCorrectionLevel.L;
    case "M":
      return QRErrorCorrectionLevel.M;
    case "Q":
      return QRErrorCorrectionLevel.Q;
    case "H":
      return QRErrorCorrectionLevel.H;
    default:
      return QRErrorCorrectionLevel.M;
  }
}
