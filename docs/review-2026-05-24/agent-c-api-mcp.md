# API & MCP Surface Audit — ANQR

## What's already good

The four-function split (`qr`, `api-qr`, `mcp`, `qr-render-background`) is clean — each entry point at `netlify/functions/*.ts` is a one-liner that re-exports a handler from a folder, with a `bootstrap.ts` for shared init (Sentry + canvas polyfills). The `/api/contract/qr` envelope is validated end-to-end by zod (`packages/contracts/api/src/qr-api-*.contract.ts`) on both the query and response side. The MCP server (`packages/platform/node/src/mcp/`) uses the official `@modelcontextprotocol/sdk` with `WebStandardStreamableHTTPServerTransport`, layers auth → rate-limit → audit consistently (`netlify/functions/mcp/handler.ts:5-35`), and ships JWT/JWKS/Firebase/bearer modes behind a single feature-flag config. Cache strategy is well thought out — `computeCacheKey` excludes non-cache params, blob cache lookup short-circuits the render path (`packages/platform/node/src/server/lookup-blob-cache.ts`), and degraded overlay renders are flagged with `X-ANQR-Status: generating` plus a sentinel-guarded background re-render (`trigger-background-render.ts`, `qr-render-background/handler.ts`). The SEO edge function (`netlify/edge-functions/seo/handler.ts`) correctly early-returns on static asset paths before any HTML rewrite. Security headers in `netlify.toml` are thorough (strict CSP, HSTS preload, COOP), with the API/MCP routes pinned to `Cache-Control: no-store` and `X-Robots-Tag: noindex` where appropriate.

---

## Findings

### F1 — 81 MB of `public/` images bundled into every function zip
**Confidence:** ⚡ measured · **Risk:** high (cold start) · **Effort:** low

`apps/web/.netlify/functions/*.zip` measure 95–99 MB compressed (116–128 MB uncompressed); ~81 MB of that is identical in all four bundles:

```
qr.zip / mcp.zip / api-qr.zip / qr-render-background.zip
    public/: 379 files, 81,236,968 bytes
```

Root cause is `packages/domain/render/src/server/resolve-validated-local-overlay-path.ts:20`:

```ts
: path.resolve(process.cwd(), "public");
```

NFT (the Netlify v2 function bundler) statically analyzes that literal `"public"` string concatenated with `process.cwd()` and conservatively traces the entire `public/` tree into the bundle. The branch is only reachable when `process.env.NETLIFY_DEV` is set (`read-local-overlay-file.ts:7` returns `null` otherwise), so in production **none of those 81 MB are ever read**. Cold start cost is paid on every container spin-up.

**Recommendation.** Make the path computation opaque to static analysis, or short-circuit at import time:

```ts
// resolve-validated-local-overlay-path.ts
const localOverlayRoot = process.env.ANQR_LOCAL_OVERLAY_ROOT
  ? path.resolve(process.env.ANQR_LOCAL_OVERLAY_ROOT)
  : path.resolve(process.cwd(), process.env.ANQR_LOCAL_OVERLAY_DIR ?? "public");
```

Or, safer and more explicit, gate the entire `readLocalOverlayFile`/`resolveValidatedLocalOverlayPath` codepath behind a build-time conditional so it's tree-shaken out of production bundles. Belt-and-braces: add to `netlify.toml`

```toml
[functions]
  node_bundler = "esbuild"  # ignored under v2 — see F8
  included_files = ["!public/**"]
```

`included_files` with negation IS honored by nft. Expected savings: **~324 MB shed across the four zips**, raising the headroom under Netlify's 250 MB per-function hard limit (currently each is 95–99 MB — already close to budget if other deps grow).

---

### F2 — `@sentry/node` pulls in the full OpenTelemetry instrumentation set on three functions
**Confidence:** ⚡ measured · **Risk:** medium · **Effort:** low

`qr.zip`, `mcp.zip`, and `qr-render-background.zip` each carry ~5 MB Sentry + ~5 MB OpenTelemetry — including instrumentation packages for mongodb, kafkajs, amqplib, pg, mongoose, redis, mysql, mysql2, ioredis, tedious, knex, hapi, koa, koa-* etc., none of which this app uses. Source is `netlify/functions/shared/bootstrap-node-render-runtime.ts:9`, called from all three function bootstraps. `api-qr.zip` correctly does NOT import Sentry (its handler `netlify/functions/api-qr/handler.ts` has no Sentry import) and is ~12 MB smaller as a result — proof that this is the right baseline.

