import type { ECCLevel } from "@/modules/qr-encoder";
import type { RSBasisBlock } from "./types";
import { qartLog } from "./qart-log";

export function buildRSBasis(_version: number, _ecc: ECCLevel): RSBasisBlock[] {
  qartLog.warn("buildRSBasis not yet implemented");
  return [];
}
