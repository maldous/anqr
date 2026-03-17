import { type ECCLevel, type RSBlockInfo } from "./bit-mapping";
import type { RSBasisVector } from "./rs-basis-vector.types";

export type { RSBasisVector } from "./rs-basis-vector.types";
export type { QRArtCapacityInfo } from "./qr-art-capacity-info.types";
export type { OptimalVersionAndSuffix } from "./optimal-version-and-suffix.types";

export interface RSBasis {
  version: number;
  ecc: ECCLevel;
  blocks: RSBlockInfo[];
  vectors: RSBasisVector[];
  totalDataBits: number;
  totalEccBits: number;
}
