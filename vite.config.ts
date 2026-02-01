import fs from 'node:fs';
import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import compression from 'vite-plugin-compression';
import { VitePWA } from 'vite-plugin-pwa';

// Disable compression for Android builds (Capacitor sync causes duplicate resource errors)
// Android WebView doesn't use pre-compressed .gz/.br files anyway
const isAndroidBuild =
  process.env.CAPACITOR_PLATFORM === 'android' || process.env.npm_lifecycle_event?.includes('cap');

// Custom middleware to serve static files from public/gallery before SPA fallback
function serveGalleryFiles() {
  return {
    name: 'serve-gallery-files',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Check if request is for a gallery file
        if (req.url?.startsWith('/gallery/')) {
          const filePath = path.join(__dirname, 'public', req.url);

          // Check if file exists
          if (fs.existsSync(filePath)) {
            const ext = path.extname(filePath).toLowerCase();
            const mimeTypes: Record<string, string> = {
              '.png': 'image/png',
              '.gif': 'image/gif',
              '.jpg': 'image/jpeg',
              '.jpeg': 'image/jpeg',
              '.webp': 'image/webp',
              '.svg': 'image/svg+xml',
              '.json': 'application/json',
            };

            const contentType = mimeTypes[ext] || 'application/octet-stream';
            res.setHeader('Content-Type', contentType);
            res.setHeader('Cache-Control', 'public, max-age=31536000');

            const fileStream = fs.createReadStream(filePath);
            fileStream.pipe(res);
            return;
          }
        }
        next();
      });
    },
  };
}

// Collect VITE_* environment variables from process.env (set by Makefile exports)
// and make them available to import.meta.env in the client bundle
function getEnvDefines() {
  const defines: Record<string, string> = {};
  for (const key of Object.keys(process.env)) {
    if (key.startsWith('VITE_')) {
      defines[`import.meta.env.${key}`] = JSON.stringify(process.env[key]);
    }
  }
  return defines;
}

