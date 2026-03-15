# Corrective Healing Policy

## Objective
Define how **self-healing** (stability) and **self-improving** (evolution) changes are allowed to occur inside the ANQR autonomous system.

The policy ensures that the system can operate continuously with minimal human intervention while maintaining safety, observability, and reversibility.

---

# Self-healing

Self-healing focuses on **restoring normal operation without changing system behavior**.

Typical uses include:

- retries
- failover
- rollback
- service restarts
- issue creation
- status changes
- guardrail enforcement

Self-healing actions are intended to **stabilize the system quickly**.

---

# Self-improving

Self-improving actions modify the system to **reduce recurring problems or inefficiencies**.

Typical uses include:

- recurring friction
- repeated failure classes
- architecture drift
- UX friction
- cost inefficiency
- model/provider underperformance

Self-improving changes typically generate **issues, proposals, or pull requests** rather than directly modifying production behavior.

---

# Allowed Automatic Corrective Actions

## Action
Retry failed task

- Trigger:
Temporary failure during pipeline execution.

- Evidence:
Execution logs and retry records.

- Rollback:
Abort retry cycle and restore original task state.

- Human notification:
Only if retry attempts exceed retry limits.

---

## Action
Failover to alternate model/provider

- Trigger:
Provider state marked **degraded**, **blocked**, or **cooling-down**.

- Evidence:
Provider health monitoring and failure logs.

- Rollback:
Return to preferred provider once healthy.

- Human notification:
If failover persists beyond expected recovery time.

---

## Action
Automatic rollback of failed deployment

- Trigger:
Post-deployment monitoring detects failure signals.

Examples:
- crash spike
- build failure
- broken pipeline state

- Evidence:
Sentry alerts, CI results, deployment telemetry.

- Rollback:
Restore last known working deployment.

- Human notification:
Immediate notification when rollback occurs.

---

## Action
Restart failed services

- Trigger:
Worker, pipeline, or runtime process stops responding.

- Evidence:
System logs and health checks.

- Rollback:
Return to previous stable runtime state.

- Human notification:
Only if restart attempts repeatedly fail.

---

## Action
Create incident issue

- Trigger:
Detected failures such as:

- build failures
- deployment failures
- system incidents
- monitoring alerts

- Evidence:
Logs, traces, or monitoring data attached to issue.

- Rollback:
Issue closed once root cause resolved.

- Human notification:
Yes, via issue tracker and email if critical.

---

## Action
Update issue status

- Trigger:
Work progress detected through pipeline execution.

- Evidence:
Execution logs and commit history.

- Rollback:
Manual issue state restoration if needed.

- Human notification:
Not required.

---

## Action
Guardrail enforcement

- Trigger:
Violation of defined policy such as:

- unauthorized cost usage
- unsafe deployment attempt
- repeated failed tasks

- Evidence:
Policy enforcement logs.

- Rollback:
Cancel blocked action.

- Human notification:
Yes if policy violation persists.

---

## Action
Automated issue hygiene

- Trigger:
Issues accumulating excessive failure comments or outdated metadata.

- Evidence:
Issue history and event logs.

- Rollback:
Issue history remains preserved through version history.

- Human notification:
Not required unless issue history indicates systemic failure.

---

# Actions Requiring Approval

## Action
Production deployment

- Why:
Production changes affect users and platform availability.

- Approval owner:
Operator / CEO

- Rollback:
Immediate rollback to previous known working release.

---

## Action
Major architecture change

- Why:
Structural changes could affect long-term maintainability or platform stability.

- Approval owner:
Operator / CEO

- Rollback:
Restore previous architecture through version control.

---

## Action
User-facing UX change

- Why:
UX changes affect how users interact with the product and may require design judgment.

- Approval owner:
Operator / CEO

- Rollback:
Restore previous UI behavior or layout.

---

## Action
Major pipeline redesign

- Why:
Changes to the autonomous engineering harness could destabilize the system.

- Approval owner:
Operator / CEO

- Rollback:
Restore prior pipeline configuration.

---

## Action
Provider or model strategy change

- Why:
Switching AI providers or models may affect reliability, cost, or behavior.

- Approval owner:
Operator / CEO

- Rollback:
Return to previously configured providers.

---

## Action
Escalation of persistent failures

- Why:
If tasks fail repeatedly or issues accumulate excessive failure evidence, the system may be fundamentally misconfigured.

- Approval owner:
Operator / CEO

- Rollback:
Restore previous working configuration and close problematic issue threads.

---

# Escalation Conditions

The autonomous system must notify a human when:

- repeated retries exceed configured limits
- failures persist beyond expected recovery time
- the pipeline appears fundamentally broken
- excessive runtime friction or latency occurs
- corrective actions cannot restore stability

Notifications occur through:

- issue tracker alerts
- email notification

---

# Operating Principle

Self-healing restores **stability**.

Self-improving reduces **future friction**.

Both mechanisms must always maintain:

- observability
- reversibility
- human override capability
