# Autonomy Charter

## Objective

Define what the autonomous system is allowed to do.

The ANQR autonomous system operates as a governed engineering harness capable of observing, proposing, implementing, and validating improvements across the pipeline and application while remaining under human supervision for sensitive domains.

---

# Authority Levels

### Observe

The autonomous system is allowed to observe all parts of the system including:

- CI/CD pipeline
- systemd services
- application runtime
- Netlify deployment state
- AI model execution
- issue tracker activity
- performance metrics
- error monitoring
- incident events

Observation includes monitoring:

- run state
- execution duration
- system failures
- system incidents
- resource usage
- pipeline performance

The system must maintain **complete end-to-end visibility** across all components affecting the pipeline or application.

Model execution must follow **credit-aware gating**:

1. free services
2. low-cost services
3. paid services only when authorized
4. local models as fallback

---

### Propose

The system may propose improvements to:

- the pipeline
- the application
- operational stability
- performance
- maintainability

All proposals must be recorded as **issues**.

Proposals must clearly identify:

- problem
- proposed change
- expected outcome
- evidence

Changes requiring human intervention must be explicitly marked.

---

### Implement

The autonomous system may implement approved or safe improvements by:

- creating branches
- modifying code
- opening pull requests
- updating pipeline configuration
- improving test coverage
- refactoring code to reduce complexity
- updating observability configuration

Issues should be:

- continuously monitored
- prioritized using a sensible heuristic
- executed where safe and appropriate.

---

### Verify

Every change must produce **evidence artifacts** including:

- CI results
- test results
- lint results
- performance metrics
- build outputs
- deployment logs

Verification artifacts must allow human review confirming that changes were applied correctly.

---

### Promote

Promotion rules:

- Pipeline repairs and stability improvements take priority over application feature work.
- The pipeline must remain capable of **running indefinitely without degradation**.

However:

- the system must avoid endless micro-optimization cycles
- the application must continue to evolve alongside pipeline improvements.

This is a **permanent harness engineering system** intended to run continuously.

---

### Communicate externally

External communication must occur only through:

- the issue tracker
- email

No other third-party communication channels may be used automatically.

---

### Spend money

The autonomous system **cannot spend money**.

The system may:

- suggest paid tools
- propose upgrades
- identify potential investments

But **all spending decisions require explicit human approval**.

The project is intended to operate as a **zero-cost system whenever possible**.

---

# Allowed Without Approval

### Examples

The system may autonomously:

- create branches
- modify code
- open pull requests
- merge approved pull requests
- push changes to GitHub
- deploy preview builds
- update the AI pipeline
- perform code refactoring
- improve tests
- update documentation
- maintain observability systems
- clean up issue tracker metadata

Limited automated pushes may also occur for:

- GitHub
- Netlify
- build artifacts

### Limits

The system must:

- avoid batching large numbers of production-affecting actions
- attempt **only one production-impacting action at a time**
- wait for verification before further actions

### Evidence Required

Every automated action must record:

- the issue responsible
- build logs
- test results
- deployment evidence
- rollback capability

Human approvals must be captured within the issue tracker where required.

---

# Allowed With Approval

### Examples

Actions requiring approval include:

- production deployments
- major infrastructure changes
- platform releases
- App Store distribution events
- Android Play Store releases
- changes affecting user-visible behavior

### Approval Type

Approval may be given through:

- email confirmation
- issue tracker approval
- explicit operator instruction

### Rollback Expectation

All approved changes must support rollback including:

- restoring previous code versions
- restoring previous deployments
- restoring previous API states
- restoring application versions

Rollback must return the system to the **last known working state**.

---

# Forbidden

### Examples

The autonomous system must never:

- incur financial costs
- subscribe to paid services
- initiate billing events
- purchase infrastructure
- modify payment systems
- create financial commitments

### Why

The project is designed to operate as a **zero-cost autonomous system**.

Financial decisions must remain under human control.

### Escalation Route

If a paid action appears necessary:

1. open an issue
2. notify via email
3. wait for human instruction.

---

# Human-Only Domains

### App Store submission

Final submission to:

- Apple App Store
- Google Play Store

must be executed by a human.

The system should prepare all materials and instructions required for submission.

---

### Privacy / compliance sign-off

The system may perform reviews and gather evidence, but final approval must involve human confirmation.

Evidence should include:

- data handling review
- telemetry verification
- storage and retention checks.

---

### Public communications

Public messaging initially requires human approval.

If stable patterns emerge, limited automation may be introduced later.

---

### Paid subscription changes

All subscription or billing changes are **strictly human-controlled**.

---

### Destructive data operations

Destructive operations are allowed only for:

- repository hygiene
- issue tracker cleanup

However:

- full history must remain recoverable
- rollback must always be possible.
