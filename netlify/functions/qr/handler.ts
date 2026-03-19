import * as Sentry from "@sentry/node";
import { acquireAnimatedRenderLock } from "@/platform/node/server/acquire-animated-render-lock";
import { shouldSerializeAnimatedRender } from "@/platform/node/server/should-serialize-animated-render";
import { CORS_HEADERS } from "./cors-headers.const";
import { parseHandlerParams } from "./parse-handler-params";
import { validateParsedParams } from "./validate-parsed-params";
import { processQRRequest } from "./process-qr-request";

export async function handler(request: Request) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const url = new URL(request.url);
  const params = url.searchParams;
  const p = parseHandlerParams(params, request);

  const validationError = validateParsedParams(p);
  if (validationError) return validationError;

  const serializeAnimatedRender = shouldSerializeAnimatedRender(params);
  let releaseAnimatedRenderLock: (() => void) | null = null;

  try {
    if (serializeAnimatedRender) {
      releaseAnimatedRenderLock = await acquireAnimatedRenderLock();
    }

    return await processQRRequest(p, params, request.url);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    Sentry.captureException(error);
    return new Response(`Error generating QR code: ${message}`, {
      status: 500,
      headers: CORS_HEADERS,
    });
  } finally {
    if (releaseAnimatedRenderLock) {
      releaseAnimatedRenderLock();
    }
  }
}
