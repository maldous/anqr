import * as Sentry from "@sentry/node";
import pkg from "../../../package.json";
import { createCanvas, ImageData as NapiImageData } from "@napi-rs/canvas";
import type { BootstrapOptions } from "./bootstrap-node-render-runtime.types";

export function bootstrapNodeRenderRuntime(options: BootstrapOptions = {}): void {
  const sentryDsn = options.sentryDsn;
  if (sentryDsn) {
    Sentry.init({
      dsn: sentryDsn,
      sendDefaultPii: true,
      release: `anqr@${pkg.version}`,
      tracesSampleRate: 0.1,
      environment:
        options.environment ||
        process.env.SENTRY_ENVIRONMENT ||
        process.env.NODE_ENV ||
        "production",
      // Strip @sentry/node's OpenTelemetry auto-instrumentation suite. We
      // don't use mongodb/kafkajs/pg/mysql/redis/etc., but the default
      // integrations bundle wrappers for all of them — ~10 MB per function
      // zip and a require-in-the-middle shim that wraps `require` on cold
      // start. We keep the handful we actually need below. See
      // review-2026-05-24 C-F2.
      defaultIntegrations: false,
      integrations: [
        Sentry.httpIntegration(),
        Sentry.onUncaughtExceptionIntegration(),
        Sentry.onUnhandledRejectionIntegration(),
        Sentry.linkedErrorsIntegration(),
        Sentry.functionToStringIntegration(),
        Sentry.contextLinesIntegration(),
        Sentry.nativeNodeFetchIntegration(),
      ],
    });
  }

  if (globalThis.ImageData === undefined) {
    (globalThis as Record<string, unknown>).ImageData = NapiImageData;
  }
  if ((globalThis as Record<string, unknown>).HTMLCanvasElement === undefined) {
    (globalThis as Record<string, unknown>).HTMLCanvasElement = createCanvas(1, 1).constructor;
  }
  if ((globalThis as Record<string, unknown>).OffscreenCanvas === undefined) {
    (globalThis as Record<string, unknown>).OffscreenCanvas = (
      globalThis as Record<string, unknown>
    ).HTMLCanvasElement;
  }
}
