# ADR 0017 — Wiring audit pass 2: deferrals

## Status

Accepted — 2026-05-25

## Context

A second deep wiring audit of `apps/web/src/features/generator/` followed
the pass-1 cleanup (commits `b851ea7c7` → `ee9c6d156`, which shipped
B1-B14 and P1). Pass-1 removed dead UI controls and fixed value-range
miswiring. Pass-2 looked for the inverse: state that is consumed by the
renderer but has no UI, and partially-implemented features whose
controls were dropped.

Four findings emerged.

| # | Finding | Disposition |
|---|---------|-------------|
| 1 | `render.frameTextColor` consumed by `draw-frame.ts:51` (`config.frameTextColor \|\| config.fgColor`) but no UI | **Fixed in this commit** |
| 2 | `render.frameColor` consumed by `draw-frame-background.ts:16` (`config.frameColor \|\| config.bgColor`) but no UI | **Fixed in this commit** |
| 3 | `overlay.qrartFragmentLength` set in store, plumbed through use-qr-generator, but no `FragmentSearchConfig` is ever constructed in the application layer | **Deferred** — see below |
| 4 | Gradient stops array: `createGradientFill` reads `config.gradient.stops` (auto-seeded by setRenderGradient since B2), but no UI lets the user add, remove, or position individual stops | **Deferred** — see below |

## Decisions

### Fixed: frame colour controls (#1, #2)

Added `frameColor` and `frameTextColor` fields to `render` state with
empty-string default. Empty string means "inherit", letting the renderer's
existing fallback chain (`frameColor || bgColor`, `frameTextColor ||
fgColor`) keep working unchanged. Two colour-picker controls appear in
`render-section.tsx` whenever `frameStyle !== "none"`, and both feed
`use-qr-generator.tsx`'s config object — converting `""` to `undefined`
so the renderer fallback triggers cleanly rather than receiving an empty
string.

### Deferred: `qrartFragmentLength` is dead end (#3)

`packages/domain/qr/src/qart/fragment-search.ts` accepts a
`FragmentSearchConfig` containing `fragmentLength`, but no caller in the
application or domain layer constructs that config. The actual q-art
pipeline (`execute-q-art-worker-pipeline.service.ts`) builds its own
`qartConfig` shape without any fragment-search machinery. So
`qrartFragmentLength` is currently:

- typed in `qr-generator-config.ts`
- defaulted to `8` in `default-overlay.ts`
- forwarded from store → `use-qr-generator.tsx` line 635 into a config
  object that nothing then reads

Removing it would touch the contract spec (`qr-overlay-options.contract.ts`,
`generator-contracts.spec.ts`) and could break share-URL roundtrips for
existing bookmarks containing `qrartFL=` params. The risk-to-reward
ratio doesn't justify a removal commit. The field is invisible to users
(no UI), so it doesn't mislead anyone. Keep as a tracked orphan; remove
during the next contract revision when share-URL versioning is updated.

`qrartSeed`, by contrast, **is** wired (`searchSeed:
qrartSeed ?? 0` in `execute-q-art-worker-pipeline.service.ts:95`).
Currently no UI surfaces it; adding a seed input would make q-art
generation reproducible. Tracked but not in this commit.

### Deferred: gradient stops editor (#4)

`drawing-gradients.ts:23-32` reads `gradient.stops` and calls
`gradient.addColorStop()` per stop, falling back to a 2-stop fg→bg
gradient if `stops` is empty. B2 already wired the empty-stops case
(setter seeds defaults on type flip), so the basic gradient appears.
But there's no UI to:

- add a third (or nth) colour stop
- pick the colour of each stop
- adjust each stop's `pos` (0-1 along the gradient)
- delete a stop
- reorder stops

Building this requires a small interactive widget (drag handles on a
linear axis, per-stop colour picker, add/delete buttons). It's a
~half-day UI task with thoughtful UX, not a small fix. Tracked as a
follow-up — track in Linear under the generator UI epic when stops
become a customer ask.

For now, the gradient produces a usable two-colour result and the
underlying state shape already supports n stops, so a future editor
slots in without further refactor.

## Consequences

- One commit ships the two fixes plus this ADR (minimises Codemagic
  builds per maintainer constraint).
- `qrartFragmentLength` remains in state, contracts, and share URLs but
  is documented as a no-op input — anyone touching the q-art pipeline
  knows to either wire it or remove it during the next contract bump.
- A future contributor wanting reproducible q-art has a clear next step:
  add a `qrartSeed` numeric input next to the q-art prompt control.
- The gradient stops editor is on the radar with the design space
  pre-described; no one needs to re-audit to find what's missing.

## Related

- ADR 0014 (defer error-diffusion SoA refactor) — same "ship the trace,
  defer the build" pattern.
- Commits `b851ea7c7` … `ee9c6d156` — pass-1 wiring fixes.
