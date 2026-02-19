
import {createRequire as ___nfyCreateRequire} from "module";
import {fileURLToPath as ___nfyFileURLToPath} from "url";
import {dirname as ___nfyPathDirname} from "path";
let __filename=___nfyFileURLToPath(import.meta.url);
let __dirname=___nfyPathDirname(___nfyFileURLToPath(import.meta.url));
let require=___nfyCreateRequire(import.meta.url);


// netlify/functions/qr-render-background.ts
import * as Sentry from "@sentry/node";

// package.json
var package_default = {
  name: "anqr",
  version: "1.0.66",
  description: "These are my existing files for ANQR:",
  scripts: {
    dev: "vite",
    build: "tsc && vite build",
    preview: "vite preview",
    typecheck: "tsc --noEmit",
    test: "playwright test",
    "test:basic": "playwright test --project=basic",
    "test:advanced": "playwright test --project=advanced",
    "test:professional": "playwright test --project=professional",
    "test:permutations": "playwright test --project=permutations",
    "test:ui": "playwright test --ui",
    "test:report": "playwright show-report",
    "test:unit": "ANQR_LOG_LEVEL=error vitest run --maxWorkers=100% --exclude 'tests/unit/gallery-scan-matrix.spec.ts' --exclude 'tests/unit/overlay-preservation-mode-audit.spec.ts'",
    "test:unit:coverage": "ANQR_LOG_LEVEL=error vitest run --maxWorkers=100% --coverage --exclude 'tests/unit/gallery-scan-matrix.spec.ts' --exclude 'tests/unit/overlay-preservation-mode-audit.spec.ts' --exclude 'tests/unit/qr-generator-dithered-scan-gate.spec.ts'",
    "test:coverage:gap": "node scripts/report-code-coverage-gap.js",
    "test:unit:watch": "vitest",
    "test:unit:ci": "npm run test:unit",
    "test:ids": "node scripts/generate-test-ids.js",
    "test:required": "node scripts/generate-required-tests.js",
    "test:required:strict": "node scripts/check-required-tests.js",
    "test:required:gap": "node scripts/report-required-gap.js",
    "test:testid": "node scripts/audit-testid-coverage.js",
    "test:testid:refs": "node scripts/check-testid-references.js",
    "test:i18n": "node scripts/check-i18n-regressions.js",
    "test:bundle:budget": "node scripts/check-bundle-budgets.mjs",
    "report:payload:matrix": "node scripts/generate-payload-matrix.mjs",
    "validate:services": "node scripts/validate-third-party.mjs",
    "check:sentry": "node scripts/check-sentry-regression.mjs",
    "report:i18n:txt": "node scripts/check-i18n-txt.js",
    "qr:art": "npx tsx scripts/run-qr-art.ts",
    "test:signoff": "node scripts/production-signoff-check.js"
  },
  repository: {
    type: "git",
    url: "git@github-private:maldous/anqr.git"
  },
  keywords: [],
  author: "",
  license: "ISC",
  type: "module",
  dependencies: {
    "@capacitor-community/admob": "^8.0.0",
    "@capacitor/android": "^8.0.2",
    "@capacitor/camera": "^8.0.0",
    "@capacitor/core": "^8.0.2",
    "@capacitor/filesystem": "^8.1.0",
    "@capacitor/splash-screen": "^8.0.0",
    "@napi-rs/canvas": "^0.1.90",
    "@netlify/blobs": "^10.7.0",
    "@netlify/functions": "^5.1.2",
    "@radix-ui/react-accordion": "^1.2.12",
    "@radix-ui/react-label": "^2.1.8",
    "@radix-ui/react-popover": "^1.1.15",
    "@radix-ui/react-select": "^2.2.6",
    "@radix-ui/react-slider": "^1.3.6",
    "@radix-ui/react-slot": "^1.2.4",
    "@radix-ui/react-switch": "^1.2.6",
    "@radix-ui/react-tabs": "^1.1.13",
    "@radix-ui/react-tooltip": "^1.2.8",
    "@sentry/node": "^10.38.0",
    "@sentry/react": "^10.38.0",
    "class-variance-authority": "^0.7.1",
    clsx: "^2.1.1",
    "date-fns": "^4.1.0",
    gifenc: "^1.0.3",
    "gifuct-js": "^2.1.2",
    i18next: "^25.8.4",
    "i18next-browser-languagedetector": "^8.2.0",
    lefthook: "^2.1.1",
    loglevel: "^1.9.2",
    "loglevel-plugin-prefix": "^0.8.4",
    "lucide-react": "^0.563.0",
    "open-location-code": "^1.0.3",
    react: "^19.2.4",
    "react-day-picker": "^9.13.1",
    "react-dom": "^19.2.4",
    "react-i18next": "^16.5.4",
    "tailwind-merge": "^3.4.0",
    zustand: "^5.0.11"
  },
  overrides: {
    tar: ">=7.5.8",
    qs: ">=6.14.2",
    ajv: ">=8.18.0"
  },
  devDependencies: {
    "@biomejs/biome": "^2.3.14",
    "@capacitor/cli": "^8.0.2",
    "@commitlint/cli": "^20.4.1",
    "@commitlint/config-conventional": "^20.4.1",
    "@playwright/test": "^1.58.2",
    "@sentry/vite-plugin": "^4.9.0",
    "@tailwindcss/postcss": "^4.1.18",
    "@types/open-location-code": "^1.0.1",
    "@types/react": "^19.2.13",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^5.1.3",
    "@vitest/coverage-v8": "^4.0.18",
    autoprefixer: "^10.4.24",
    cspell: "^9.6.4",
    "dependency-cruiser": "^17.3.7",
    "happy-dom": "^20.5.0",
    jscpd: "^4.0.8",
    jsdom: "^28.0.0",
    knip: "^5.83.1",
    "license-checker": "^25.0.1",
    "lint-staged": "^16.2.7",
    "lockfile-lint": "^5.0.0",
    "netlify-cli": "^23.15.1",
    postcss: "^8.5.6",
    puppeteer: "^24.37.2",
    "rollup-plugin-visualizer": "^6.0.5",
    serve: "^14.2.5",
    sharp: "^0.34.5",
    tailwindcss: "^4.1.18",
    terser: "^5.46.0",
    "type-coverage": "^2.29.7",
    typescript: "^5.9.3",
    vite: "^7.3.1",
    "vite-plugin-compression": "^0.5.1",
    "vite-plugin-pwa": "^1.2.0",
    vitest: "^4.0.18"
  }
};

