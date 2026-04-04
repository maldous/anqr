// Generated from ../../../scripts/ops/core/symphony-validation.mjs:6

export const VALIDATION_MANIFEST = {
  typecheck: {
    command: "( flock -w 120 9 || exit 1; npx tsc --noEmit ) 9>/tmp/anqr-typecheck.lock",
    timeoutMs: 240_000,
    fullProject: true,
  },
  lint: {
    command: "npx oxlint -c oxlint.json src/ packages/ apps/ scripts/",
    timeoutMs: 60_000,
    fullProject: true,
  },
  cspell: {
    command: "npx cspell --no-progress --no-must-find-files",
    timeoutMs: 60_000,
    changedOnly: true,
    fullProjectGlobs: ['"src/**/*.{ts,tsx}"', '"scripts/**/*.{mjs,js}"', '"docs/**/*.md"'],
    extensions: /\.(ts|tsx|js|mjs|md|json)$/,
  },
  astDensity: {
    command: "node scripts/audit-ast-density.mjs --threshold 1",
    timeoutMs: 120_000,
    changedOnly: true,
    fullProject: true,
    extensions: /\.(ts|tsx)$/,
  },
  tests: {
    command:
      "( flock -w 120 9 || exit 1; NODE_OPTIONS='--no-experimental-webstorage' npx vitest run --maxWorkers=1 --exclude 'tests/unit/gallery-scan-matrix.spec.ts' --exclude 'tests/unit/overlay-preservation-mode-audit.spec.ts' --exclude 'tests/unit/qr-generator-perf-profile.spec.ts' ) 9>/tmp/anqr-vitest.lock",
    timeoutMs: 240_000,
    fullProject: true,
  },
};
