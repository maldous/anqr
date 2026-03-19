export type CanvasElement = HTMLCanvasElement | OffscreenCanvas;
export type Canvas2DContext = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
export type CreateCanvasFn = (
  width: number,
  height: number,
) => Promise<HTMLCanvasElement | OffscreenCanvas>;
export type ReleaseCanvasFn = (canvas: HTMLCanvasElement | OffscreenCanvas) => void;
