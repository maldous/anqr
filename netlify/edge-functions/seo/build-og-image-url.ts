import { OG_IMAGE_SIZE } from "./og-image-size.const.ts";
import { OG_PASSTHROUGH_PARAMS } from "./og-passthrough-params.const.ts";
import { BASE_URL } from "./base-url.const.ts";

export function buildOgImageUrl(searchParams: URLSearchParams): string {
  const imageParams = new URLSearchParams();

  const data = searchParams.get("data");
  if (data) imageParams.set("data", data);

  imageParams.set("size", OG_IMAGE_SIZE.toString());

  const clientSize = searchParams.get("size");
  if (clientSize) imageParams.set("modulePx", clientSize);

  for (const key of OG_PASSTHROUGH_PARAMS) {
    const val = searchParams.get(key);
    if (val) imageParams.set(key, val);
  }

  return `${BASE_URL}/api/qr?${imageParams.toString()}`;
}