**Recommendation.** In `bootstrap-node-render-runtime.ts`, restrict Sentry's default integrations:

```ts
Sentry.init({
  dsn: sentryDsn,
  defaultIntegrations: false,
  integrations: [
    Sentry.httpIntegration(),
    Sentry.onUncaughtExceptionIntegration(),
    Sentry.onUnhandledRejectionIntegration(),
  ],
  // ... rest
});
```

Or migrate to `@sentry/node-core` which omits the auto-instrumentation wrapper entirely. Expected savings: **~10 MB × 3 functions = ~30 MB compressed bundle reduction**, and a measurable cold-start improvement (fewer modules to parse + the OTEL `require-in-the-middle` shim no longer wraps `require`).

---

### F3 — `/api/contract/qr` and `/api/mcp` share a single env var, ignoring per-route policy
**Confidence:** ⚡ measured · **Risk:** medium (correctness) · **Effort:** low

`packages/platform/node/src/rate-limit/enforce-api-qr-rate-limit.ts:10` and `enforce-mcp-rate-limit.ts:10` both call the same `getRateLimitPerMinute()` (`get-rate-limit-per-minute.ts:1-4`), which reads `MCP_RATE_LIMIT_PER_MINUTE` with a default of `30`. The policy constants document very different intents:

- `api-qr-rate-limit-policy.ts:4` → `requestsPerMinute: 60`
- `mcp-rate-limit-policy.ts:4` → `requestsPerMinute: 30`

Neither hard-coded value is honored at runtime; both routes get the same limit driven by a single MCP-named env var. The api-qr policy is effectively undocumented to operators reading the env var name.

**Recommendation.** Split the getter:

```ts
// get-api-qr-rate-limit-per-minute.ts
export function getApiQrRateLimitPerMinute(): number {
  const v = Number(process.env.API_QR_RATE_LIMIT_PER_MINUTE ?? "60");
  return Number.isFinite(v) && v > 0 ? v : 60;
}
// get-mcp-rate-limit-per-minute.ts — keep existing MCP_… name and 30 default
```

Wire each enforcer to its own getter. Keep both env vars backward-compatible by treating absence as policy default.

---

### F4 — In-process Map rate limiter is per-container, not global
**Confidence:** 🔍 inferred · **Risk:** medium · **Effort:** medium

Both `enforce-api-qr-rate-limit.ts:7` and `enforce-mcp-rate-limit.ts:7` use `const requestCounts = new Map<string, RateLimitEntry>()` in module scope. Netlify functions run as ephemeral containers — under any non-trivial concurrency, multiple warm containers each maintain their own counter. Effective rate limit is `N_containers × configured_limit`. The classification in `security/api-qr-route-policy.ts` claims `perimeterOwner: "netlify"` — but Netlify Edge / DDoS protection is coarse-grained and doesn't honor these per-route counts.

**Recommendation.** Document this as best-effort defense-in-depth (not a hard ceiling). For a real ceiling, either move state to `@netlify/blobs` (writes are slow, but acceptable for ≤30 RPM/key) or accept the trade-off and add a comment that the limit is "approximate per-container, intended as an abuse speed-bump rather than a global SLA cap."

---

### F5 — Render-runtime is the 504 root cause; the architectural mitigation is wired correctly
**Confidence:** 🔍 inferred · **Risk:** medium · **Effort:** out of scope here

End-to-end flow for a slow overlay-driven render works like this:
1. First sync request hits `qr/handler.ts:31` → `processQRRequest` (`qr/process-qr-request.ts:18`). Blob cache miss, render runs synchronously inside the 10s function budget.
2. If the request is "degraded" (overlay supplied but `_fullRender` not set), `handleCacheAndResponse` returns the fast/degraded image and fires `triggerBackgroundRender` (`platform/node/src/server/trigger-background-render.ts:8`).
3. `qr-render-background/handler.ts:42` re-invokes `qrHandler` in-process with `X-ANQR-Skip-Cache: 1` under the 15-minute budget, writes the result + clears the sentinel.

