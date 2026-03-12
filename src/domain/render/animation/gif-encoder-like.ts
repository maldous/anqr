export interface GifEncoderLike {
  writeFrame: (
    index: Uint8Array,
    width: number,
    height: number,
    options: Record<string, unknown>
  ) => void;
  finish: () => void;
  bytesView: () => Uint8Array;
  bytes: () => Uint8Array;
}
