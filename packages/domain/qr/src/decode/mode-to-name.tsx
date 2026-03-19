import {
  type DecodedSegmentInfo,
  MODE_ALPHANUMERIC,
  MODE_BYTE,
  MODE_ECI,
  MODE_KANJI,
  MODE_NUMERIC,
  MODE_TERMINATOR,
} from "../qr-decoder/types";

/**
 * Helper to convert mode indicator to mode name
 */
export function modeToName(mode: number): DecodedSegmentInfo["modeName"] {
  switch (mode) {
    case MODE_NUMERIC:
      return "numeric";
    case MODE_ALPHANUMERIC:
      return "alphanumeric";
    case MODE_BYTE:
      return "byte";
    case MODE_KANJI:
      return "kanji";
    case MODE_ECI:
      return "eci";
    case MODE_TERMINATOR:
      return "terminator";
    default:
      return "unknown";
  }
}
