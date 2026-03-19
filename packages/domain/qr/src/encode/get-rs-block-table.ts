import { QRErrorCorrectionLevel } from "../qr-encoder/types";
import { RS_BLOCK_TABLE } from "./rs-block-table";

export function getRsBlockTable(
  typeNumber: number,
  errorCorrectionLevel: number,
): number[] | undefined {
  switch (errorCorrectionLevel) {
    case QRErrorCorrectionLevel.L:
      return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];
    case QRErrorCorrectionLevel.M:
      return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];
    case QRErrorCorrectionLevel.Q:
      return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];
    case QRErrorCorrectionLevel.H:
      return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];
    default:
      return undefined;
  }
}