// netlify/functions/qr-render-background.ts
Sentry.init({
  dsn: "https://6935e811c47169e037e31209f2d46fbd@o4510808522489856.ingest.us.sentry.io/4510808547917824",
  release: `anqr@${package_default.version}`,
  tracesSampleRate: 0.1,
  environment: "production"
});
var FETCH_TIMEOUT_MS = 6e5;
async function handler(request) {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }
  try {
    const body = await request.json();
    const targetUrl = body?.url;
    if (!targetUrl) {
      return new Response('Missing "url" in request body', { status: 400 });
    }
    const allowedOrigins = [
      process.env.URL,
      process.env.DEPLOY_PRIME_URL,
      "https://anqr.link",
      ...process.env.NETLIFY_DEV ? ["http://localhost:8888"] : []
    ].filter(Boolean);
    const isAllowed = allowedOrigins.some((origin) => targetUrl.startsWith(origin));
    if (!isAllowed) {
      return new Response("Target URL not allowed", { status: 403 });
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const response = await fetch(targetUrl, {
      signal: controller.signal,
      headers: { "User-Agent": "ANQR-Background-Render/1.0" }
    });
    clearTimeout(timeoutId);
    await response.arrayBuffer();
    return new Response(
      JSON.stringify({
        status: response.ok ? "complete" : "error",
        httpStatus: response.status
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    Sentry.captureException(error);
    await Sentry.flush(2e3);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ status: "error", message }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
}
var qr_render_background_default = handler;
export {
  qr_render_background_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibmV0bGlmeS9mdW5jdGlvbnMvcXItcmVuZGVyLWJhY2tncm91bmQudHMiLCAicGFja2FnZS5qc29uIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvKipcbiAqIE5ldGxpZnkgQmFja2dyb3VuZCBGdW5jdGlvbjogUVIgQ29kZSBCYWNrZ3JvdW5kIFJlbmRlcmVyXG4gKlxuICogUHJveHkgZnVuY3Rpb24gdGhhdCB0cmlnZ2VycyBmdWxsIG92ZXJsYXkgcmVuZGVyaW5nIGluIHRoZSBtYWluIHFyIGZ1bmN0aW9uLlxuICogQ2FsbGVkIGJ5IHRoZSBtYWluIHFyIGZ1bmN0aW9uIHdoZW4gYW4gb3ZlcmxheSByZXF1ZXN0IGlzIGRlZ3JhZGVkIChyZXR1cm5lZFxuICogd2l0aG91dCBvdmVybGF5IGZvciBzcGVlZCkuIFRoaXMgZnVuY3Rpb24gZmV0Y2hlcyB0aGUgZnVsbCByZW5kZXIgVVJMLCB3aGljaFxuICogY2F1c2VzIHRoZSBtYWluIHFyIGZ1bmN0aW9uIHRvIGdlbmVyYXRlIHRoZSBjb21wbGV0ZSBvdmVybGF5IHZlcnNpb24gYW5kXG4gKiBjYWNoZSBpdCBpbiBOZXRsaWZ5IEJsb2JzIGZvciBzdWJzZXF1ZW50IHJlcXVlc3RzLlxuICpcbiAqIEJhY2tncm91bmQgZnVuY3Rpb24gKHZpYSBgLWJhY2tncm91bmRgIGZpbGVuYW1lIHN1ZmZpeCk6IE5ldGxpZnkgcmV0dXJuc1xuICogMjAyIEFjY2VwdGVkIGltbWVkaWF0ZWx5IHRvIGNhbGxlcnM7IHRoZSBoYW5kbGVyJ3MgUmVzcG9uc2UgaXMgZGlzY2FyZGVkLlxuICogR2V0cyB1cCB0byAxNSBtaW51dGVzIG9mIGV4ZWN1dGlvbiB0aW1lLlxuICovXG5cbmltcG9ydCAqIGFzIFNlbnRyeSBmcm9tICdAc2VudHJ5L25vZGUnO1xuLy8gQHRzLWV4cGVjdC1lcnJvciAtIEpTT04gaW1wb3J0IHJlc29sdmVkIGJ5IGVzYnVpbGQgYXQgYnVuZGxlIHRpbWVcbmltcG9ydCBwa2cgZnJvbSAnLi4vLi4vcGFja2FnZS5qc29uJztcblxuU2VudHJ5LmluaXQoe1xuICBkc246ICdodHRwczovLzY5MzVlODExYzQ3MTY5ZTAzN2UzMTIwOWYyZDQ2ZmJkQG80NTEwODA4NTIyNDg5ODU2LmluZ2VzdC51cy5zZW50cnkuaW8vNDUxMDgwODU0NzkxNzgyNCcsXG4gIHJlbGVhc2U6IGBhbnFyQCR7cGtnLnZlcnNpb259YCxcbiAgdHJhY2VzU2FtcGxlUmF0ZTogMC4xLFxuICBlbnZpcm9ubWVudDogJ3Byb2R1Y3Rpb24nLFxufSk7XG5cbmNvbnN0IEZFVENIX1RJTUVPVVRfTVMgPSA2MDBfMDAwO1xuXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVyKHJlcXVlc3Q6IFJlcXVlc3QpIHtcbiAgaWYgKHJlcXVlc3QubWV0aG9kICE9PSAnUE9TVCcpIHtcbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKCdNZXRob2Qgbm90IGFsbG93ZWQnLCB7IHN0YXR1czogNDA1IH0pO1xuICB9XG5cbiAgdHJ5IHtcbiAgICBjb25zdCBib2R5ID0gKGF3YWl0IHJlcXVlc3QuanNvbigpKSBhcyB7IHVybD86IHN0cmluZyB9O1xuICAgIGNvbnN0IHRhcmdldFVybCA9IGJvZHk/LnVybDtcblxuICAgIGlmICghdGFyZ2V0VXJsKSB7XG4gICAgICByZXR1cm4gbmV3IFJlc3BvbnNlKCdNaXNzaW5nIFwidXJsXCIgaW4gcmVxdWVzdCBib2R5JywgeyBzdGF0dXM6IDQwMCB9KTtcbiAgICB9XG5cbiAgICAvLyBTU1JGIHByb3RlY3Rpb246IG9ubHkgYWxsb3cgZmV0Y2hpbmcgb3VyIG93biBRUiBmdW5jdGlvblxuICAgIGNvbnN0IGFsbG93ZWRPcmlnaW5zID0gW1xuICAgICAgcHJvY2Vzcy5lbnYuVVJMLFxuICAgICAgcHJvY2Vzcy5lbnYuREVQTE9ZX1BSSU1FX1VSTCxcbiAgICAgICdodHRwczovL2FucXIubGluaycsXG4gICAgICAuLi4ocHJvY2Vzcy5lbnYuTkVUTElGWV9ERVYgPyBbJ2h0dHA6Ly9sb2NhbGhvc3Q6ODg4OCddIDogW10pLFxuICAgIF0uZmlsdGVyKEJvb2xlYW4pO1xuICAgIGNvbnN0IGlzQWxsb3dlZCA9IGFsbG93ZWRPcmlnaW5zLnNvbWUoKG9yaWdpbikgPT4gdGFyZ2V0VXJsLnN0YXJ0c1dpdGgob3JpZ2luIGFzIHN0cmluZykpO1xuICAgIGlmICghaXNBbGxvd2VkKSB7XG4gICAgICByZXR1cm4gbmV3IFJlc3BvbnNlKCdUYXJnZXQgVVJMIG5vdCBhbGxvd2VkJywgeyBzdGF0dXM6IDQwMyB9KTtcbiAgICB9XG5cbiAgICBjb25zdCBjb250cm9sbGVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgIGNvbnN0IHRpbWVvdXRJZCA9IHNldFRpbWVvdXQoKCkgPT4gY29udHJvbGxlci5hYm9ydCgpLCBGRVRDSF9USU1FT1VUX01TKTtcblxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godGFyZ2V0VXJsLCB7XG4gICAgICBzaWduYWw6IGNvbnRyb2xsZXIuc2lnbmFsLFxuICAgICAgaGVhZGVyczogeyAnVXNlci1BZ2VudCc6ICdBTlFSLUJhY2tncm91bmQtUmVuZGVyLzEuMCcgfSxcbiAgICB9KTtcblxuICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuXG4gICAgLy8gRHJhaW4gcmVzcG9uc2UgYm9keSB0byByZWxlYXNlIG1lbW9yeSAodGhlIGZldGNoIHBvcHVsYXRlcyB0aGUgYmxvYiBjYWNoZSBhcyBhIHNpZGUgZWZmZWN0KVxuICAgIGF3YWl0IHJlc3BvbnNlLmFycmF5QnVmZmVyKCk7XG5cbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKFxuICAgICAgSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICBzdGF0dXM6IHJlc3BvbnNlLm9rID8gJ2NvbXBsZXRlJyA6ICdlcnJvcicsXG4gICAgICAgIGh0dHBTdGF0dXM6IHJlc3BvbnNlLnN0YXR1cyxcbiAgICAgIH0pLFxuICAgICAge1xuICAgICAgICBzdGF0dXM6IDIwMCxcbiAgICAgICAgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgICB9XG4gICAgKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBTZW50cnkuY2FwdHVyZUV4Y2VwdGlvbihlcnJvcik7XG4gICAgYXdhaXQgU2VudHJ5LmZsdXNoKDIwMDApO1xuICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdVbmtub3duIGVycm9yJztcbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKEpTT04uc3RyaW5naWZ5KHsgc3RhdHVzOiAnZXJyb3InLCBtZXNzYWdlIH0pLCB7XG4gICAgICBzdGF0dXM6IDIwMCxcbiAgICAgIGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxuICAgIH0pO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGhhbmRsZXI7XG4iLCAie1xuICBcIm5hbWVcIjogXCJhbnFyXCIsXG4gIFwidmVyc2lvblwiOiBcIjEuMC42NlwiLFxuICBcImRlc2NyaXB0aW9uXCI6IFwiVGhlc2UgYXJlIG15IGV4aXN0aW5nIGZpbGVzIGZvciBBTlFSOlwiLFxuICBcInNjcmlwdHNcIjoge1xuICAgIFwiZGV2XCI6IFwidml0ZVwiLFxuICAgIFwiYnVpbGRcIjogXCJ0c2MgJiYgdml0ZSBidWlsZFwiLFxuICAgIFwicHJldmlld1wiOiBcInZpdGUgcHJldmlld1wiLFxuICAgIFwidHlwZWNoZWNrXCI6IFwidHNjIC0tbm9FbWl0XCIsXG4gICAgXCJ0ZXN0XCI6IFwicGxheXdyaWdodCB0ZXN0XCIsXG4gICAgXCJ0ZXN0OmJhc2ljXCI6IFwicGxheXdyaWdodCB0ZXN0IC0tcHJvamVjdD1iYXNpY1wiLFxuICAgIFwidGVzdDphZHZhbmNlZFwiOiBcInBsYXl3cmlnaHQgdGVzdCAtLXByb2plY3Q9YWR2YW5jZWRcIixcbiAgICBcInRlc3Q6cHJvZmVzc2lvbmFsXCI6IFwicGxheXdyaWdodCB0ZXN0IC0tcHJvamVjdD1wcm9mZXNzaW9uYWxcIixcbiAgICBcInRlc3Q6cGVybXV0YXRpb25zXCI6IFwicGxheXdyaWdodCB0ZXN0IC0tcHJvamVjdD1wZXJtdXRhdGlvbnNcIixcbiAgICBcInRlc3Q6dWlcIjogXCJwbGF5d3JpZ2h0IHRlc3QgLS11aVwiLFxuICAgIFwidGVzdDpyZXBvcnRcIjogXCJwbGF5d3JpZ2h0IHNob3ctcmVwb3J0XCIsXG4gICAgXCJ0ZXN0OnVuaXRcIjogXCJBTlFSX0xPR19MRVZFTD1lcnJvciB2aXRlc3QgcnVuIC0tbWF4V29ya2Vycz0xMDAlIC0tZXhjbHVkZSAndGVzdHMvdW5pdC9nYWxsZXJ5LXNjYW4tbWF0cml4LnNwZWMudHMnIC0tZXhjbHVkZSAndGVzdHMvdW5pdC9vdmVybGF5LXByZXNlcnZhdGlvbi1tb2RlLWF1ZGl0LnNwZWMudHMnXCIsXG4gICAgXCJ0ZXN0OnVuaXQ6Y292ZXJhZ2VcIjogXCJBTlFSX0xPR19MRVZFTD1lcnJvciB2aXRlc3QgcnVuIC0tbWF4V29ya2Vycz0xMDAlIC0tY292ZXJhZ2UgLS1leGNsdWRlICd0ZXN0cy91bml0L2dhbGxlcnktc2Nhbi1tYXRyaXguc3BlYy50cycgLS1leGNsdWRlICd0ZXN0cy91bml0L292ZXJsYXktcHJlc2VydmF0aW9uLW1vZGUtYXVkaXQuc3BlYy50cycgLS1leGNsdWRlICd0ZXN0cy91bml0L3FyLWdlbmVyYXRvci1kaXRoZXJlZC1zY2FuLWdhdGUuc3BlYy50cydcIixcbiAgICBcInRlc3Q6Y292ZXJhZ2U6Z2FwXCI6IFwibm9kZSBzY3JpcHRzL3JlcG9ydC1jb2RlLWNvdmVyYWdlLWdhcC5qc1wiLFxuICAgIFwidGVzdDp1bml0OndhdGNoXCI6IFwidml0ZXN0XCIsXG4gICAgXCJ0ZXN0OnVuaXQ6Y2lcIjogXCJucG0gcnVuIHRlc3Q6dW5pdFwiLFxuICAgIFwidGVzdDppZHNcIjogXCJub2RlIHNjcmlwdHMvZ2VuZXJhdGUtdGVzdC1pZHMuanNcIixcbiAgICBcInRlc3Q6cmVxdWlyZWRcIjogXCJub2RlIHNjcmlwdHMvZ2VuZXJhdGUtcmVxdWlyZWQtdGVzdHMuanNcIixcbiAgICBcInRlc3Q6cmVxdWlyZWQ6c3RyaWN0XCI6IFwibm9kZSBzY3JpcHRzL2NoZWNrLXJlcXVpcmVkLXRlc3RzLmpzXCIsXG4gICAgXCJ0ZXN0OnJlcXVpcmVkOmdhcFwiOiBcIm5vZGUgc2NyaXB0cy9yZXBvcnQtcmVxdWlyZWQtZ2FwLmpzXCIsXG4gICAgXCJ0ZXN0OnRlc3RpZFwiOiBcIm5vZGUgc2NyaXB0cy9hdWRpdC10ZXN0aWQtY292ZXJhZ2UuanNcIixcbiAgICBcInRlc3Q6dGVzdGlkOnJlZnNcIjogXCJub2RlIHNjcmlwdHMvY2hlY2stdGVzdGlkLXJlZmVyZW5jZXMuanNcIixcbiAgICBcInRlc3Q6aTE4blwiOiBcIm5vZGUgc2NyaXB0cy9jaGVjay1pMThuLXJlZ3Jlc3Npb25zLmpzXCIsXG4gICAgXCJ0ZXN0OmJ1bmRsZTpidWRnZXRcIjogXCJub2RlIHNjcmlwdHMvY2hlY2stYnVuZGxlLWJ1ZGdldHMubWpzXCIsXG4gICAgXCJyZXBvcnQ6cGF5bG9hZDptYXRyaXhcIjogXCJub2RlIHNjcmlwdHMvZ2VuZXJhdGUtcGF5bG9hZC1tYXRyaXgubWpzXCIsXG4gICAgXCJ2YWxpZGF0ZTpzZXJ2aWNlc1wiOiBcIm5vZGUgc2NyaXB0cy92YWxpZGF0ZS10aGlyZC1wYXJ0eS5tanNcIixcbiAgICBcImNoZWNrOnNlbnRyeVwiOiBcIm5vZGUgc2NyaXB0cy9jaGVjay1zZW50cnktcmVncmVzc2lvbi5tanNcIixcbiAgICBcInJlcG9ydDppMThuOnR4dFwiOiBcIm5vZGUgc2NyaXB0cy9jaGVjay1pMThuLXR4dC5qc1wiLFxuICAgIFwicXI6YXJ0XCI6IFwibnB4IHRzeCBzY3JpcHRzL3J1bi1xci1hcnQudHNcIixcbiAgICBcInRlc3Q6c2lnbm9mZlwiOiBcIm5vZGUgc2NyaXB0cy9wcm9kdWN0aW9uLXNpZ25vZmYtY2hlY2suanNcIlxuICB9LFxuICBcInJlcG9zaXRvcnlcIjoge1xuICAgIFwidHlwZVwiOiBcImdpdFwiLFxuICAgIFwidXJsXCI6IFwiZ2l0QGdpdGh1Yi1wcml2YXRlOm1hbGRvdXMvYW5xci5naXRcIlxuICB9LFxuICBcImtleXdvcmRzXCI6IFtdLFxuICBcImF1dGhvclwiOiBcIlwiLFxuICBcImxpY2Vuc2VcIjogXCJJU0NcIixcbiAgXCJ0eXBlXCI6IFwibW9kdWxlXCIsXG4gIFwiZGVwZW5kZW5jaWVzXCI6IHtcbiAgICBcIkBjYXBhY2l0b3ItY29tbXVuaXR5L2FkbW9iXCI6IFwiXjguMC4wXCIsXG4gICAgXCJAY2FwYWNpdG9yL2FuZHJvaWRcIjogXCJeOC4wLjJcIixcbiAgICBcIkBjYXBhY2l0b3IvY2FtZXJhXCI6IFwiXjguMC4wXCIsXG4gICAgXCJAY2FwYWNpdG9yL2NvcmVcIjogXCJeOC4wLjJcIixcbiAgICBcIkBjYXBhY2l0b3IvZmlsZXN5c3RlbVwiOiBcIl44LjEuMFwiLFxuICAgIFwiQGNhcGFjaXRvci9zcGxhc2gtc2NyZWVuXCI6IFwiXjguMC4wXCIsXG4gICAgXCJAbmFwaS1ycy9jYW52YXNcIjogXCJeMC4xLjkwXCIsXG4gICAgXCJAbmV0bGlmeS9ibG9ic1wiOiBcIl4xMC43LjBcIixcbiAgICBcIkBuZXRsaWZ5L2Z1bmN0aW9uc1wiOiBcIl41LjEuMlwiLFxuICAgIFwiQHJhZGl4LXVpL3JlYWN0LWFjY29yZGlvblwiOiBcIl4xLjIuMTJcIixcbiAgICBcIkByYWRpeC11aS9yZWFjdC1sYWJlbFwiOiBcIl4yLjEuOFwiLFxuICAgIFwiQHJhZGl4LXVpL3JlYWN0LXBvcG92ZXJcIjogXCJeMS4xLjE1XCIsXG4gICAgXCJAcmFkaXgtdWkvcmVhY3Qtc2VsZWN0XCI6IFwiXjIuMi42XCIsXG4gICAgXCJAcmFkaXgtdWkvcmVhY3Qtc2xpZGVyXCI6IFwiXjEuMy42XCIsXG4gICAgXCJAcmFkaXgtdWkvcmVhY3Qtc2xvdFwiOiBcIl4xLjIuNFwiLFxuICAgIFwiQHJhZGl4LXVpL3JlYWN0LXN3aXRjaFwiOiBcIl4xLjIuNlwiLFxuICAgIFwiQHJhZGl4LXVpL3JlYWN0LXRhYnNcIjogXCJeMS4xLjEzXCIsXG4gICAgXCJAcmFkaXgtdWkvcmVhY3QtdG9vbHRpcFwiOiBcIl4xLjIuOFwiLFxuICAgIFwiQHNlbnRyeS9ub2RlXCI6IFwiXjEwLjM4LjBcIixcbiAgICBcIkBzZW50cnkvcmVhY3RcIjogXCJeMTAuMzguMFwiLFxuICAgIFwiY2xhc3MtdmFyaWFuY2UtYXV0aG9yaXR5XCI6IFwiXjAuNy4xXCIsXG4gICAgXCJjbHN4XCI6IFwiXjIuMS4xXCIsXG4gICAgXCJkYXRlLWZuc1wiOiBcIl40LjEuMFwiLFxuICAgIFwiZ2lmZW5jXCI6IFwiXjEuMC4zXCIsXG4gICAgXCJnaWZ1Y3QtanNcIjogXCJeMi4xLjJcIixcbiAgICBcImkxOG5leHRcIjogXCJeMjUuOC40XCIsXG4gICAgXCJpMThuZXh0LWJyb3dzZXItbGFuZ3VhZ2VkZXRlY3RvclwiOiBcIl44LjIuMFwiLFxuICAgIFwibGVmdGhvb2tcIjogXCJeMi4xLjFcIixcbiAgICBcImxvZ2xldmVsXCI6IFwiXjEuOS4yXCIsXG4gICAgXCJsb2dsZXZlbC1wbHVnaW4tcHJlZml4XCI6IFwiXjAuOC40XCIsXG4gICAgXCJsdWNpZGUtcmVhY3RcIjogXCJeMC41NjMuMFwiLFxuICAgIFwib3Blbi1sb2NhdGlvbi1jb2RlXCI6IFwiXjEuMC4zXCIsXG4gICAgXCJyZWFjdFwiOiBcIl4xOS4yLjRcIixcbiAgICBcInJlYWN0LWRheS1waWNrZXJcIjogXCJeOS4xMy4xXCIsXG4gICAgXCJyZWFjdC1kb21cIjogXCJeMTkuMi40XCIsXG4gICAgXCJyZWFjdC1pMThuZXh0XCI6IFwiXjE2LjUuNFwiLFxuICAgIFwidGFpbHdpbmQtbWVyZ2VcIjogXCJeMy40LjBcIixcbiAgICBcInp1c3RhbmRcIjogXCJeNS4wLjExXCJcbiAgfSxcbiAgXCJvdmVycmlkZXNcIjoge1xuICAgIFwidGFyXCI6IFwiPj03LjUuOFwiLFxuICAgIFwicXNcIjogXCI+PTYuMTQuMlwiLFxuICAgIFwiYWp2XCI6IFwiPj04LjE4LjBcIlxuICB9LFxuICBcImRldkRlcGVuZGVuY2llc1wiOiB7XG4gICAgXCJAYmlvbWVqcy9iaW9tZVwiOiBcIl4yLjMuMTRcIixcbiAgICBcIkBjYXBhY2l0b3IvY2xpXCI6IFwiXjguMC4yXCIsXG4gICAgXCJAY29tbWl0bGludC9jbGlcIjogXCJeMjAuNC4xXCIsXG4gICAgXCJAY29tbWl0bGludC9jb25maWctY29udmVudGlvbmFsXCI6IFwiXjIwLjQuMVwiLFxuICAgIFwiQHBsYXl3cmlnaHQvdGVzdFwiOiBcIl4xLjU4LjJcIixcbiAgICBcIkBzZW50cnkvdml0ZS1wbHVnaW5cIjogXCJeNC45LjBcIixcbiAgICBcIkB0YWlsd2luZGNzcy9wb3N0Y3NzXCI6IFwiXjQuMS4xOFwiLFxuICAgIFwiQHR5cGVzL29wZW4tbG9jYXRpb24tY29kZVwiOiBcIl4xLjAuMVwiLFxuICAgIFwiQHR5cGVzL3JlYWN0XCI6IFwiXjE5LjIuMTNcIixcbiAgICBcIkB0eXBlcy9yZWFjdC1kb21cIjogXCJeMTkuMi4zXCIsXG4gICAgXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiOiBcIl41LjEuM1wiLFxuICAgIFwiQHZpdGVzdC9jb3ZlcmFnZS12OFwiOiBcIl40LjAuMThcIixcbiAgICBcImF1dG9wcmVmaXhlclwiOiBcIl4xMC40LjI0XCIsXG4gICAgXCJjc3BlbGxcIjogXCJeOS42LjRcIixcbiAgICBcImRlcGVuZGVuY3ktY3J1aXNlclwiOiBcIl4xNy4zLjdcIixcbiAgICBcImhhcHB5LWRvbVwiOiBcIl4yMC41LjBcIixcbiAgICBcImpzY3BkXCI6IFwiXjQuMC44XCIsXG4gICAgXCJqc2RvbVwiOiBcIl4yOC4wLjBcIixcbiAgICBcImtuaXBcIjogXCJeNS44My4xXCIsXG4gICAgXCJsaWNlbnNlLWNoZWNrZXJcIjogXCJeMjUuMC4xXCIsXG4gICAgXCJsaW50LXN0YWdlZFwiOiBcIl4xNi4yLjdcIixcbiAgICBcImxvY2tmaWxlLWxpbnRcIjogXCJeNS4wLjBcIixcbiAgICBcIm5ldGxpZnktY2xpXCI6IFwiXjIzLjE1LjFcIixcbiAgICBcInBvc3Rjc3NcIjogXCJeOC41LjZcIixcbiAgICBcInB1cHBldGVlclwiOiBcIl4yNC4zNy4yXCIsXG4gICAgXCJyb2xsdXAtcGx1Z2luLXZpc3VhbGl6ZXJcIjogXCJeNi4wLjVcIixcbiAgICBcInNlcnZlXCI6IFwiXjE0LjIuNVwiLFxuICAgIFwic2hhcnBcIjogXCJeMC4zNC41XCIsXG4gICAgXCJ0YWlsd2luZGNzc1wiOiBcIl40LjEuMThcIixcbiAgICBcInRlcnNlclwiOiBcIl41LjQ2LjBcIixcbiAgICBcInR5cGUtY292ZXJhZ2VcIjogXCJeMi4yOS43XCIsXG4gICAgXCJ0eXBlc2NyaXB0XCI6IFwiXjUuOS4zXCIsXG4gICAgXCJ2aXRlXCI6IFwiXjcuMy4xXCIsXG4gICAgXCJ2aXRlLXBsdWdpbi1jb21wcmVzc2lvblwiOiBcIl4wLjUuMVwiLFxuICAgIFwidml0ZS1wbHVnaW4tcHdhXCI6IFwiXjEuMi4wXCIsXG4gICAgXCJ2aXRlc3RcIjogXCJeNC4wLjE4XCJcbiAgfVxufVxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7OztBQWNBLFlBQVksWUFBWTs7O0FDZHhCO0FBQUEsRUFDRSxNQUFRO0FBQUEsRUFDUixTQUFXO0FBQUEsRUFDWCxhQUFlO0FBQUEsRUFDZixTQUFXO0FBQUEsSUFDVCxLQUFPO0FBQUEsSUFDUCxPQUFTO0FBQUEsSUFDVCxTQUFXO0FBQUEsSUFDWCxXQUFhO0FBQUEsSUFDYixNQUFRO0FBQUEsSUFDUixjQUFjO0FBQUEsSUFDZCxpQkFBaUI7QUFBQSxJQUNqQixxQkFBcUI7QUFBQSxJQUNyQixxQkFBcUI7QUFBQSxJQUNyQixXQUFXO0FBQUEsSUFDWCxlQUFlO0FBQUEsSUFDZixhQUFhO0FBQUEsSUFDYixzQkFBc0I7QUFBQSxJQUN0QixxQkFBcUI7QUFBQSxJQUNyQixtQkFBbUI7QUFBQSxJQUNuQixnQkFBZ0I7QUFBQSxJQUNoQixZQUFZO0FBQUEsSUFDWixpQkFBaUI7QUFBQSxJQUNqQix3QkFBd0I7QUFBQSxJQUN4QixxQkFBcUI7QUFBQSxJQUNyQixlQUFlO0FBQUEsSUFDZixv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
