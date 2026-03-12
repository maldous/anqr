# 06. Quality gates

## Required gates for every pass

Run all of these after each migration pass and before each commit.

### 1. Typecheck

```bash
npm run typecheck
```

### 2. Architecture policy

```bash
npm run depcruise
```

### 3. AST inventory refresh

```bash
npm run extract:ast
```

### 4. Tests

Run the existing unit/integration/E2E suites that already exist in the repository.
At minimum, rerun tests that exercise:

- generator
- analyze
- export
- payload serialization
- share URL import/export

### 5. Manual smoke checks

Required smoke checks:

- open the app
- generate a normal QR
- generate with overlay
- generate animated output
- export PNG / SVG / GIF
- import settings from URL
- analyze uploaded image
- import analysis back into generator
- exercise native-only guards in a web environment

## Acceptance criteria by migration phase

### After direct moves

- `tsc --noEmit` passes
- no new circular imports
- application starts and renders shell
- lazy-loaded screens still resolve

### After App split

- page resolution unchanged
- canonical and hreflang handling unchanged
- URL parameter import still works

### After useQRGenerator split

- standard generation works
- QArt generation still works
- animation generation still works
- watermark still works
- export still works

### After Analyze split

- analyze page accepts file, URL, and camera paths
- result summary renders
- reproduction path works
- export analysis JSON works

### After qr-store split

- state hydration unchanged
- payload serialization unchanged
- share links and URL import/export unchanged

### After QRGenerator split

- scan-gate and rescue behaviour unchanged
- decode robustness unchanged
- overlay complexity behaviour unchanged

## Metrics to watch

Track these after each phase:

- total internal file dependencies
- number of split-required files remaining
- number of broad barrels remaining
- highest fan-in files
- files with top-level side effects outside allowed locations
- number of architecture rule violations

## Regression budget

Do not accept a pass if it:

- increases cycles above zero
- adds new generic sinks
- increases hotspot concentration into a new gravity well
- shifts platform code back into domain or feature modules
- changes behaviour without explicit product sign-off

## Review checklist for pull requests

Every architecture PR must answer:

1. What bounded context owns each changed file now?
2. Did any file become less cohesive?
3. Did any new barrel or generic sink appear?
4. Did any domain file start importing React or browser APIs?
5. Did any feature start owning algorithmic logic?
6. Were all quality gates run and attached?

## Definition of done

The refactor is done when:

- the target top-level structure is in place
- all direct moves are complete
- all critical mixed files are split
- global barrels are removed
- architecture rules are enforced in CI
- the working-set inventory no longer reports structural hot spots of the current kind
