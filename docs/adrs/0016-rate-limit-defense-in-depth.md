# ADR-0016 Rate Limit Is Defense-in-Depth, Not a Hard Ceiling

- Status: Accepted
- Date: 2026-05-25

## Context

The `/api/qr` and `/api/mcp` rate limits in
`packages/platform/node/src/rate-limit/` use a per-container in-memory
`Map<clientKey, { count, resetAtMs }>`. Netlify's serverless model
spawns multiple containers per region under load; a single client
hitting different containers gets independent counters per container.

The 2026-05-24 review (C-F4) called this out: the in-memory limit is
"approximate" and the effective per-client ceiling is `N × limit` where
N is the number of warm containers. Review offered two paths:

1. Migrate to Netlify Blobs for a real, shared ceiling.
2. Document the limit explicitly as defense-in-depth and accept the
   approximate semantics.

## Decision

**Accept the approximate semantics. Don't migrate to Blobs.**

Two reasons:

- Cost: every rate-limit check would do a Blobs read + write. At
  Netlify's published latency (~20-50ms cold; ~10ms warm) for blob
  reads, every API request gets that much extra latency. For an
  endpoint whose median response time is already ~50-200ms, that's a
  10-40% tax. We pay it on every request — even ones that aren't
  rate-limited.
- Spam protection is the actual goal. Real abuse patterns are obvious
  (sustained 1000+ req/min from one IP); even an approximate per-
  container limit catches those because the abuser hits one container
  enough to trigger the cap. Sophisticated abusers spreading across
  containers also spread cost across our quota, which is the natural
  back-pressure mechanism.

To make the approximate semantics observable, the rate-limit response
now emits `X-ANQR-RateLimit-Mode: approximate` on every 429 it returns.
SDK clients and dashboards can detect this and adjust their retry/
backoff strategy if needed.

The rate-limit modules carry a header comment pointing at this ADR so
future maintainers don't accidentally tighten the limit thinking it's
hard.

## What would change the decision

- If a real abuser routinely defeats the approximate cap (we see
  sustained N×limit traffic per client because they're load-balanced
  across containers), revisit the Blobs migration. The cost-benefit
  flips when there's evidence of evasion.
- If Netlify ships a cheaper / lower-latency shared-state primitive
  than Blobs, take the upgrade unconditionally.

## Consequences

- Per-client effective ceiling is `limit × warm-container-count`. At
  current traffic levels that's ~5-10× the configured limit during
  peak.
- The 429 response now exposes the mode via a header. Internal
  monitoring should track 429 frequency; a sudden drop without a code
  change is a hint that container count grew.
- The module-level comment in `enforce-api-qr-rate-limit.ts` and
  `enforce-mcp-rate-limit.ts` quotes this ADR's status so the design
  intent is in-source.

## References

- `docs/review-2026-05-24/agent-c-api-mcp.md` — C-F4
- `packages/platform/node/src/rate-limit/enforce-api-qr-rate-limit.ts`
- `packages/platform/node/src/rate-limit/enforce-mcp-rate-limit.ts`
- `packages/platform/node/src/rate-limit/create-rate-limit-response.ts`
