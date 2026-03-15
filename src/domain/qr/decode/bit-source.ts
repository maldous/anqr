import { FormatException } from './exceptions';

/**
 * Bit source for reading bits from byte array
 *
 * Enhanced with diagnostic logging for QR-Art debugging.
 * When a read overruns available bits, we log detailed context
 * to help identify whether terminator/padding was corrupted.
 */
export class BitSource {
  private byteOffset = 0;
  private bitOffset = 0;
  private totalBitsRead = 0;

  constructor(private readonly bytes: Uint8Array) {}

  available(): number {
    return 8 * (this.bytes.length - this.byteOffset) - this.bitOffset;
  }

  /**
   * Get current position for diagnostic logging
   */
  getPosition(): {
    byteOffset: number;
    bitOffset: number;
    totalBitsRead: number;
    available: number;
  } {
    return {
      byteOffset: this.byteOffset,
      bitOffset: this.bitOffset,
      totalBitsRead: this.totalBitsRead,
      available: this.available(),
    };
  }

  readBits(numBits: number): number {
    if (numBits < 1 || numBits > 32 || numBits > this.available()) {
      // Enhanced error with diagnostic context
      const pos = this.getPosition();
      const context = {
        requestedBits: numBits,
        availableBits: pos.available,
        byteOffset: pos.byteOffset,
        bitOffset: pos.bitOffset,
        totalBitsRead: pos.totalBitsRead,
        totalBytes: this.bytes.length,
        // Show remaining bytes as hex for debugging
        remainingBytesHex: Array.from(
          this.bytes.slice(pos.byteOffset, Math.min(pos.byteOffset + 8, this.bytes.length))
        )
          .map((b) => b.toString(16).padStart(2, '0'))
          .join(' '),
      };
      throw new FormatException(
        `BitSource overrun: requested ${numBits} bits but only ${pos.available} available. ` +
          `Position: byte ${pos.byteOffset}, bit ${pos.bitOffset}. ` +
          `This often indicates corrupted terminator/padding in QR-Art. ` +
          `Context: ${JSON.stringify(context)}`
      );
    }

    const originalNumBits = numBits;
    let result = 0;
    if (this.bitOffset > 0) {
      const bitsLeft = 8 - this.bitOffset;
      const toRead = Math.min(numBits, bitsLeft);
      const bitsToNotRead = bitsLeft - toRead;
      const mask = (0xff >> (8 - toRead)) << bitsToNotRead;
      result = (this.bytes[this.byteOffset] & mask) >> bitsToNotRead;
      numBits -= toRead;
      this.bitOffset += toRead;
      if (this.bitOffset === 8) {
        this.bitOffset = 0;
        this.byteOffset++;
      }
    }

    if (numBits > 0) {
      while (numBits >= 8) {
        result = (result << 8) | (this.bytes[this.byteOffset] & 0xff);
        this.byteOffset++;
        numBits -= 8;
      }

      if (numBits > 0) {
        const bitsToNotRead = 8 - numBits;
        const mask = (0xff >> bitsToNotRead) << bitsToNotRead;
        result = (result << numBits) | ((this.bytes[this.byteOffset] & mask) >> bitsToNotRead);
        this.bitOffset += numBits;
      }
    }
    this.totalBitsRead += originalNumBits;
    return result;
  }
}
