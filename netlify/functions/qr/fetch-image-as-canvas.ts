import { createCanvas } from "@napi-rs/canvas";
import { fetchImageWithBuffer } from "./fetch-image-with-buffer";

export async function fetchImageAsCanvas(
  url: string,
): Promise<ReturnType<typeof createCanvas> | null> {
  const result = await fetchImageWithBuffer(url);
  return result?.canvas ?? null;
}
