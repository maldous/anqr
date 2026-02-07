declare module 'gifenc' {
  export function GIFEncoder(): {
    writeFrame(
      index: Uint8Array,
      width: number,
      height: number,
      opts?: {
        palette?: number[][];
        delay?: number;
        dispose?: number;
        transparent?: boolean;
        transparentIndex?: number;
      }
    ): void;
    finish(): void;
    bytesView(): Uint8Array;
    bytes(): Uint8Array;
    buffer: ArrayBuffer;
  };
  export function quantize(
    rgba: Uint8Array | Uint8ClampedArray,
    maxColors: number,
    options?: { format?: string }
  ): number[][];
  export function applyPalette(
    rgba: Uint8Array | Uint8ClampedArray,
    palette: number[][],
    format?: string
  ): Uint8Array;
}
