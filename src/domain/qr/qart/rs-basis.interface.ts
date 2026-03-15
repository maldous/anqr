import { type ECCLevel, type RSBlockInfo } from './bit-mapping';
import type { RSBasisVector } from './rs-basis-vector.interface';

export interface RSBasis {
  version: number;
  ecc: ECCLevel;
  blocks: RSBlockInfo[];
  vectors: RSBasisVector[];
  totalDataBits: number;
  totalEccBits: number;
}
