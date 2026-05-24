/**
 * Prerender gallery thumbnails using the client renderer.
 *
 * For every item in `gallery-showcase.generated.ts`, launches a headless
 * Chromium tab against a local preview server, waits for the canvas to
 * finish drawing, and screenshots `[data-testid="qr-preview"] canvas` to
 * `public/gallery/<id>.png`.
 *
 * This guarantees the gallery thumbnail is byte-for-byte the same renderer
 * the user sees when they click into the generator. No more dynamic /api/qr
 * 504s, and no more brown-finder-vs-black-finder surprises.
 *
 * Usage:
 *   npm run preview            # start preview on :4173 in another shell
 *   npx tsx tools/gallery/prerender-gallery-thumbs.ts
 *
 * Env vars:
 *   PRERENDER_BASE_URL    default http://localhost:4173
 *   PRERENDER_CONCURRENCY default 4
 *   PRERENDER_FORCE       set to "1" to re-render existing files
 *   PRERENDER_ONLY        comma-separated item id filter (for debugging)
 */
import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { collectItems } from "./collect-items";
import { ensurePreviewReachable } from "./ensure-preview-reachable";
import { prerenderOne } from "./prerender-one";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const OUTPUT_DIR = path.join(REPO_ROOT, "public/gallery");

const BASE_URL = process.env.PRERENDER_BASE_URL ?? "http://localhost:4173";
const CONCURRENCY = Number(process.env.PRERENDER_CONCURRENCY ?? "4");
const FORCE = process.env.PRERENDER_FORCE === "1";
const ONLY = process.env.PRERENDER_ONLY?.split(",").map((s) => s.trim()).filter(Boolean);
const WELCOME_VERSION = "2026.05.24";

async function main(): Promise<void> {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await ensurePreviewReachable(BASE_URL);

  const items = collectItems(ONLY);
  console.log(
    `[prerender] ${items.length} items | concurrency=${CONCURRENCY} | force=${FORCE} | output=${OUTPUT_DIR}`,
  );

  const browser = await chromium.launch();
  const queue = [...items];
  const total = items.length;
  let done = 0;
  let ok = 0;
  let skipped = 0;
  let errors = 0;

  async function worker(): Promise<void> {
    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) return;
      const result = await prerenderOne(browser, item, OUTPUT_DIR, BASE_URL, WELCOME_VERSION, FORCE);
      done += 1;
      if (result.skipped) skipped += 1;
      else if (result.ok) ok += 1;
      else errors += 1;
      const status = result.skipped
        ? "skip"
        : result.ok
          ? "ok  "
          : `ERR ${result.error ?? ""}`;
      console.log(`[${String(done).padStart(3, " ")}/${total}] ${status}  ${item.id}`);
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
  await browser.close();

  console.log(`[prerender] done. total=${total} ok=${ok} skipped=${skipped} errors=${errors}`);
  if (errors > 0) process.exit(1);
}

main().catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});
