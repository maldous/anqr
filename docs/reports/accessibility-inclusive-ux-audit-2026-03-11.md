# Accessibility and Inclusive UX Audit (ANQ-166)

Date: 2026-03-11
Scope: `/`, `/guide`, `/learn`, `/examples` (desktop 1440x900 and mobile iPhone 13 viewport)

## Method used

1. Automated DOM/interaction audit with Playwright against running local app (`npm run dev -- --host 127.0.0.1 --port 4173`).
2. Collected per-route metrics for:
- interactive controls count
- unlabeled controls count
- touch-target sizes under 44x44 px
- landmark presence (`header`, `nav`, `main`, `footer`)
- keyboard focus traversal snapshot (first 30 `Tab` stops)
3. Captured full-page screenshots for desktop and mobile.
4. Ran contrast sampling on visible text controls/content with WCAG AA thresholds (4.5:1 normal text, 3:1 large text).

## Evidence (screens/metrics/notes)

Artifacts:
- Metrics JSON: `reports/accessibility/audit-metrics.json`
- Screenshots:
  - `reports/accessibility/home-desktop.png`
  - `reports/accessibility/home-mobile.png`
  - `reports/accessibility/guide-desktop.png`
  - `reports/accessibility/guide-mobile.png`
  - `reports/accessibility/learn-desktop.png`
  - `reports/accessibility/learn-mobile.png`
  - `reports/accessibility/examples-desktop.png`
  - `reports/accessibility/examples-mobile.png`

Measured outcomes:
- Accessible naming: `0` unlabeled interactive elements on all audited routes (desktop/mobile).
- Focus order (home): starts at skip link and proceeds through actionable controls; no immediate keyboard trap observed in first 30 tab stops.
- Semantics/landmarks:
  - Home: `header=1, nav=1, main=1, footer=1`
  - Guide/Learn/Examples: each has `main=2` (potential landmark ambiguity for assistive tech expecting one primary main region).
- Touch targets (<44x44): repeated failures from compact controls, notably language buttons (`~78x28`) and close icon (`36x36`) on mobile.
- Contrast sampling:
  - `/`: 2 text samples below AA (worst `4.34:1`, labels: `Advanced`, `Pro`)
  - `/guide`, `/learn`, `/examples`: no sampled failures; worst measured ratio `4.76:1`.

## Concrete recommendations

Priority P1:
- Increase mobile target sizes for compact controls to at least 44x44 CSS px (language chips and small icon-only controls).
- Normalize page structure to a single `main` landmark per view in guide/learn/examples layouts.

Priority P2:
- Raise contrast for tier labels (`Advanced`, `Pro`) to >= 4.5:1 in normal text contexts.
- Add explicit automated assertions for touch-target minimums on mobile viewport in Playwright coverage.

Priority P3:
- Add a route-level a11y smoke test that fails on duplicate `main` landmarks and unlabeled interactive controls.

## Acceptance criteria for follow-up tasks

1. Touch targets:
- Mobile Playwright assertion confirms no interactive controls below 44x44 on audited routes.
- Manual spot-check shows language and icon controls meet the minimum.

2. Landmarks/semantics:
- Exactly one visible `main` landmark per page route (`/guide`, `/learn`, `/examples` included).
- Existing navigation remains keyboard accessible after layout updates.

3. Contrast:
- `Advanced` and `Pro` labels meet WCAG AA contrast >= 4.5:1 in final UI styles.
- Visual regression snapshots unchanged except expected token/style updates.

4. Regression prevention:
- CI includes at least one automated a11y smoke test for unlabeled controls + duplicate `main` landmark.
