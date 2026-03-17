declare class ImageDecoder {
  constructor(init: ImageDecoderInit);
  readonly complete: boolean;
  readonly completed: Promise<undefined>;
  readonly tracks: ImageTrackList;
  readonly type: string;
  close(): void;
  decode(options?: ImageDecodeOptions): Promise<ImageDecodeResult>;
  reset(): void;
  static isTypeSupported(type: string): Promise<boolean>;
}
