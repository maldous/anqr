// Render-permutation safety net (E-R3 / S1).
//
// For a representative grid of (module style × dither family × animation
// pattern) the editor must render a non-empty QR canvas without errors.
// This catches the class of bugs where a render-pipeline change breaks
// scannability for some style combination but doesn't surface on the
// default settings the basic.web spec covers.
//
// Asserts: canvas exists with non-zero dimensions, no
// "anqr:render-error" custom event fires, and the canvas.toDataURL
// hash matches the committed baseline (when ANQR_SNAPSHOT_PERMUTATIONS=1
// is set). The hash assertion is opt-in until we've measured pixel
// stability across the CI matrix — by default the test only asserts
// "renders SOMETHING non-empty"; with the env var on, drift triggers a
// failure with both hashes in the message.
//
// To bake/refresh baselines on a known-clean run:
//   ANQR_SNAPSHOT_PERMUTATIONS=record npx playwright test --project permutations
// On rerun:
//   ANQR_SNAPSHOT_PERMUTATIONS=1 npx playwright test --project permutations
//
// Matches the existing `permutations` Playwright project pattern.
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";

// ESM equivalent of __dirname — Playwright runs this spec under ESM and
// the bare __dirname is undefined there. Compute from import.meta.url.
const __filename_ = fileURLToPath(import.meta.url);
const __dirname_ = dirname(__filename_);
const SNAPSHOT_DIR = join(__dirname_, "__snapshots__", "permutations");
const SNAPSHOT_MODE = process.env.ANQR_SNAPSHOT_PERMUTATIONS ?? "off";

const WELCOME_VERSION = "2026.05.24.2";

async function bootstrap(page: import("@playwright/test").Page) {
  await page.addInitScript((version: string) => {
    localStorage.setItem("anqr-welcome-seen", version);
    localStorage.setItem("anqr-language", "en-GB");
  }, WELCOME_VERSION);
  await page.addInitScript(() => {
    document.addEventListener("anqr:render-complete", () => {
      (globalThis as unknown as Record<string, unknown>).__anqrRendered = true;
    });
    document.addEventListener("anqr:render-error", (e) => {
      (globalThis as unknown as Record<string, unknown>).__anqrRenderError =
        (e as CustomEvent).detail ?? "render-error";
    });
  });
}

async function waitForRender(page: import("@playwright/test").Page) {
  await page.waitForFunction(
    () => {
      const rec = globalThis as unknown as Record<string, unknown>;
      if (rec.__anqrRendered) return true;
      const canvas = document.querySelector(
        '[data-testid="qr-preview"] canvas',
      ) as HTMLCanvasElement | null;
      return canvas !== null && canvas.width > 0 && canvas.height > 0;
    },
    { timeout: 20_000 },
  );
}

interface StoreLike {
  setModuleStyle?: (s: string) => void;
  setOverlayDitherKernel?: (s: string) => void;
  setAnimationPattern?: (s: string) => void;
  setTier?: (s: string) => void;
}

async function applyCombo(
  page: import("@playwright/test").Page,
  combo: { moduleStyle: string; ditherKernel: string; animPattern: string },
) {
  await page.evaluate((c) => {
    const w = globalThis as unknown as { __anqrRendered?: boolean; useQRStore?: { getState(): StoreLike } };
    w.__anqrRendered = false;
    const store = w.useQRStore?.getState?.();
    if (!store) return;
    store.setTier?.("professional");
    store.setModuleStyle?.(c.moduleStyle);
    store.setOverlayDitherKernel?.(c.ditherKernel);
    store.setAnimationPattern?.(c.animPattern);
  }, combo);
}

const MODULE_STYLES = ["square", "rounded", "dots", "diamond", "connected"];
const DITHER_KERNELS = ["floyd_steinberg", "jarvis", "atkinson", "burkes"];
// "none" intentionally excluded — already covered by the static grid
// below. Start from the first real animated pattern.
const ANIMATION_PATTERNS = ["pulse", "wave", "scanline", "shimmer", "drift"];

