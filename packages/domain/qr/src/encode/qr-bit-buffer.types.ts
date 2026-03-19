export interface QRBitBuffer {
  getBuffer: () => number[];
  getAt: (index: number) => boolean;
  put: (num: number, length: number) => void;
  getLengthInBits: () => number;
  putBit: (bit: boolean) => void;
}
