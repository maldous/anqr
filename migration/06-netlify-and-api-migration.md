# 06. Netlify and API migration

`netlify/` is a live deployment surface. Treat it as an adapter boundary.

## 6.1 What stays in `netlify/`

- request handlers
- route/bootstrap entrypoints
- deployment-specific composition
- edge-function request metadata handling
- thin response serialization

## 6.2 What leaves `netlify/`

Move implementation logic into packages:

- QR/render/overlay/dither/image logic -> `packages/domain/render`
- QR spec/encode/decode/qart logic -> `packages/domain/qr` and `packages/domain/analyze`
- node runtime services -> `packages/platform/node`
- logging/telemetry -> `packages/observability/*`

## 6.3 Current roots to handle

- `netlify/functions/qr.ts`
- `netlify/functions/qr-render-background.ts`
- `netlify/functions/qr/**`
- `netlify/functions/qr-render-background/**`
- `netlify/edge-functions/seo.ts`
- `netlify/edge-functions/seo/**`

## 6.4 Target posture

### `netlify/functions/qr.ts`

Thin bootstrap only.

### `netlify/functions/qr/**`

Refactor into:

- request parsing adapter
- node platform adapters
- package composition
- response encoding adapter

### `netlify/functions/qr-render-background/**`

Keep as a thin background composition surface over extracted packages.

### `netlify/edge-functions/seo/**`

Move reusable SEO metadata contracts to `apps/web` or `packages/ui/web` only if genuinely reused. Keep request-edge behavior in `netlify/edge-functions`.

## 6.5 `apps/api`

Do not force a full move into `apps/api` in the first pass.

Instead:

1. create `apps/api` contracts and package manifest now
2. thin `netlify/` over packages
3. converge into `apps/api` later when the deployment model is ready
