# Observability Standards

## Canonical standards

- OpenTelemetry = telemetry naming contract
- W3C Trace Context = propagation contract
- Sentry = exception/release/tracing investigation surface
- OWASP logging rules = redaction and exclusion baseline

## Rules

- structured logs only
- no secrets/tokens/raw PII in logs
- release/environment/runtime metadata on all runtimes
- correlation IDs where available
- one telemetry envelope across product and harness

## Minimum telemetry context

```ts
export type TelemetryContext = {
  serviceName: string
  serviceVersion: string
  release: string
  environment: 'local' | 'dev' | 'staging' | 'prod'
  runtime: 'web' | 'api' | 'android' | 'ios' | 'worker' | 'local-harness'
  traceId?: string
  spanId?: string
  sessionId?: string
  userIdHash?: string
  feature?: string
}
```
