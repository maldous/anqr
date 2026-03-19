import { crc16CCITT } from "./payload-generators/utils";

/**
 * Validate an EMV QR code CRC
 */
export function validateEMVQRCRC(payload: string): boolean {
  if (payload.length < 8) return false;
  const withoutCRC = payload.substring(0, payload.length - 4);
  const providedCRC = payload.substring(payload.length - 4);
  const calculatedCRC = crc16CCITT(withoutCRC);
  return providedCRC.toUpperCase() === calculatedCRC;
}
