// Render perf budget (L9 / E-R13).
//
// Mirrors the encode bench (qr-encode.bench.ts): tinybench-via-vitest
// records timings on the server-side render path so CI catches O(n²)
// regressions on hot paths that correctness tests alone won't notice.
//
// Uses renderBasicServerQROutput because it's the cheapest end-to-end
// surface (no animation, no overlay) that still exercises the full
// encode → matrix-traversal → canvas-blit pipeline.
import { bench, describe } from "vitest";
import { nodeCanvasFactory } from "@/platform/node/server";
import { renderBasicServerQROutput } from "./render-basic-server-qr-output.service";

const factory = nodeCanvasFactory as unknown as Parameters<
  typeof renderBasicServerQROutput
>[1];

describe("render perf · server PNG", () => {
  bench(
    "renderBasicServerQROutput · short URL · 400px · ECC=M",
    async () => {
      await renderBasicServerQROutput(
        { data: "https://anqr.link", size: 400, errorCorrection: "M" },
        factory,
      );
    },
    { iterations: 30, time: 1000 },
  );

  bench(
    "renderBasicServerQROutput · long URL · 800px · ECC=H",
    async () => {
      await renderBasicServerQROutput(
        {
          data: "https://example.com/some/very/long/path?query=1&extra=2",
          size: 800,
          errorCorrection: "H",
        },
        factory,
      );
    },
    { iterations: 20, time: 1500 },
  );

  bench(
    "renderBasicServerQROutput · short URL · SVG · ECC=L",
    async () => {
      await renderBasicServerQROutput(
        { data: "https://anqr.link", errorCorrection: "L", format: "svg" },
        factory,
      );
    },
    { iterations: 50, time: 500 },
  );
});
