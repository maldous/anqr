# ADR-0014 Defer Error-Diffusion SoA Refactor Until Profiled

- Status: Accepted
- Date: 2026-05-25

## Context

The 2026-05-24 performance review (`docs/review-2026-05-24/agent-a-render.md`,
finding F7/F12) flagged the error-diffusion pixel storage as the largest
single perf win available in the render pipeline: convert the current
Array-of-Structs (`{ r, g, b, a }` per pixel, accumulated as plain JS
objects in nested arrays) to Structs-of-Arrays (four `Float32Array`s,
one per channel).

The expected wins are real:

- Single `Float32Array.set()` per dither pass instead of per-pixel object
  allocation.
- Cache-friendly sequential reads (a single channel's data is contiguous
  in memory; reads across pixels for one channel hit the same cache line).
- Numeric stability without per-pixel boxing.

For an overlay-dithered render the dither pipeline runs on every output
frame (60+ times for an animated GIF), so the theoretical multiplier is
non-trivial.

## Decision

**Defer the SoA refactor until a profile justifies it. Do NOT take it on
speculatively.**

Three reasons:

1. **Blast radius is large.** Every `quantize*Pixel` callback would
   change signature (currently takes the AoS struct; would take indices
   into the SoA arrays). The kernel-walk loop in
   `distribute-error-with-kernel.ts` would change shape. Every dither
   matrix entry (ordered, blue-noise, Floyd-Steinberg, Jarvis, Stucki,
   Burkes, Sierra, Atkinson) would need its consumer updated.
2. **Smaller wins shipped first reduce the marginal payoff.**
   Items A-F1 (prepared typed-array kernels), A-F4 (drop the redundant
   color-cycle clone), A-F5 (defensive guard removal), A-F6 (hoisted
   temporal-noise row term), and A-F2 (single ImageData wave shift) have
   landed. Those eliminated the per-pixel division in the kernel walk,
   one full-frame `drawImage` per animated frame, the defensive
   `if (!errors[ny])` check, the per-pixel `i % width` / `Math.floor(...)`
   in temporal noise, and up to 1024 sub-pixel `drawImage` calls per
   wave frame. The SoA refactor's incremental value relative to the
   already-shipped wins is unknown without measurement.
3. **The unit-test suite covers the dither paths thoroughly (≈4830
   tests, of which ≈510 are render-domain).** A blast-radius refactor
   needs a profile + benchmark to justify; we now have
   `render-server-qr-output.bench.ts` and the
   `encode-decode-roundtrip.spec.ts` permutation safety net (E-R3 / S1),
   so when we do take this on we can measure before/after and detect
   numeric drift.

## What would unblock taking the refactor on

In order of cheapness:

- A profile from a representative production-shaped render workload
  (`renderBasicServerQROutput` with overlay + Floyd-Steinberg dither at
  512px) showing dither time is `≥ 30%` of the total render budget. The
  bench harness from L9 is the place to run this — extend with a heavy
  overlay-dither case and capture `--profile` output.
- A side-by-side prototype that converts ONE kernel (Floyd-Steinberg
  alone) to SoA and ships behind a `RENDER_SOA_DITHER=1` env flag, with
  a benchmark comparison against the current implementation. If the
  prototype shows ≥20% reduction at the bench level and the visual diff
  is empty (byte-identical PNG output across the existing permutation
  suite), the refactor is justified.
- An ADR amendment locking in the new pixel-storage type and the
  callback-signature change so consumers can prepare.

## Consequences

- The render pipeline stays AoS until the bench data justifies the
  switch. Code stays readable to the team that knows the current shape.
- We accept the existing per-pixel allocation cost on the dither path.
  Quantified estimate from review: a 512px Floyd-Steinberg pass
  allocates ~262K small objects (4 weights × 256² pixels); for Jarvis
  that's ~786K. Garbage-collection pressure on the worker thread.
- The L9 bench is the canary. If a future change makes dither slower
  enough that the bench drops below a tolerance band, we have data
  forcing the conversation.
- The deferral does not block the other L-block items. L1 (`apps/web`
  unit-test substrate), L4 (frame-loop contract ADR), L6 (qr-store
  defaults extraction), L7 (rate-limit Blobs migration), and L10
  (visual regression snapshots) all proceed independently.

## References

- `docs/review-2026-05-24/agent-a-render.md` — full audit
- `docs/review-2026-05-24.md` (L5 / S12 / F7 / F12 entries)
- `packages/domain/render/src/dither/distribute-error-with-kernel.ts`
- `packages/application/generator/src/server/render-server-qr-output.bench.ts`
- `packages/domain/qr/src/encode-decode-roundtrip.spec.ts`
