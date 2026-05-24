import type { Browser, Page } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import type { GalleryItem } from "../../apps/web/src/content/gallery/gallery-items.types";
import { buildItemUrl } from "./build-item-url";

export async function prerenderOne(
  browser: Browser,
  item: GalleryItem,
  outputDir: string,
  baseUrl: string,
  welcomeVersion: string,
  force: boolean,
): Promise<{ id: string; ok?: boolean; skipped?: boolean; error?: string }> {
  const outputPath = path.join(outputDir, `${item.id}.png`);
  if (!force) {
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
  }, welcomeVersion);
  await context.addInitScript(() => {
    document.addEventListener("anqr:render-complete", () => {
      (window as unknown as Record<string, unknown>).__anqrRendered = true;
    });
  });

  const page: Page = await context.newPage();
  try {
    await page.goto(buildItemUrl(item, baseUrl), { waitUntil: "domcontentloaded", timeout: 30_000 });
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
