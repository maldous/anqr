import type { ParsedHandlerParams } from "./parsed-handler-params.types";
import { parseCoreQRParams } from "./parse-core-qr-params";
import { parseStylingParams } from "./parse-styling-params";
import { parseProtectionParams } from "./parse-protection-params";
import { parseOverlayParams } from "./parse-overlay-params";
import { parseDitherParams } from "./parse-dither-params";
import { parseOutputParams } from "./parse-output-params";
import { parseAnimationParams } from "./parse-animation-params";

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
