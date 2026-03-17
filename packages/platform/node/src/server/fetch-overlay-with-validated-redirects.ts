import { MAX_OVERLAY_REDIRECTS } from "./max-overlay-redirects.const";
import { _isPrivateHostname } from "./is-private-hostname";
import { isRedirectStatus } from "./is-redirect-status";

export async function fetchOverlayWithValidatedRedirects(
  initialUrl: URL,
  signal: AbortSignal,
): Promise<Response | null> {
  let currentUrl = initialUrl;

  for (let redirectCount = 0; redirectCount <= MAX_OVERLAY_REDIRECTS; redirectCount++) {
    if (!process.env.NETLIFY_DEV && (await _isPrivateHostname(currentUrl.hostname))) {
      return null;
    }

    const response = await fetch(currentUrl.toString(), {
      headers: {
        "User-Agent": "ANQR-QR-Generator/1.0",
      },
      signal,
      redirect: "manual",
    });

    if (!isRedirectStatus(response.status)) {
      return response;
    }

    const location = response.headers.get("location");
    if (!location) {
      return null;
    }

    let redirectedUrl: URL;
    try {
      redirectedUrl = new URL(location, currentUrl);
    } catch {
      return null;
    }

    if (!["http:", "https:"].includes(redirectedUrl.protocol)) {
      return null;
    }

    currentUrl = redirectedUrl;
  }

  return null;
}
