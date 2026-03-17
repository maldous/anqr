export function resolveEffectTargetCanvas(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  targetCanvas?: HTMLCanvasElement | OffscreenCanvas,
) {
  let result: HTMLCanvasElement | OffscreenCanvas;

  if (targetCanvas) {
    result = targetCanvas;
    if (result.width !== canvas.width) result.width = canvas.width;
    if (result.height !== canvas.height) result.height = canvas.height;
  } else if (typeof OffscreenCanvas === "undefined") {
    result = document.createElement("canvas");
    result.width = canvas.width;
    result.height = canvas.height;
  } else {
    result = new OffscreenCanvas(canvas.width, canvas.height);
  }

  const ctx =
    result.getContext("2d", {
      willReadFrequently: true,
      desynchronized: true,
    }) ?? result.getContext("2d");

  return { ctx, result };
}
