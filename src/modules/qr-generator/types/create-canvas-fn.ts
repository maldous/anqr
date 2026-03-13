export type CreateCanvasFn = (
  width: number,
  height: number
) => Promise<HTMLCanvasElement | OffscreenCanvas>;