// Pick a representative slice: every module style × the 4 dither
// families paired with anim=none. Plus one entry per real animation
// pattern, each on a different (module, dither) so we exercise the
// animation surface without duplicating any combo.
const COMBOS: Array<{ moduleStyle: string; ditherKernel: string; animPattern: string }> = [];
for (const ms of MODULE_STYLES) {
  for (const dk of DITHER_KERNELS) {
    COMBOS.push({ moduleStyle: ms, ditherKernel: dk, animPattern: "none" });
  }
}
for (let i = 0; i < ANIMATION_PATTERNS.length; i++) {
  COMBOS.push({
    moduleStyle: MODULE_STYLES[i % MODULE_STYLES.length],
    ditherKernel: DITHER_KERNELS[i % DITHER_KERNELS.length],
    animPattern: ANIMATION_PATTERNS[i],
  });
}

test.describe("Render permutations", () => {
  for (const combo of COMBOS) {
    const label = `${combo.moduleStyle}+${combo.ditherKernel}+${combo.animPattern}`;
    test(`renders a non-empty QR canvas: ${label}`, async ({ page }) => {
      await bootstrap(page);
      await page.goto("/");

      // Wait for the store to land on window — the app exposes it for
      // debugging and the welcome-modal flow uses it. If the global
      // isn't there (build trimmed it), skip cleanly — better than a
      // silent pass.
      const hasStore = await page.evaluate(
        () => typeof (globalThis as unknown as { useQRStore?: unknown }).useQRStore === "function",
      );
      if (!hasStore) {
        test.skip();
        return;
      }

      await applyCombo(page, combo);
      await waitForRender(page);

      const renderError = await page.evaluate(
        () => (globalThis as unknown as { __anqrRenderError?: string }).__anqrRenderError,
      );
      expect(renderError, `render-error event fired for ${label}`).toBeFalsy();

      const dims = await page.evaluate(() => {
        const c = document.querySelector(
          '[data-testid="qr-preview"] canvas',
        ) as HTMLCanvasElement | null;
        return c ? { w: c.width, h: c.height } : null;
      });
      expect(dims, `canvas missing for ${label}`).not.toBeNull();
      expect(dims?.w ?? 0).toBeGreaterThan(0);
      expect(dims?.h ?? 0).toBeGreaterThan(0);

      // Snapshot comparison (opt-in via ANQR_SNAPSHOT_PERMUTATIONS).
      // `off` skips the hash assertion entirely (default — keeps CI
      //   stable across machines until baselines are agreed).
      // `record` writes the current hash to the baseline file.
      // anything else (e.g. `1`) compares against the existing baseline
      //   and fails on drift.
      if (SNAPSHOT_MODE === "off") return;

      const dataUrl = await page.evaluate(() => {
        const c = document.querySelector(
          '[data-testid="qr-preview"] canvas',
        ) as HTMLCanvasElement | null;
        return c ? c.toDataURL("image/png") : null;
      });
      expect(dataUrl).not.toBeNull();
      const hash = createHash("sha256").update(dataUrl ?? "").digest("hex");

      const safeLabel = label.replace(/[^a-zA-Z0-9_+-]/g, "_");
      const baselinePath = join(SNAPSHOT_DIR, `${safeLabel}.sha256.txt`);
      if (SNAPSHOT_MODE === "record") {
        mkdirSync(dirname(baselinePath), { recursive: true });
        writeFileSync(baselinePath, `${hash}\n`, "utf8");
        return;
      }
      if (!existsSync(baselinePath)) {
        throw new Error(
          `Missing baseline for ${label}. Run with ANQR_SNAPSHOT_PERMUTATIONS=record to bake.`,
        );
      }
      const baseline = readFileSync(baselinePath, "utf8").trim();
      expect(hash, `visual drift detected for ${label}`).toBe(baseline);
    });
  }
});
