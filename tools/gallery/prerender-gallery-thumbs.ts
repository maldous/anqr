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
import { chromium, type Browser, type Page } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generatedGallerySections } from "../../apps/web/src/content/generated/gallery-showcase.generated";
import { buildGallerySearchParams } from "../../apps/web/src/content/gallery/build-gallery-search-params";
import type { GalleryItem } from "../../apps/web/src/content/gallery/gallery-items.types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const OUTPUT_DIR = path.join(REPO_ROOT, "public/gallery");

const BASE_URL = process.env.PRERENDER_BASE_URL ?? "http://localhost:4173";
const CONCURRENCY = Number(process.env.PRERENDER_CONCURRENCY ?? "4");
const FORCE = process.env.PRERENDER_FORCE === "1";
const ONLY = process.env.PRERENDER_ONLY?.split(",").map((s) => s.trim()).filter(Boolean);
const WELCOME_VERSION = "2026.05.24";

function collectItems(): GalleryItem[] {
  const items: GalleryItem[] = [];
  for (const section of generatedGallerySections as unknown as Array<{ items: GalleryItem[] }>) {
    for (const item of section.items) items.push(item);
  }
  return ONLY ? items.filter((it) => ONLY.includes(it.id)) : items;
}

function buildItemUrl(item: GalleryItem): string {
  const params = buildGallerySearchParams(item);
  return `${BASE_URL}/?${params.toString()}`;
}

async function ensurePreviewReachable(): Promise<void> {
  try {
    const res = await fetch(BASE_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (e) {
    console.error(
      `[prerender] Preview server not reachable at ${BASE_URL}. ` +
        `Start it with 'npm run preview' in another shell. (${String(e)})`,
    );
    process.exit(1);
  }
}

async function prerenderOne(
  browser: Browser,
  item: GalleryItem,
): Promise<{ id: string; ok?: boolean; skipped?: boolean; error?: string }> {
  const outputPath = path.join(OUTPUT_DIR, `${item.id}.png`);
  if (!FORCE) {
    try {
      await fs.access(outputPath);
      return { id: item.id, skipped: true };
    } catch {
      /* file missing, render it */
    }
  }

  const context = await browser.newContext({
    viewport: { width: 1280, height: 1024 },
  });
  await context.addInitScript((version: string) => {
    localStorage.setItem("anqr-welcome-seen", version);
  }, WELCOME_VERSION);
  await context.addInitScript(() => {
    document.addEventListener("anqr:render-complete", () => {
      (window as unknown as Record<string, unknown>).__anqrRendered = true;
    });
  });

  const page: Page = await context.newPage();
  try {
    await page.goto(buildItemUrl(item), { waitUntil: "domcontentloaded", timeout: 30_000 });
    await page.waitForFunction(
      () => {
        const w = window as unknown as Record<string, unknown>;
        if (w.__anqrRendered) return true;
        const c = document.querySelector(
          '[data-testid="qr-preview"] canvas',
        ) as HTMLCanvasElement | null;
        return c !== null && c.width > 0;
      },
      { timeout: 30_000 },
    );
    // A small settle pause so any post-render redraw lands before screenshot.
    await page.waitForTimeout(250);
    const canvas = page.locator('[data-testid="qr-preview"] canvas');
    const buffer = await canvas.screenshot({ omitBackground: false });
    await fs.writeFile(outputPath, buffer);
    return { id: item.id, ok: true };
  } catch (e) {
    return { id: item.id, error: String(e).split("\n")[0].slice(0, 200) };
  } finally {
    await context.close();
  }
}

async function main(): Promise<void> {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await ensurePreviewReachable();

  const items = collectItems();
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
      const result = await prerenderOne(browser, item);
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
