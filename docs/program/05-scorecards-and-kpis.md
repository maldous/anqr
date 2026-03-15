# Scorecards and KPIs

## Objective
Score the **product** and the **harness (AI pipeline)** separately.

Product KPIs measure **user-facing quality, correctness, and adoption**.  
Harness KPIs measure **how well the autonomous engineering system operates**.

---

# Product KPIs

## Test pass rate
- Why it matters:
Ensures the codebase remains correct and prevents regressions.

- Source of truth:
CI pipeline test results (GitHub CI / test runners)

- Target:
100%

- Alert threshold:
Anything < 100% on main branch

---

## Parity pass rate
- Why it matters:
QR generation must produce **identical output across Web, API, Android, and iOS**.

- Source of truth:
Automated parity test suite and gallery comparison outputs

- Target:
100% before release readiness

- Alert threshold:
Below 95% or any regression in previously passing tests

---

## Performance budget adherence
- Why it matters:
QR generation must remain fast, especially on lower-end mobile devices.

- Source of truth:
Benchmark tests and runtime telemetry

- Target:
Within defined performance budgets

- Alert threshold:
Performance degradation greater than 20% from baseline

---

## Crash / error rate
- Why it matters:
Stability directly affects user trust.

- Source of truth:
Sentry error monitoring

- Target:
Near-zero crash rate

- Alert threshold:
Any significant spike or post-deployment increase in errors

---

## Key user journey completion
- Why it matters:
The core journey is **generate → export/share QR code**.

- Source of truth:
Google Analytics event tracking such as:
- export events
- download events
- share actions
- screenshot detection proxies

- Target:
High completion rate for generation sessions

- Alert threshold:
Drop greater than 25% compared with historical baseline

---

## Retention / conversion proxies
- Why it matters:
Indicates whether users return and continue generating QR codes.

- Source of truth:
Google Analytics and related analytics APIs

- Target:
Stable or increasing returning-user trends

- Alert threshold:
Sustained decline in returning users or QR generation volume

---

## Release readiness
- Why it matters:
Ensures a release meets required stability, parity, and performance gates.

- Source of truth:
CI results, parity checks, performance benchmarks, and release checklist

- Target:
All release gates satisfied before production deployment

- Alert threshold:
Any failed release gate

---

## Trust / privacy incidents
- Why it matters:
User trust and anonymity are core goals of ANQR.

- Source of truth:
Security reviews, incident reports, and issue tracker alerts

- Target:
Zero incidents

- Alert threshold:
Any confirmed privacy or trust breach

---

# Harness KPIs

## Task throughput
- Why it matters:
Measures how effectively the autonomous engineering system performs work.

- Source of truth:
Issue tracker metrics and pipeline execution logs

- Target:
Stable and consistent task completion

- Alert threshold:
Sustained drop in completed tasks

---

## False-positive issue rate
- Why it matters:
Prevents automation from generating excessive noise.

- Source of truth:
Issue tracker classification and review

- Target:
Very low rate

- Alert threshold:
More than 10% of issues classified as false positives

---

## False-complete rate
- Why it matters:
Ensures automation actually solves problems rather than marking them complete incorrectly.

- Source of truth:
Issue reopen events and verification failures

- Target:
Near zero

- Alert threshold:
Repeated issue reopenings

---

## Retry success rate
- Why it matters:
Temporary failures should be recoverable automatically.

- Source of truth:
Pipeline retry logs

- Target:
High retry success rate

- Alert threshold:
Repeated retry failures or retry loops

---

## Model / provider reliability
- Why it matters:
The harness depends on external AI model providers.

- Source of truth:
Provider health checks and pipeline logs

- Target:
Provider state mostly **healthy**

- Alert threshold:
Provider marked **degraded**, **blocked**, or **disabled**

---

## Average latency per run
- Why it matters:
Pipeline responsiveness affects development velocity.

- Source of truth:
Pipeline runtime telemetry

- Target:
Stable average runtime

- Alert threshold:
Latency increase greater than 50% from baseline

---

## Cost per successful task
- Why it matters:
ANQR aims to operate as a **zero-cost or minimal-cost system**.

- Source of truth:
Provider usage metrics and billing data

- Target:
Zero cost where possible

- Alert threshold:
Any unexpected paid model usage

---

## Watchdog interventions
- Why it matters:
Frequent watchdog interventions indicate instability.

- Source of truth:
Watchdog monitoring logs

- Target:
Rare occurrences

- Alert threshold:
Repeated watchdog triggers

---

## Mean time to recovery (MTTR)
- Why it matters:
Measures how quickly the system recovers from failures.

- Source of truth:
Incident logs and monitoring systems

- Target:
Rapid automated recovery

- Alert threshold:
Recovery time exceeding expected thresholds

---

## Human override rate
- Why it matters:
High override rates indicate the autonomous system cannot safely resolve issues.

- Source of truth:
Issue tracker override records and manual interventions

- Target:
Low override frequency

- Alert threshold:
Increasing trend of human intervention
