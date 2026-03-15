# Taxonomy

## Objective

Establish shared vocabulary across humans, agents, issues, documents, and automation.

The taxonomy provides **simple English labels** that make it easy for humans and AI systems to classify work consistently.

Each label must be:

- short
- easy to understand
- usable by non-native English speakers
- stable across issues, code, and documentation.

---

# Work Type

Defines the **kind of work being performed**.

### product
Work that directly affects the ANQR application or user experience.

Examples:
- QR generation improvements
- UI features
- mobile application behavior
- QR rendering capabilities

---

### harness
Work related to the **AI pipeline and autonomous engineering system**.

This includes:

- AI pipeline improvements
- automation systems
- CI/CD improvements
- issue automation
- self-healing pipeline behavior

"Harness" refers to **harness engineering**, the system that allows the project to run continuously.

---

### governance
Work related to **rules, program structure, or decision frameworks**.

Examples:

- policy documents
- autonomy rules
- approval processes
- program charters

---

### growth
Work related to **expanding adoption of ANQR**.

Examples:

- SEO improvements
- traffic growth
- marketing experiments
- product visibility

---

### release
Work related to **preparing or delivering a new version**.

Examples:

- version tagging
- release preparation
- deployment readiness
- release documentation

---

### incident
Work related to **unexpected failures or outages**.

Examples:

- system downtime
- broken builds
- failed deployments
- production errors

---

### hygiene
Work that **improves project health without changing features**.

Examples:

- refactoring
- dependency updates
- documentation cleanup
- repository organization

---

### research
Exploration work used to **learn something new**.

Examples:

- testing new QR rendering techniques
- investigating algorithms
- studying performance improvements

Research does not immediately change production behavior.

---

# Authority

Defines **what level of action is being taken**.

### observe
Monitor systems and gather information.

Examples:

- monitoring logs
- observing system performance
- watching build pipelines

No changes are made.

---

### propose
Suggest a change or improvement.

Examples:

- new feature ideas
- architecture suggestions
- performance improvements

Proposals are usually recorded as issues.

---

### implement
Make a change to the system.

Examples:

- writing code
- modifying configuration
- updating pipelines

---

### verify
Confirm that a change works correctly.

Examples:

- running tests
- validating performance
- reviewing output

---

### promote
Move a verified change to the next stage.

Examples:

- merging pull requests
- deploying builds
- promoting a release candidate

---

### communicate-external
Communicate outside the engineering system.

Examples:

- public messages
- documentation updates
- marketing communication

---

### spend-money
Any action that **creates financial cost**.

Examples:

- purchasing services
- activating paid models
- increasing infrastructure usage

These actions normally require human approval.

---

# Evidence

Defines **proof that work was completed correctly**.

### test
Automated or manual tests verifying functionality.

---

### benchmark
Measured performance comparisons.

Examples:

- rendering speed
- memory usage
- algorithm performance

---

### screenshot
Visual proof of system behavior.

---

### trace
Execution traces showing how a system behaved internally.

---

### log
System logs confirming runtime behavior.

---

### review
Human or automated review confirmation.

Examples:

- code review
- design review
- security review

---

### rollout-result
Evidence collected after a deployment.

Examples:

- error rate after release
- system stability

---

### user-signal
Evidence derived from real user behavior.

Examples:

- usage metrics
- user feedback
- adoption patterns

---

# Runtime

Defines **where code is running**.

### web
Browser-based application.

---

### api
Backend services providing QR functionality.

---

### android
Native Android application.

---

### ios
Native iPhone application.

---

### worker
Background processes performing automated work.

Examples:

- scheduled tasks
- analysis jobs
- pipeline automation

---

### local-harness
Local execution of the autonomous engineering system.

Examples:

- development pipeline
- local AI execution
- testing harness

---

# Environment

Defines **where the system is deployed**.

### local
Developer machine.

---

### dev
Shared development environment.

---

### staging
Pre-production testing environment.

---

### prod
Live public production system.

---

# Provider State

Describes the **health of external services or AI providers**.

### healthy
Provider is working normally.

---

### degraded
Provider is working but performance is reduced.

---

### cooling-down
Provider temporarily paused due to rate limits or resource constraints.

---

### disabled
Provider intentionally turned off.

---

### blocked
Provider cannot be used due to policy, billing, or access restrictions.

---

### unknown
Provider status cannot be determined.

---

# Launch Gate

Defines the **progress state of launch readiness**.

### not-started
Work has not begun.

---

### in-progress
Work is actively being completed.

---

### blocked
Work cannot continue due to a dependency or issue.

---

### ready-for-review
Work is finished and waiting for approval.

---

### ready
Work meets launch criteria.

---

### deferred
Work postponed until a later release.

---

# Additional Terms Needed by ANQR

### ai-pipeline
The automated engineering system responsible for:

- analyzing issues
- generating code
- executing tasks
- maintaining the pipeline

The AI pipeline is part of the **harness work type**.

---

### qr-engine
The core QR generation system.

Includes:

- encoding
- rendering
- overlays
- animations
- optimization

---

### scan-safety
Measurement of how reliably a QR code can be scanned.

Includes:

- error correction
- overlay tolerance
- device compatibility

---

### gallery
Automatically generated examples demonstrating QR capabilities.

Used for:

- testing
- showcasing features
- validating rendering outputs

---

### platform-parity
Guarantee that QR codes render **identically across platforms**.

Examples:

- web
- android
- ios
- api

---

### operator
The human authority responsible for governance and final decisions.

Currently the role of **Operator / CEO**.

---

### weekly-report
Standard reporting artifact summarizing:

- engineering status
- reliability metrics
- growth signals
- financial state
- pipeline health

Reports use **traffic-light status indicators**:

- green
- yellow
- red
