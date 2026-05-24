export const DEFAULT_GLOBS = [
  "**/*.{ts,tsx,js,jsx,mjs,cjs}",
  "!**/node_modules/**",
  "!**/.git/**",
  "!**/dist/**",
  "!**/coverage/**",
  "!**/*.test.*",
  "!**/*.spec.*",
  "!tests/**",
  // Build outputs and copied web bundles — these are minified/vendored, not source.
  // Scanning them produces thousands of false-positive density violations (every
  // bundled Sentry/Workbox vendor chunk reports 1000+ top-level declarations).
  "!**/android/**/build/**",
  "!**/android/app/src/main/assets/**",
  "!**/ios/App/App/public/**",
  "!**/.netlify/**",
  "!**/playwright-report/**",
  "!**/.playwright-mcp/**",
  "!**/public/assets/**",
  "!**/public/gallery/**",
  "!apps/web/public/**",
];
