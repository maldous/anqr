export interface TelemetryContext {
  serviceName: string;
  serviceVersion: string;
  release: string;
  environment: string;
  runtime: string;
  traceId: string;
  spanId: string;
  sessionId: string;
  userIdHash: string;
  feature: string;
}