// https://vitejs.dev/config/
export default defineConfig({
  define: getEnvDefines(),
  plugins: [
    serveGalleryFiles(), // Serve gallery files before React plugin
    react(),
    // Gzip compression for production builds (disabled for Android)
    ...(!isAndroidBuild
      ? [
          compression({
            verbose: false,
            algorithm: 'gzip',
            ext: '.gz',
            threshold: 1024, // Only compress files > 1KB
          }),
          // Brotli compression for modern browsers (better compression ratio)
          compression({
            verbose: false,
            algorithm: 'brotliCompress',
            ext: '.br',
            threshold: 1024,
          }),
        ]
      : []),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'sitemap.xml'],
      manifest: {
        name: 'ANQR - QR Code Generator',
        short_name: 'ANQR',
        description:
          'Free browser-based QR code generator with advanced styling, animations, and safety checks.',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'any',
        categories: ['utilities', 'productivity'],
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/icons/icon-72.png',
            sizes: '72x72',
            type: 'image/png',
          },
          {
            src: '/icons/icon-96.png',
            sizes: '96x96',
            type: 'image/png',
          },
          {
            src: '/icons/icon-128.png',
            sizes: '128x128',
            type: 'image/png',
          },
          {
            src: '/icons/icon-144.png',
            sizes: '144x144',
            type: 'image/png',
          },
          {
            src: '/icons/icon-152.png',
            sizes: '152x152',
            type: 'image/png',
          },
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-384.png',
            sizes: '384x384',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
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
            handler: 'CacheFirst',
            options: {
              cacheName: 'locale-chunks-cache',
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
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-chunks-cache',
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
            handler: 'CacheFirst',
            options: {
              cacheName: 'js-chunks-cache',
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
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
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
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
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
            handler: 'CacheFirst',
            options: {
              cacheName: 'gallery-images-cache',
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
            // Fallback for navigation requests (SPA support)
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages-cache',
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
        // Precache app shell - include all JS chunks for offline support
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,woff,ttf,json}'],
        // Ensure locale and static chunks are included
        globIgnores: ['**/node_modules/**/*', 'sw.js', 'workbox-*.js'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Target modern browsers for smaller bundles
    target: 'es2020',
    // Enable CSS code splitting for better caching
    cssCodeSplit: true,
    // Increase chunk size warning limit (we'll optimize chunks manually)
    chunkSizeWarningLimit: 700, // Icons bundle is ~566KB due to lucide-react
    // Minification options
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        passes: 2, // Multiple compression passes for better optimization
      },
      format: {
        comments: false, // Remove comments
      },
      mangle: {
        safari10: true, // Work around Safari 10 bugs
      },
    },
    rollupOptions: {
      output: {
        // Manual chunk splitting for optimal caching
        manualChunks: (id) => {
          // React core
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'vendor-react';
          }
          // Radix UI components
          if (id.includes('node_modules/@radix-ui/')) {
            return 'vendor-radix';
          }
          // i18n libraries
          if (id.includes('node_modules/i18next') || id.includes('node_modules/react-i18next')) {
            return 'vendor-i18n';
          }
          // GIF processing (heavy, rarely used)
          if (id.includes('node_modules/gifenc') || id.includes('node_modules/gifuct-js')) {
            return 'vendor-gif';
          }
          // Image processing
          if (id.includes('node_modules/image-q')) {
            return 'vendor-image';
          }
          // QR scanning
          if (id.includes('node_modules/jsqr')) {
            return 'vendor-qr-scanner';
          }
          // Form and validation
          if (
            id.includes('node_modules/zod') ||
            id.includes('node_modules/react-hook-form') ||
            id.includes('node_modules/@hookform')
          ) {
            return 'vendor-forms';
          }
          // Drag and drop
          if (id.includes('node_modules/@dnd-kit')) {
            return 'vendor-dnd';
          }
          // Utility libraries
          if (
            id.includes('node_modules/clsx') ||
            id.includes('node_modules/tailwind-merge') ||
            id.includes('node_modules/class-variance-authority')
          ) {
            return 'vendor-utils';
          }
          // Capacitor (native platform support) + app platform modules
          // These are grouped together to avoid circular dependencies with app-exporter
          if (
            id.includes('node_modules/@capacitor') ||
            id.includes('/modules/platform') ||
            id.includes('/modules/browser-io')
          ) {
            return 'vendor-capacitor';
          }
          // Zustand state management
          if (id.includes('node_modules/zustand')) {
            return 'vendor-zustand';
          }
          // Lucide icons - large but necessary for UI
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons';
          }
          // QR code generation library (now in src/modules)
          if (id.includes('/modules/qrcode.mjs')) {
            return 'app-qr-lib';
          }
          // App modules - split heavy processing
          if (id.includes('/modules/exporter') || id.includes('/modules/animation')) {
            return 'app-exporter';
          }
          if (
            id.includes('/modules/overlay-processor') ||
            id.includes('/modules/image-filters') ||
            id.includes('/modules/dither')
          ) {
            return 'app-image-processing';
          }
          if (
            id.includes('/modules/renderer') ||
            id.includes('/modules/qr-core') ||
            id.includes('/modules/qr-generator')
          ) {
            return 'app-qr-core';
          }
          // Gallery data
          if (id.includes('/data/gallery-items')) {
            return 'app-gallery-data';
          }
          // Locale JSON files - split by language (match patterns like en-GB.json, ar.json, etc.)
          if (id.includes('/locales/') && id.endsWith('.json')) {
            const match = id.match(/locales\/([a-zA-Z-]+)\.json/);
            if (match) {
              const langCode = match[1].toLowerCase();
              // Keep English in main bundle, lazy load others
              if (langCode === 'en-gb') return 'locale-en';
              return `locale-${langCode}`;
            }
          }
          // Static page content - split by language (match patterns like en-GB/, ar/, bn-BD/, etc.)
          if (id.includes('/static/') && !id.includes('/txt/') && !id.includes('/types')) {
            const match = id.match(/static\/([a-zA-Z-]+)\//);
            if (match) {
              const langCode = match[1].toLowerCase();
              // Keep English in main bundle, lazy load others
              if (langCode === 'en-gb') return 'static-en';
              return `static-${langCode}`;
            }
          }
        },
      },
    },
  },
  // Web Worker configuration
  worker: {
    format: 'es',
    plugins: () => [react()],
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'zustand', 'clsx', 'tailwind-merge', 'comlink'],
    exclude: ['sharp', 'puppeteer'], // These are dev/build only
  },
});
