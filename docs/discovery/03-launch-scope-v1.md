# Launch Scope v1

## Objective
Define exactly what 1.0 includes and excludes.

---

# Required features

### Feature:
QR generation engine (standard, animated, overlays, customization)

- Why required:
Core purpose of ANQR — platform must generate reliable, customizable QR codes.

- Platform(s):
Web, API, Android, iOS

- Launch critical?:
Yes

---

### Feature:
QR analysis / scan safety diagnostics

- Why required:
Ensures QR codes remain scannable and allows users to validate overlays and styling.

- Platform(s):
Web, Android, iOS, API

- Launch critical?:
Yes

---

### Feature:
Platform parity

- Why required:
QR codes must render identically across web, API, Android, and iOS.

- Platform(s):
Web, API, Android, iOS

- Launch critical?:
Yes

---

### Feature:
Gallery generation system

- Why required:
Provides automated demonstrations of QR capabilities and validates rendering.

- Platform(s):
Web

- Launch critical?:
Yes

---

### Feature:
Export / sharing capabilities

- Why required:
Core user journey is **generate → export/share QR code**.

- Platform(s):
Web, Android, iOS

- Launch critical?:
Yes

---

### Feature:
Observability

- Why required:
System must remain observable and diagnosable.

Includes:

- Sentry error monitoring
- uptime monitoring
- telemetry signals

- Platform(s):
Web, API, Android, iOS, Harness

- Launch critical?:
Yes

---

### Feature:
Analytics instrumentation

- Why required:
Measure usage, growth, and user journeys.

- Platform(s):
Web, Android, iOS

- Launch critical?:
Yes

---

### Feature:
Ad monetization

- Why required:
Primary revenue model for 1.0.

- Platform(s):
Web, Android

- Launch critical?:
No (can launch without ads initially)

---

### Feature:
AI harness automation

- Why required:
Core architectural goal is continuous improvement through autonomous engineering.

Includes:

- issue analysis
- automated code changes
- CI verification
- retry pipelines
- watchdog recovery

- Platform(s):
Harness / local automation

- Launch critical?:
Yes

---

### Feature:
Self-healing pipeline

- Why required:
System must recover from transient failures automatically.

- Platform(s):
Harness / CI

- Launch critical?:
Yes

---

### Feature:
Test automation

Includes:

- unit tests
- E2E tests
- parity validation

- Why required:
Required to maintain deterministic QR generation.

- Platform(s):
Web, Android, iOS, API

- Launch critical?:
Yes

---

### Feature:
Performance optimization for mobile devices

- Why required:
QR rendering must work on lower-end devices.

- Platform(s):
Web mobile, Android, iOS

- Launch critical?:
Yes

---

# Deferred features

### Feature:
Enterprise authentication and API rate limiting

- Why deferred:
1.0 focuses on anonymous QR generation.

- Revisit milestone:
1.1 / enterprise edition

---

### Feature:
Enterprise integrations

Examples:

- CRM integrations
- enterprise APIs
- partner systems

- Why deferred:
Not required for consumer launch.

- Revisit milestone:
Post-1.0 growth phase

---

### Feature:
Advanced account system

- Why deferred:
Product designed for anonymous usage initially.

- Revisit milestone:
Future SaaS expansion

---

### Feature:
AI-assisted QR generation

- Why deferred:
Experimental and not necessary for initial stability.

- Revisit milestone:
1.x experimental features

---

### Feature:
Complex marketing automation

- Why deferred:
Initial marketing can rely on SEO and organic discovery.

- Revisit milestone:
Growth phase

---

### Feature:
Advanced analytics / ML insights

- Why deferred:
Requires larger user base.

- Revisit milestone:
After traffic scale

---

# Launch blockers

### Blocker:
Cross-platform QR parity not verified

- Owner:
Engineering

- Evidence to clear:
Automated parity tests passing across Web / Android / iOS / API

---

### Blocker:
QR scan reliability not validated across devices

- Owner:
Engineering / QA

- Evidence to clear:
Scan tests on multiple device classes and QR scanning apps

---

### Blocker:
Performance degradation on mobile devices

- Owner:
Engineering

- Evidence to clear:
Benchmark results within defined performance budgets

---

### Blocker:
Critical runtime errors

- Owner:
Reliability / Engineering

- Evidence to clear:
Sentry error rate stable and near zero

---

### Blocker:
CI pipeline instability

- Owner:
Harness

- Evidence to clear:
Stable CI runs with high pass rate

---

### Blocker:
App store submission readiness

- Owner:
Release management

- Evidence to clear:
Android build verified  
iOS TestFlight build accepted

---

### Blocker:
Monitoring gaps

- Owner:
Reliability

- Evidence to clear:
Sentry, uptime monitoring, and analytics verified operational

---

### Blocker:
Codebase maintainability

- Owner:
Engineering / Harness

- Evidence to clear:

- Sonar quality gates passing
- Cognitive complexity within thresholds
- architecture refactor complete

