import type { ParsedHandlerParams } from "./parsed-handler-params.types";
import { CORS_HEADERS } from "./cors-headers.const";
import { MAX_DATA_LENGTH } from "./max-data-length.const";

export function validateParsedParams(p: ParsedHandlerParams): Response | null {
  if (!p.data) {
    return new Response('Missing required "data" parameter', {
      status: 400,
      headers: CORS_HEADERS,
    });
  }
  if (p.data.length > MAX_DATA_LENGTH) {
    return new Response(`Data too long: ${p.data.length} characters (max: ${MAX_DATA_LENGTH})`, {
      status: 400,
      headers: CORS_HEADERS,
    });
  }
  if (!["L", "M", "Q", "H"].includes(p.ec)) {
    return new Response('Invalid "ec" parameter. Use L, M, Q, or H', {
      status: 400,
      headers: CORS_HEADERS,
    });
  }
  const validModuleStyles = ["square", "rounded", "dots", "diamond", "connected"];
  if (!validModuleStyles.includes(p.moduleStyle)) {
    return new Response(`Invalid "style" parameter. Use one of: ${validModuleStyles.join(", ")}`, {
      status: 400,
      headers: CORS_HEADERS,
    });
  }
  return null;
}
