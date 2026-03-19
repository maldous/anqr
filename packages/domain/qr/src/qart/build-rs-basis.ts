import type { ECCLevel } from "../qr-encoder";
import type { RSBasisBlock } from "./rs-basis-block";
import { qartLog } from "./qart-log";

export function buildRSBasis(_version: number, _ecc: ECCLevel): RSBasisBlock[] {
  qartLog.warn("buildRSBasis not yet implemented");
  return [];
}
