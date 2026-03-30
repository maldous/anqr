import type { TelemetryContext } from "./types";

export const telemetryContext: TelemetryContext = {
  serviceName: "ANQR",
  serviceVersion: "1.0.0",
  release: "1.0.0",
  environment: "local",
  runtime: "web",
  traceId: "",
  spanId: "",
  sessionId: "",
  userIdHash: "",
  feature: "",
};