This is sound. The 504 on the first complex animated-GIF call is **inside the render path itself** (`packages/application/generator/src/server/render-server-qr-output.service.ts:91` calls `generateGifAnimationFrames`, which is render-runtime — separate agent's territory). The architectural fix would be: for any request `shouldSerializeAnimatedRender(params)` returns true on, **skip the synchronous render entirely**, return a degraded placeholder immediately, and rely purely on the background function + sentinel polling. Currently `qr/handler.ts:23-31` still awaits the full synchronous render under an animation lock; that's where the 504 burns its budget.

**Recommendation (low-effort wrapper-level fix).** In `qr/handler.ts`, branch on `shouldSerializeAnimatedRender(params) && !p.isFullRender`. When true, skip `processQRRequest`, immediately return a 202-equivalent degraded placeholder (the cached "still" version of the QR if available, otherwise a basic-style render of just the QR with `X-ANQR-Status: generating`), and trigger the background render directly. The client polls the same URL until `X-ANQR-Status` disappears or `X-ANQR-Cache: hit` shows up. This converts every animated-GIF 504 into a 200-degraded + later cache hit, with no render-runtime changes.

---

### F6 — MCP transport does not explicitly negotiate `Accept`
**Confidence:** 💭 speculative · **Risk:** low · **Effort:** low

`netlify/functions/mcp/handler.ts:20-23` constructs `WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true })`. The MCP spec requires clients to send `Accept: application/json, text/event-stream` for streamable HTTP; the SDK *should* enforce this, but the handler doesn't add a defense-in-depth check. Worth verifying by sending a request with `Accept: */*` and confirming the SDK returns 406 rather than guessing the response format.

**Recommendation.** Either confirm the SDK enforces Accept negotiation (and document) or add an explicit pre-check in the handler:

```ts
const accept = request.headers.get("accept") ?? "";
if (request.method === "POST" && !/(application\/json|text\/event-stream)/.test(accept)) {
  return new Response("Not Acceptable", { status: 406 });
}
```

Also note: `Cache-Control: no-store` is set in `netlify.toml` for `/api/mcp` (good), but no explicit `Vary: Accept, Authorization` — for proxies in the middle, this could matter if the SDK ever picks different response shapes per Accept header.

---

### F7 — `/api/contract/qr` doesn't advertise WEBP/GIF; envelope is PNG/SVG only
**Confidence:** ⚡ measured · **Risk:** low · **Effort:** medium

`qr-api-query.contract.ts:26` restricts `format` to `["png", "svg"]`; `qr-api-success.contract.ts:7` restricts the response `format` field to the same enum. Meanwhile the `/api/qr` (raw image) endpoint via `qr/parse-output-params.ts:43-47` accepts any `format` query string and passes it to the renderer, which supports `webp`, `gif`, and several others. The contract envelope endpoint is more restricted than its sibling — that's a feature gap rather than a bug, but it limits what AI agents and SDK clients can request via the typed API. Base64 envelope also imposes the standard ~33% size overhead vs the raw endpoint, which matters for large WEBP/GIF outputs — by design, since the envelope is the typed surface; not a bug.

**Recommendation.** Expand the contract format enum to mirror what `renderBasicServerQROutput` actually supports (`["png", "svg", "webp", "gif", "jpeg"]`), regenerate `public/openapi.yaml` (currently 1697 bytes, almost certainly stale), and update `qr-api-success.contract.ts` to permit those formats in the response. Don't change the wire encoding (`base64`) — that's a public contract; if you ever want raw bytes, add a v2 contract that returns `Content-Type: application/octet-stream` with the image bytes as the body and `X-ANQR-Format`/`X-ANQR-Mime-Type` headers, leaving v1 base64 alone.

---

### F8 — `node_bundler = "esbuild"` in `netlify.toml` is dead config
**Confidence:** ⚡ measured · **Risk:** low (documentation) · **Effort:** trivial

`apps/web/.netlify/functions/manifest.json` shows every function bundled with `"bundler":"nft"` and `"runtimeAPIVersion":2`. The four functions all use the Netlify v2 signature (`export default async function handler(request: Request)`), and v2 forces nft regardless of the `node_bundler` directive. The `netlify.toml:35` line `node_bundler = "esbuild"` is silently ignored. This isn't a bug, but it's a misleading config that suggests a tree-shaking pass is happening when it isn't.

**Recommendation.** Either delete `[functions] node_bundler = "esbuild"` and replace with a comment explaining v2 uses nft, or migrate one function (start with `api-qr`, the smallest) back to v1 (`export const handler = (event, context) => …`) to actually get esbuild bundling and use it as the baseline for how small the surface could be. Don't churn this without measuring — fixes from F1/F2 likely deliver more.

---

### F9 — SEO edge function runs on `/*` but early-returns correctly
**Confidence:** ⚡ measured · **Risk:** low · **Effort:** none recommended

`edge-functions/seo/config.const.ts:1` declares `{ path: "/*" }`, meaning the edge function is invoked on every request including `/api/*` and `/.netlify/*`. The handler's first block (`handler.ts:14-26`) correctly early-returns on these prefixes via `context.next()`. The previous "edge-bundler confused" bug must have been a different symptom — the current code is sound. Note that `/api/qr` and `/api/contract/qr` are listed under the prefix check, so the SEO function adds an extra hop but no measurable latency. Don't narrow the `path` glob: per-route paths would be harder to maintain than the current allowlist-by-prefix in the handler.

**One micro-nit:** the regex on `handler.ts:23` doesn't include `.avif` or `.heic`. Low risk; add when those formats start serving from `/public`.

---

### F10 — `triggerBackgroundRender` fires a `fetch` without `await` and with no result handling beyond a log
**Confidence:** ⚡ measured · **Risk:** low · **Effort:** low

`packages/platform/node/src/server/trigger-background-render.ts:36-40` does:

```ts
fetch(`${siteUrl}/.netlify/functions/qr-render-background`, { ... })
  .then((r) => qrFnLog("[BG:TRIGGER]", r.status));
```

This is fire-and-forget by design (the parent function must return quickly), but in Netlify v2 the function's event loop may be frozen after the `Response` is returned. If the `fetch` hasn't been initiated yet when the handler returns, it'll never go out. Empirically background re-renders do work (per the operating evidence), suggesting Netlify keeps the event loop alive long enough — but this is fragile. Also: there's no retry, and the `.then` log fires *after* the parent has returned, so its output likely never makes it to logs.

**Recommendation.** Use `request.signal` propagation or Netlify's [`context.waitUntil`](https://docs.netlify.com/edge-functions/api/#waituntil) pattern — but for non-edge functions, the safest pattern is to `await fetch(...).catch(() => {})` before returning. The latency cost is one DNS+TCP+TLS round-trip to the same Netlify origin; on warm containers this is sub-100ms and it guarantees the request is sent.

---

## Recommendations ranked by ROI

1. **F1 — Exclude `public/` from function bundles.** ~324 MB of cold-start payload across four functions, sheds in <30 minutes of work. Either edit `resolve-validated-local-overlay-path.ts:20` to use an env-var fallback that NFT can't statically resolve, OR add `[functions] included_files = ["!public/**"]` to `netlify.toml`. Verify with a fresh `netlify build` and `unzip -l`. Best single-knob improvement in the audit.
2. **F2 — Trim Sentry default integrations.** ~30 MB across three functions, plus measurable cold-start improvement from skipping the `require-in-the-middle` instrumentation wrapper. Change is local to `netlify/functions/shared/bootstrap-node-render-runtime.ts`.
3. **F3 — Split rate-limit env vars per route.** Real correctness bug — operator-set `MCP_RATE_LIMIT_PER_MINUTE` silently affects both `/api/contract/qr` and `/api/mcp`. Three small files to add, four lines to edit. Document in `netlify/functions/README.md`.
4. **F5 — Short-circuit animated GIF renders to background-only.** Fixes the 504 class of failures without touching render-runtime internals. Wrap `qr/handler.ts` to detect `shouldSerializeAnimatedRender && !isFullRender`, immediately return a degraded placeholder + trigger background. Coordinate with the render-runtime owner on what "degraded placeholder" should look like for animated requests.
5. **F7 — Expand contract format enum + regenerate OpenAPI.** Surface parity between `/api/qr` and `/api/contract/qr`. Touches `qr-api-query.contract.ts`, `qr-api-success.contract.ts`, and the OpenAPI generator output. Low risk if existing keys remain valid.
6. **F4 — Move rate-limit state to Netlify Blobs (or document limitation).** Pure architectural concern; in-process Map is acceptable as best-effort. Either upgrade or document the perimeter ownership clearly.
7. **F10 — Await the background-render `fetch` before returning.** One-line change, eliminates a fragility class. Adds ≤100ms latency on the degraded-response path; acceptable.
8. **F6 — Explicit Accept negotiation on MCP handler.** Defensive; verify SDK behavior first.
9. **F8 — Delete dead `node_bundler = "esbuild"` config line.** Documentation hygiene.
10. **F9 — No change required.** Audit-only note that the SEO function is correctly scoped.
