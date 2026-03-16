import { ParsedHandlerParams } from "./parsed-handler-params.types.ts";
import { parseCoreQRParams } from "./parse-core-qr-params.ts";
import { parseStylingParams } from "./parse-styling-params.ts";
import { parseProtectionParams } from "./parse-protection-params.ts";
import { parseOverlayParams } from "./parse-overlay-params.ts";
import { parseDitherParams } from "./parse-dither-params.ts";
import { parseOutputParams } from "./parse-output-params.ts";
import { parseAnimationParams } from "./parse-animation-params.ts";

export function parseHandlerParams(params: URLSearchParams, request: Request): ParsedHandlerParams {
  return {
    ...parseCoreQRParams(params),
    ...parseStylingParams(params),
    ...parseProtectionParams(params),
    ...parseOverlayParams(params),
    ...parseDitherParams(params),
    ...parseOutputParams(params),
    ...parseAnimationParams(params),
    skipCache: request.headers.get("X-ANQR-Skip-Cache") === "1",
  };
}
