export function clearDisplayCanvas(canvasEl: HTMLCanvasElement | null): void {
  if (!canvasEl) return;
  const ctx = canvasEl.getContext("2d");
  if (ctx) {
    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
  }
}
