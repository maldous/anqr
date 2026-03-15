interface ImageDecoderInit {
  type: string;
  data: ArrayBuffer | ReadableStream<Uint8Array>;
  colorSpaceConversion?: 'default' | 'none';
  desiredHeight?: number;
  desiredWidth?: number;
  preferAnimation?: boolean;
}
