import type { PayloadData } from "./payload-data";

export function serializeUrlWithUtm(payload: PayloadData): string {
  let url = payload.url.href;
  if (payload.url.forceHttps && url.startsWith("http://")) {
    url = url.replace("http://", "https://");
  }
  const params = new URLSearchParams();
  if (payload.url.utmSource) params.set("utm_source", payload.url.utmSource);
  if (payload.url.utmMedium) params.set("utm_medium", payload.url.utmMedium);
  if (payload.url.utmCampaign) params.set("utm_campaign", payload.url.utmCampaign);
  if (payload.url.utmTerm) params.set("utm_term", payload.url.utmTerm);
  if (payload.url.utmContent) params.set("utm_content", payload.url.utmContent);
  const paramStr = params.toString();
  if (!paramStr) return url;
  return `${url}${url.includes("?") ? "&" : "?"}${paramStr}`;
}
