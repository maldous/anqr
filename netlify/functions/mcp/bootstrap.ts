import { bootstrapNodeRenderRuntime } from "../shared/bootstrap-node-render-runtime";

bootstrapNodeRenderRuntime({
  sentryDsn: process.env.SENTRY_DSN || process.env.MCP_SENTRY_DSN,
});
