import type { Canvas } from "@napi-rs/canvas";
import { fetchImageWithBuffer } from "./fetch-image-with-buffer";

export async function fetchImageAsCanvas(url: string): Promise<Canvas | null> {
  const result = await fetchImageWithBuffer(url);
  return (result?.canvas as unknown as Canvas | null) ?? null;
}
