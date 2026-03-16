import path from "node:path";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";
import compression from "vite-plugin-compression";
import { VitePWA } from "vite-plugin-pwa";
import { analyzeBundle } from "./analyze-bundle.const";
import { getEnvDefines } from "./get-env-defines";
import { isAndroidBuild } from "./is-android-build.const";
import { oxcMinifyPlugin } from "./oxc-minify-plugin";
import { sentryAuthToken } from "./sentry-auth-token.const";
import { sentryOrg } from "./sentry-org.const";
import { sentryProject } from "./sentry-project.const";
import { sentryRelease } from "./sentry-release.const";
import { sentryUploadEnabled } from "./sentry-upload-enabled.const";
import { serveGalleryFiles } from "./serve-gallery-files";

export const viteConfig = defineConfig({
  define: getEnvDefines(),
  plugins: [
    // Serve gallery files before React plugin
    serveGalleryFiles(),
    react(),
    // OXC-powered minification (replaces terser)
    oxcMinifyPlugin(), // Gzip compression for production builds (disabled for Android)
    ...(!isAndroidBuild
      ? [
          compression({
            verbose: false,
            algorithm: "gzip",
            ext: ".gz",
            threshold: 1024, // Only compress files > 1KB
          }),
          // Brotli compression for modern browsers (better compression ratio)
          compression({
            verbose: false,
            algorithm: "brotliCompress",
            ext: ".br",
            threshold: 1024,
          }),
        ]
      : []), // Sentry source map upload plugin (only enabled when explicitly requested)
    ...(sentryUploadEnabled
      ? [
          sentryVitePlugin({
            authToken: sentryAuthToken,
            org: sentryOrg,
            project: "anqr-mobile",
            release: {
              name: sentryRelease,
              finalize: true,
              setCommits: { auto: true, ignoreMissing: true, ignoreEmpty: true },
              deploy: {
                env: process.env.NODE_ENV || "production",
              },
            },
            sourcemaps: {
              assets: ["./dist/**/*.js", "./dist/**/*.js.map"],
              ignore: ["node_modules/**"],
            },
            telemetry: false,
          }),
          sentryVitePlugin({
            authToken: sentryAuthToken,
            org: sentryOrg,
            project: sentryProject,
            release: {
              name: sentryRelease,
              finalize: true,
              setCommits: { auto: true, ignoreMissing: true, ignoreEmpty: true },
              deploy: {
                env: process.env.NODE_ENV || "production",
              },
            },
            sourcemaps: {
              assets: ["./dist/**/*.js", "./dist/**/*.js.map"],
              ignore: ["node_modules/**"],
              filesToDeleteAfterUpload: ["./dist/**/*.js.map"],
            },
            telemetry: false,
          }),
        ]
      : []), // Bundle analyzer (only when ANALYZE=true)
    ...(analyzeBundle
      ? [
          visualizer({
            filename: "dist/stats.html",
            open: true,
            gzipSize: true,
            brotliSize: true,
          }),
        ]
      : []),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt", "sitemap.xml"],
      manifest: {
        name: "ANQR - QR Code Generator",
        short_name: "ANQR",
        description:
          "Free browser-based QR code generator with advanced styling, animations, and safety checks.",
        theme_color: "#0f172a",
        background_color: "#0f172a",
        display: "standalone",
        orientation: "any",
        categories: ["utilities", "productivity"],
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "/icons/icon-72.png",
            sizes: "72x72",
            type: "image/png",
          },
          {
            src: "/icons/icon-96.png",
            sizes: "96x96",
            type: "image/png",
          },
          {
            src: "/icons/icon-128.png",
            sizes: "128x128",
            type: "image/png",
          },
          {
            src: "/icons/icon-144.png",
            sizes: "144x144",
            type: "image/png",
          },
          {
            src: "/icons/icon-152.png",
            sizes: "152x152",
            type: "image/png",
          },
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/icon-384.png",
            sizes: "384x384",
            type: "image/png",
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        // Increase max file size to cache (default is 2MB, we set 3MB as safeguard)
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        // Cache strategies
        runtimeCaching: [
          {
            // Cache locale chunks for offline language switching
            urlPattern: /\/assets\/locale-.*\.js$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "locale-chunks-cache",
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Cache static content chunks for offline docs/pages
            urlPattern: /\/assets\/static-.*\.js$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "static-chunks-cache",
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Cache all other JS chunks (vendor, app modules)
            urlPattern: /\/assets\/.*\.js$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "js-chunks-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "gstatic-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /\/gallery\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "gallery-images-cache",
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Cache learn/examples images on-demand (not precached due to size)
            urlPattern: /\/images\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "content-images-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Fallback for navigation requests (SPA support)
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkFirst",
            options: {
              cacheName: "pages-cache",
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
        // Skip waiting and claim clients immediately
        skipWaiting: true,
        clientsClaim: true,
        // Precache app shell - core assets only, not language files
        // Language/locale files are cached on-demand via runtimeCaching above
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2,woff,ttf,json}"],
        // Exclude non-essential files from precache to reduce initial install size
        globIgnores: [
          "**/node_modules/**/*",
          "sw.js",
          "workbox-*.js",
          // Exclude gallery images from precache (large, cached on-demand)
          "**/gallery/**/*",
          // Exclude learn/examples images from precache (large, cached on-demand)
          "**/images/**/*",
          // Exclude source maps if any slip through
          "**/*.map",
          // Exclude stats.html bundle analyzer output
          "**/stats.html",
        ],
        // Filter manifest entries to exclude non-English locale/static chunks
        // This keeps English in precache for offline-first, others cached on-demand
        manifestTransforms: [
          (entries: Array<{ url: string; revision: string | null; size: number }>) => {
            const manifest = entries.filter((entry) => {
              const url = entry.url;
              // Keep English locale and static files for offline-first experience
              if (url.includes("/assets/locale-en")) return true;
              if (url.includes("/assets/static-en")) return true;
              // Exclude all other locale chunks (80+ languages, ~10MB+)
              if (url.includes("/assets/locale-")) return false;
              // Exclude all other static content chunks (translated pages, ~80MB+)
              if (url.includes("/assets/static-")) return false;
              // Keep everything else
              return true;
            });
            return { manifest, warnings: [] as string[] };
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "../src"),
    },
  },
  build: {
    // Enable source maps for Sentry (they're deleted after upload)
    sourcemap: true,
    // Target modern browsers for smaller bundles
    target: "es2020",
    // Enable CSS code splitting for better caching
    cssCodeSplit: true,
    // Increase chunk size warning limit (we'll optimize chunks manually)
    chunkSizeWarningLimit: 700, // Icons bundle is ~566KB due to lucide-react
    // Minification handled by oxc-minify plugin (renderChunk hook)
    minify: false,
    cssMinify: true,
    rollupOptions: {
      output: {
        // Manual chunk splitting for optimal caching
        manualChunks: (id) => {
          // React core
          if (id.includes("node_modules/react/") || id.includes("node_modules/react-dom/")) {
            return "vendor-react";
          }
          // Radix UI components
          if (id.includes("node_modules/@radix-ui/")) {
            return "vendor-radix";
          }
          // i18n libraries
          if (id.includes("node_modules/i18next") || id.includes("node_modules/react-i18next")) {
            return "vendor-i18n";
          }
          // GIF processing (heavy, rarely used)
          if (id.includes("node_modules/gifenc") || id.includes("node_modules/gifuct-js")) {
            return "vendor-gif";
          }
          // QR scanning
          if (id.includes("node_modules/jsqr")) {
            return "vendor-qr-scanner";
          }
          // Date/calendar libraries (only used for calendar payload types)
          if (
            id.includes("node_modules/date-fns") ||
            id.includes("node_modules/@date-fns") ||
            id.includes("node_modules/react-day-picker")
          ) {
            return "vendor-date";
          }
          // open-location-code (5 KiB) stays in main entry — too small for a separate chunk
          // Utility libraries
          if (
            id.includes("node_modules/clsx") ||
            id.includes("node_modules/tailwind-merge") ||
            id.includes("node_modules/class-variance-authority") ||
            id.includes("node_modules/loglevel") ||
            id.includes("node_modules/zustand")
          ) {
            return "vendor-utils";
          }
          // Sentry SDK (loaded early but can be separate chunk)
          if (id.includes("node_modules/@sentry")) {
            return "vendor-sentry";
          }
          // Lucide icons - tree-shaken via explicit imports
          // Note: Removed barrel import in Header.tsx for proper tree-shaking
          if (id.includes("node_modules/lucide-react")) {
            return "vendor-icons";
          }
          // Lazy-loaded page components
          if (id.includes("/components/Gallery")) {
            return "app-gallery";
          }
          // StaticPage is React.lazy() loaded — Rolldown auto-splits it.
          // No manual chunk needed; this lets English content route to static-en (i18n)
          // and shared vendors (tailwind-merge) stay in their proper chunks.
          // WelcomeModal is React.lazy() loaded — Rolldown auto-splits it.
          // No manual chunk needed; this avoids inlining shared vendors (tailwind-merge).
          // QR code generation library (now in src/modules)
          if (id.includes("/modules/qrcode.mjs")) {
            return "app-qr-lib";
          }
          // QR runtime: generator, analyzer, and media are tightly coupled after the
          // AST split work, so they must stay in one manual chunk to avoid
          // rollup circular manual-chunk warnings.
          if (
            id.includes("/modules/overlay") ||
            id.includes("/modules/dither") ||
            id.includes("/modules/animation") ||
            id.includes("/modules/exporter") ||
            id.includes("/modules/platform") ||
            id.includes("/modules/browser-io") ||
            id.includes("node_modules/@capacitor")
          ) {
            return "app-qr-runtime";
          }
          // Keep QR-Art logic isolated from core editor runtime.
          if (id.includes("/modules/qr-art")) {
            return "app-qr-art";
          }
          // Analyzer, decoder, and generator now share helper surfaces and should
          // stay in the same runtime chunk.
          if (id.includes("/modules/qr-analyzer") || id.includes("/modules/qr-decoder")) {
            return "app-qr-runtime";
          }
          if (
            id.includes("/modules/renderer") ||
            id.includes("/modules/qr-core") ||
            id.includes("/modules/qr-generator") ||
            id.includes("/modules/qr-encoder") ||
            id.includes("/modules/qr-spec")
          ) {
            return "app-qr-runtime";
          }
          // Gallery data
          if (id.includes("/data/gallery-showcase.generated")) {
            return "app-gallery-generated";
          }
          if (id.includes("/data/gallery-items")) {
            return "app-gallery-data";
          }
          // Locale JSON files - split by language (match patterns like en-GB.json, ar.json, etc.)
          if (id.includes("/locales/") && id.endsWith(".json")) {
            const match = id.match(/locales\/([a-zA-Z0-9-]+)\.json/);
            if (match) {
              const langCode = match[1].toLowerCase();
              // Keep English in main bundle, lazy load others
              if (langCode === "en-gb") return "locale-en";
              return `locale-${langCode}`;
            }
          }
          // Static page content - split by language (match patterns like en-GB/, ar/, bn-BD/, etc.)
          if (id.includes("/static/") && !id.includes("/txt/") && !id.includes("/types")) {
            const match = id.match(/static\/([a-zA-Z0-9-]+)\//);
            if (match) {
              const langCode = match[1].toLowerCase();
              // Keep English in main bundle, lazy load others
              if (langCode === "en-gb") return "static-en";
              return `static-${langCode}`;
            }
          }
        },
      },
    },
  },
  // Web Worker configuration
  worker: {
    format: "es",
    plugins: () => [react()],
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ["react", "react-dom", "zustand", "clsx", "tailwind-merge"],
    exclude: [
      "sharp",
      "puppeteer",
      // Node-native canvas packages are test/server-only and must never be optimized for client.
      "@napi-rs/canvas",
      "@napi-rs/canvas-linux-x64-gnu",
      "@napi-rs/canvas-linux-x64-musl",
    ],
  },
});
