import { createHash } from "node:crypto";
import { CORS_HEADERS } from "./cors-headers.const";

export function buildFinalResponse(
  outputBuffer: Buffer,
  contentType: string,
  cacheKey: string,
  isDegraded: boolean,
): Response {
  const etagSource = `${cacheKey}:${contentType}:${isDegraded ? "degraded" : "full"}:${outputBuffer.byteLength}`;
  const etag = `"${createHash("sha256").update(etagSource).digest("hex")}"`;
  return new Response(new Uint8Array(outputBuffer), {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": isDegraded
        ? "no-cache, no-store, must-revalidate"
        : "public, max-age=31536000, immutable",
      ...(isDegraded ? { "X-ANQR-Status": "generating" } : {}),
      ETag: etag,
      Vary: "Accept-Encoding",
      ...CORS_HEADERS,
    },
  });
}
