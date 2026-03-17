/**
 * Simple bit stream reader
 */
export class BitStream {
  private readonly bytes: number[];
  private byteIndex: number = 0;
  private bitIndex: number = 0;

  constructor(bytes: number[]) {
    this.bytes = bytes;
  }

  available(): number {
    return (this.bytes.length - this.byteIndex) * 8 - this.bitIndex;
  }

  read(numBits: number): number {
    let result = 0;

    for (let i = 0; i < numBits; i++) {
      if (this.byteIndex >= this.bytes.length) return result;

      const bit = (this.bytes[this.byteIndex] >> (7 - this.bitIndex)) & 1;
      result = (result << 1) | bit;

      this.bitIndex++;
      if (this.bitIndex === 8) {
        this.bitIndex = 0;
        this.byteIndex++;
      }
    }

    return result;
  }
}
