import type { FetchedImage } from "./fetched-image.types";
import { readLocalOverlayFile } from "./read-local-overlay-file";
import { _isPrivateHostname } from "./is-private-hostname";
import { FETCH_TIMEOUT_MS } from "./fetch-timeout-ms.const";
import { fetchOverlayWithValidatedRedirects } from "./fetch-overlay-with-validated-redirects";

export async function validateAndFetchOverlay(
  url: string,
): Promise<{ localResult: FetchedImage | null } | { response: Response } | null> {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
    if (parsedUrl.protocol === "file:") {
      return { localResult: await readLocalOverlayFile(parsedUrl) };
    }
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return null;
    }
    if (!process.env.NETLIFY_DEV && (await _isPrivateHostname(parsedUrl.hostname))) {
      return null;
    }
  } catch {
    return null;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  let response: Response | null = null;
  try {
    response = await fetchOverlayWithValidatedRedirects(parsedUrl, controller.signal);
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response?.ok) {
    return null;
  }

  const contentType = response.headers.get("Content-Type") || "";
  const validImageTypes = [
    "image/png",
    "image/jpeg",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    "image/bmp",
  ];
  const isImage = validImageTypes.some((type) => contentType.toLowerCase().startsWith(type));
  if (!isImage && contentType && !contentType.startsWith("application/octet-stream")) {
    return null;
  }

  return { response };
}
