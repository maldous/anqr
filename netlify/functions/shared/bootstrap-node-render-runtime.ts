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
