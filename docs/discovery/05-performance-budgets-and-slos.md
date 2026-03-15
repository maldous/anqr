# Performance Budgets and SLOs

## Objective
Make performance and reliability explicit.

---

# Product budgets

### Initial load budget
- Target: ≤ 2 seconds on broadband
- Mobile target: ≤ 3 seconds on average devices
- Maximum acceptable: 4 seconds

Reason:
Landing page must allow users to generate a QR code immediately.

---

### Interaction latency budget
- UI response: ≤ 100 ms
- UI update after setting change: ≤ 200 ms

Reason:
Customization controls must feel instantaneous.

---

### Render time budget (QR generation)

- Standard QR: ≤ 200 ms
- Styled QR: ≤ 500 ms
- Complex overlay / animation: ≤ 1 second

Reason:
Users expect immediate feedback while customizing.

---

### Worker time budget

Background tasks including:

- gallery generation
- scan validation
- analysis

Targets:

- typical: ≤ 2 seconds
- maximum: ≤ 5 seconds

---

### Memory budget

Web browser:

- typical memory usage: ≤ 150 MB
- maximum acceptable: ≤ 300 MB

Mobile devices:

- target: ≤ 100 MB
- maximum acceptable: ≤ 200 MB

Reason:
Must function on lower-end mobile devices.

---

### Mobile crash / error threshold

Target:

- crash rate < 0.5%

Alert threshold:

- crash rate > 1%

Measured via:

- Sentry crash analytics

---

# Harness budgets

### Task latency budget

Typical automation task completion:

- target: ≤ 10 minutes
- acceptable: ≤ 30 minutes

Examples:

- issue analysis
- automated refactor
- PR creation

---

### Retry ceiling

Automatic retry attempts:

- max retries: 3

Retry strategy:

- exponential backoff
- watchdog escalation after final failure

---

### Watchdog response window

Failure detection:

- target: ≤ 2 minutes

Automatic recovery attempt:

- ≤ 5 minutes

Examples:

- stuck pipeline
- dead service
- retry queue overflow

---

### Model timeout budget

Local models:

- timeout: 60 seconds

Hosted models:

- timeout: 30 seconds

Fallback behavior:

- provider rotation
- local model fallback

---

### Queue depth thresholds

Retry queue:

- healthy: < 5 tasks
- warning: ≥ 5 tasks
- critical: ≥ 10 tasks

Action:

- guardian intervention
- escalation to operator if sustained

---

### Reporting cadence

Weekly report required including:

- engineering status
- product KPIs
- harness KPIs
- cost metrics
- growth signals

Generated:

- automatically by harness

---

# SLOs

### Availability target

Target:

- 99.9% uptime

Measured for:

- web platform
- API endpoints

---

### Success rate target

QR generation success:

- target ≥ 99.9%

Measured as:

- successful QR generation events

---

### MTTR target (Mean Time To Recovery)

Target:

- ≤ 15 minutes for recoverable incidents

Examples:

- pipeline failures
- deploy regressions
- infrastructure issues

---

### Alert thresholds

Alerts triggered when:

Error rate:

- > 2% generation failures

Crash rate:

- > 1%

Performance regression:

- > 20% slower than baseline

Harness instability:

- repeated retry loops
- watchdog triggers > 3 per hour

Queue backlog:

- retry queue ≥ 10 tasks

Provider instability:

- AI provider degraded or blocked

