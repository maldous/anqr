import type { Context } from "https://edge.netlify.com";
import { PageMeta } from "./page-meta.types.ts";
import { truncate } from "./truncate.ts";
import { buildOgImageUrl } from "./build-og-image-url.ts";
import { BASE_URL } from "./base-url.const.ts";
import { PAGE_META } from "./page-meta.const.ts";
import { escapeHtml } from "./escape-html.ts";
import { OG_IMAGE_SIZE } from "./og-image-size.const.ts";

export default async function handler(request: Request, context: Context) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Skip static assets, API calls, and other non-page requests early
  if (
    pathname.startsWith("/assets/") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/.netlify/") ||
    pathname.startsWith("/icons/") ||
    pathname.startsWith("/screenshots/") ||
    pathname.startsWith("/images/") ||
    pathname.startsWith("/.well-known/") ||
    /\.(js|css|png|jpe?g|gif|svg|ico|woff2?|json|xml|txt|webp|map|webmanifest)$/i.test(pathname)
  ) {
    return context.next();
  }

  // Normalize path: strip trailing slashes, default to '/'
  let path = pathname;
  while (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  if (!path) path = "/";

  // Skip gallery image paths (e.g. /gallery/plain-v1-L.png) but not /gallery itself
  if (pathname.startsWith("/gallery/") && path !== "/gallery") {
    return context.next();
  }

  // Look up page metadata; for '/' with ?data= param, build dynamic share meta
  const dataParam = url.searchParams.get("data");
  const isShareUrl = path === "/" && dataParam;

  let meta: PageMeta | undefined;
  let canonicalUrl: string;

  if (isShareUrl) {
    const displayData = truncate(dataParam, 80);
    meta = {
      title: `QR Code: ${displayData} | ANQR`,
      description: `Scan this QR code created with ANQR. Content: ${truncate(dataParam, 150)}`,
      ogImageUrl: buildOgImageUrl(url.searchParams),
    };
    canonicalUrl = `${BASE_URL}/?${url.searchParams.toString()}`;
  } else {
    meta = PAGE_META[path];
    canonicalUrl = path === "/" ? `${BASE_URL}/` : `${BASE_URL}${path}`;
  }

  if (!meta) {
    return context.next();
  }

  const response = await context.next();

  // Only modify HTML responses
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) {
    return response;
  }

  let html = await response.text();

  const safeTitle = escapeHtml(meta.title);
  const safeDescription = escapeHtml(meta.description);
  const safeCanonical = escapeHtml(canonicalUrl);

  // Replace <title>
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${safeTitle}</title>`);

  // Replace meta description
  html = html.replace(
    /<meta name="description" content="[^"]*"/,
    `<meta name="description" content="${safeDescription}"`,
  );

  // Replace canonical URL
  html = html.replace(
    /<link rel="canonical" href="[^"]*"/,
    `<link rel="canonical" href="${safeCanonical}"`,
  );

  // Replace Open Graph tags
  html = html.replace(
    /<meta property="og:url" content="[^"]*"/,
    `<meta property="og:url" content="${safeCanonical}"`,
  );
  html = html.replace(
    /<meta property="og:title" content="[^"]*"/,
    `<meta property="og:title" content="${safeTitle}"`,
  );
  html = html.replace(
    /<meta property="og:description" content="[^"]*"/,
    `<meta property="og:description" content="${safeDescription}"`,
  );

  // Replace og:image for share URLs (dynamic QR preview via API)
  if (meta.ogImageUrl) {
    const safeOgImage = escapeHtml(meta.ogImageUrl);
    html = html.replace(
      /<meta property="og:image" content="[^"]*"/,
      `<meta property="og:image" content="${safeOgImage}"`,
    );
    html = html.replace(
      /<meta property="og:image:width" content="[^"]*"/,
      `<meta property="og:image:width" content="${OG_IMAGE_SIZE}"`,
    );
    html = html.replace(
      /<meta property="og:image:height" content="[^"]*"/,
      `<meta property="og:image:height" content="${OG_IMAGE_SIZE}"`,
    );
    html = html.replace(
      /<meta name="twitter:image" content="[^"]*"/,
      `<meta name="twitter:image" content="${safeOgImage}"`,
    );
  }

  // Replace Twitter Card tags
  html = html.replace(
    /<meta name="twitter:url" content="[^"]*"/,
    `<meta name="twitter:url" content="${safeCanonical}"`,
  );
  html = html.replace(
    /<meta name="twitter:title" content="[^"]*"/,
    `<meta name="twitter:title" content="${safeTitle}"`,
  );
  html = html.replace(
    /<meta name="twitter:description" content="[^"]*"/,
    `<meta name="twitter:description" content="${safeDescription}"`,
  );

  // Build new response with modified HTML
  const headers = new Headers(response.headers);
  headers.delete("content-length");

  return new Response(html, {
    status: response.status,
    headers,
  });
}
