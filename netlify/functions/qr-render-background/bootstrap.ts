import * as Sentry from "@sentry/node";
import pkg from "../../../package.json";

Sentry.init({
  dsn: "https://6935e811c47169e037e31209f2d46fbd@o4510808522489856.ingest.us.sentry.io/4510808547917824",
  release: `anqr@${pkg.version}`,
  tracesSampleRate: 0.1,
  environment: "production",
});
