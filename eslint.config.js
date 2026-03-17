import boundaries from "eslint-plugin-boundaries";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "android/**",
      "ios/**",
      ".github/**",
      "coverage/**",
      "public/**",
      "*.generated.*",
    ],
  },
  {
    files: ["src/**/*.{ts,tsx}", "packages/**/*.{ts,tsx}", "apps/**/*.{ts,tsx}"],
    rules: {
      "no-var": "error",
      "prefer-const": "error",
    },
  },

  // ── Monorepo cross-root governance ──────────────────────────────────
  // Forbids imports that violate package/app/harness boundaries.
  {
    files: ["packages/**/*.{ts,tsx}", "apps/**/*.{ts,tsx}"],
    plugins: { boundaries },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
        },
      },
      "boundaries/elements": [
        { type: "pkg-domain", pattern: "packages/domain/*/**" },
        { type: "pkg-application", pattern: "packages/application/*/**" },
        { type: "pkg-ui", pattern: "packages/ui/*/**" },
        { type: "pkg-platform", pattern: "packages/platform/*/**" },
        { type: "pkg-observability", pattern: "packages/observability/*/**" },
        { type: "pkg-analytics", pattern: "packages/analytics/*/**" },
        { type: "pkg-testing", pattern: "packages/testing/*/**" },
        { type: "pkg-config", pattern: "packages/config/*/**" },
        { type: "app-web", pattern: "apps/web/**" },
        { type: "app-api", pattern: "apps/api/**" },
        { type: "app-mobile", pattern: "apps/mobile/**" },
        { type: "harness", pattern: "scripts/ops/**" },
        { type: "src-transitional", pattern: "src/**" },
      ],
    },
    rules: {
      "boundaries/element-types": [
        "warn",
        {
          default: "allow",
          rules: [
            // Apps must not import from src/ once a package equivalent exists
            {
              from: ["app-web", "app-api", "app-mobile"],
              disallow: ["src-transitional"],
              message: "Apps must not import from src/ — use packages instead.",
            },
            // No production code imports from testing packages
            {
              from: [
                "pkg-domain",
                "pkg-application",
                "pkg-ui",
                "pkg-platform",
                "pkg-observability",
                "pkg-analytics",
                "app-web",
                "app-api",
                "app-mobile",
              ],
              disallow: ["pkg-testing"],
              message: "Production code must not import from testing packages.",
            },
            // No product imports from harness
            {
              from: [
                "pkg-domain",
                "pkg-application",
                "pkg-ui",
                "pkg-platform",
                "pkg-observability",
                "pkg-analytics",
                "app-web",
                "app-api",
                "app-mobile",
              ],
              disallow: ["harness"],
              message: "Product code must not import from scripts/ops/.",
            },
          ],
        },
      ],
    },
  },

  // ── Architecture boundary enforcement ─────────────────────────────
  // Complements dependency-cruiser with real-time IDE feedback.
  // Authority: docs/standards/dependency-rules.md
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { boundaries },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    linterOptions: {
      noInlineConfig: true,
      reportUnusedDisableDirectives: "off",
    },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
        },
      },
      "boundaries/elements": [
        { type: "app", pattern: "src/app/**" },
        { type: "ui", pattern: "src/ui/**" },
        { type: "components", pattern: "src/components/**" },
        { type: "features", pattern: "src/features/*/**", capture: ["feature"] },
        { type: "state", pattern: "src/state/**" },
        { type: "domain", pattern: "src/domain/**" },
        { type: "platform", pattern: "src/platform/**" },
        { type: "infra", pattern: "src/infra/**" },
        { type: "content", pattern: "src/content/**" },
        { type: "i18n", pattern: "src/i18n/**" },
        // Transitional broad-bucket directories are intentionally unclassified.
        // Imports from/to store/, hooks/, lib/, data/, types/, modules/ are
        // governed by dependency-cruiser rules, not eslint-boundaries.
      ],
    },
    rules: {
      "boundaries/element-types": [
        "warn",
        {
          default: "disallow",
          rules: [
            // ── app/ ────────────────────────────────────────────────
            // app → features, ui, components, state, infra, platform, content, i18n
            // app → domain kept disallowed: 1 inherited violation (visible reminder)
            {
              from: "app",
              allow: [
                "app",
                "features",
                "ui",
                "components",
                "state",
                "infra",
                "platform",
                "content",
                "i18n",
              ],
            },

            // ── ui/ ─────────────────────────────────────────────────
            // Presentation-only (architecture-standards.md).
            // infra allowed for cross-cutting telemetry/logging (zaraz, auto-testid).
            { from: "ui", allow: ["ui", "infra"] },

            // ── components/ (transitional ui layer) ─────────────────
            // Inherited debt allowed to reduce noise — tracked in depcruise.
            // Effective guards: no state, domain, or i18n imports.
            {
              from: "components",
              allow: ["components", "ui", "features", "platform", "app", "infra", "content"],
            },

            // ── features/ ───────────────────────────────────────────
            // features → ui, components, state, domain, platform, infra, content, i18n
            // Inherited debt: ~45 features → app (allowed to reduce noise)
            // 'features' intentionally omitted — cross-feature guard handled by capture rule below.
            {
              from: "features",
              allow: [
                "ui",
                "components",
                "state",
                "domain",
                "platform",
                "infra",
                "content",
                "i18n",
                "app",
              ],
            },
            // Same feature only — no cross-feature imports
            {
              from: [["features", { feature: "*" }]],
              allow: [["features", { feature: "${from.feature}" }]],
            },

            // ── state/ ──────────────────────────────────────────────
            // Clean boundary (0 inherited violations)
            { from: "state", allow: ["state", "domain", "infra"] },

            // ── domain/ ─────────────────────────────────────────────
            // Must stay runtime-agnostic
            // domain → platform kept disallowed: 4 inherited violations (visible reminder)
            { from: "domain", allow: ["domain", "infra"] },

            // ── platform/ ───────────────────────────────────────────
            // Clean boundary (0 inherited violations)
            { from: "platform", allow: ["platform", "domain", "infra"] },

            // ── infra/ ──────────────────────────────────────────────
            // Cross-cutting only, no domain logic
            { from: "infra", allow: ["infra"] },

            // ── content/ ────────────────────────────────────────────
            { from: "content", allow: ["content", "i18n"] },

            // ── i18n/ ───────────────────────────────────────────────
            { from: "i18n", allow: ["i18n", "content", "infra"] },
          ],
        },
      ],
    },
  },
];
