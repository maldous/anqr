import { decodeQR } from "../decode";

export async function decodeCanvasData(
  c: HTMLCanvasElement | OffscreenCanvas,
): Promise<{ success: boolean; data: string | null } | null> {
  const ctx = c.getContext("2d") as CanvasRenderingContext2D | null;
  if (!ctx) return null;
  const imageData = ctx.getImageData(0, 0, c.width, c.height);
  return decodeQR(imageData, { inversionAttempts: "attemptBoth" });
}
