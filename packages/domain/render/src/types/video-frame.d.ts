interface VideoFrame {
  readonly codedHeight: number;
  readonly codedRect: DOMRectReadOnly | null;
  readonly codedWidth: number;
  readonly colorSpace: VideoColorSpace;
  readonly displayHeight: number;
  readonly displayWidth: number;
  readonly duration: number | null;
  readonly format: VideoPixelFormat | null;
  readonly timestamp: number;
  readonly visibleRect: DOMRectReadOnly | null;
  allocationSize(options?: VideoFrameCopyToOptions): number;
  clone(): VideoFrame;
  close(): void;
  copyTo(destination: BufferSource, options?: VideoFrameCopyToOptions): Promise<PlaneLayout[]>;
}
