# ADR-0015 Client/Server Frame-Loop Contract

- Status: Accepted
- Date: 2026-05-25

## Context

ANQR has two parallel implementations of the per-frame animation render
loop: one that runs in the browser via `@/application/generator/frames`
(`executeFrameGenerationLoop` → `processAndPostProcessFrame`), and one
that runs in the Netlify `qr` function via
`@/application/generator/server/render-runtime` (`renderFrameSequence`).

The 2026-05-24 perf review (F13) flagged a subtle drift between the
two:

- Server applies temporal noise inside `applyResultEffectsForFrameHelper`
  (a single helper covering result effects + temporal noise).
- Client splits temporal noise across `applyResultEphemeral`,
  `processAnimationFrameLoopIteration`, and `applyFramePostProcessing`.
- Server applies the watermark inside `scaleAndWatermarkFrame` per frame.
- Client applies the watermark via `applyWatermarkToCanvas` AFTER
  color-cycle.
- Color-cycle ordering is also different between the two paths.

Currently both produce visually equivalent output for the cases in our
permutation suite, but the divergence has no safety net: a future
addition (a new animation pattern, a new effect, a reordering of the
result-effects stack) lands on one side and not the other, and we don't
notice until a user reports a discrepancy.

## Decision

Treat the per-frame pipeline as a contract documented in this ADR.
Both implementations MUST apply the following stages in the listed
order for every frame `i` of `totalFrames`:

| # | Stage                              | Notes                                                                |
|---|------------------------------------|----------------------------------------------------------------------|
| 1 | Resolve module input               | `getModuleInput(frame, i)` or its client equivalent.                 |
| 2 | Apply module-animation effects     | `applyAnimationEffectsToCanvas*(input, moduleEffects, i, total)`.    |
| 3 | Frame interpolation (module input) | `applyFrameInterpolation(current, previousRaw, mode)`.               |
| 4 | Apply module animation to config   | Per-frame jitter, etc., into the render config.                      |
| 5 | Render frame                       | `renderFrame(input, i, config)`.                                     |
| 6 | Apply result-animation effects     | INCLUDES temporal noise. Single helper, not split.                   |
| 7 | Frame interpolation (rendered)     | `applyFrameInterpolation(frameOut, previousRendered, mode)`.         |
| 8 | Color-cycle                        | Only if enabled; in-place on the rendered frame.                     |
| 9 | Scale + watermark                  | Single call. `scaleAndWatermarkFrame` is the canonical name.         |
| 10| Finalize                            | Encode/serialize/push to result list.                                |

`previousRaw` is the un-rendered module input from the prior iteration;
`previousRendered` is the rendered frame from the prior iteration. Both
must be reset to `null` before iteration begins.

The server path's `applyResultEffectsForFrameHelper` is canonical — it
applies result effects + temporal noise + interpolation in the order
above. Client code that currently splits these MUST be refactored to call
the same helper (or a thin wrapper that re-uses the helper's body) so
both paths execute identical code for stages 6–8.

## Implementation

Two follow-ups, neither blocking this ADR:

1. Extract `applyResultEffectsForFrameHelper` into a shared
   `@/domain/render/animation/apply-result-effects-for-frame` module
   so it can be invoked from both the server and client loops without
   duplication.
2. Add a unit spec (`packages/domain/render/src/animation/frame-loop-contract.spec.ts`)
   that imports the server loop AND the client loop and asserts they
   call the same pipeline functions in the same order for a trivial
   one-frame input. The spec is permitted to be hermetic — no canvas
   rendering — by mocking the helpers and asserting call order.

The spec is a "contract test" in the literal sense: it fails if either
loop adds, removes, or reorders a stage relative to this ADR.

## Consequences

- Future effect additions have a documented landing point. New effect
  goes between stages 6 and 8 (after rendering, before scale/watermark)
  unless it's a module-input transform (then between stages 1 and 3) or
  a finalize-time concern (stage 10).
- The "subtle drift" risk from the review is documented and quantified
  rather than implicit. A reader can diff their proposed change against
  this table.
- The unit-spec follow-up gives us a programmatic regression catch.
- We accept that until follow-up #2 lands, the contract is enforced by
  review discipline, not tests.

## References

- `docs/review-2026-05-24/agent-a-render.md` — F13
- `packages/application/generator/src/server/render-runtime/render-frame-sequence.ts`
- `packages/application/generator/src/frames/execute-frame-generation-loop.service.ts`
- `packages/application/generator/src/frames/process-and-post-process-frame.service.ts`
- `packages/domain/render/src/server/apply-result-effects-for-frame-helper.ts`
