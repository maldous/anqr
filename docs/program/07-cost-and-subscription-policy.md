# Cost and Subscription Policy

## Objective

Prevent uncontrolled spend and clarify when tools or subscriptions may change.

ANQR is designed to operate as a **minimal-cost or zero-cost system where possible**.  
All spending decisions must remain visible and controlled by the human operator.

Automation may **observe, report, and propose**, but **not commit financial spend**.

---

# Monthly Budget Ceilings

### infra

Current infrastructure costs are covered by the operator and treated as fixed recurring costs.

The autonomous system should monitor usage but does not need to manage the budget ceiling.

Target:
Maintain existing cost profile unless approved change.

Alert threshold:
Any unexpected infrastructure increase.

---

### model / API spend

Model usage must be monitored carefully because it can scale unexpectedly.

Target:
Prefer:

1. free-tier providers
2. low-cost providers
3. local models

Paid model usage should remain minimal unless explicitly approved.

Alert threshold:
Unexpected spikes in model usage or sustained paid model use.

---

### ads

Advertising revenue and experimentation may occur.

Current spend:
No planned paid ad campaigns.

Alert threshold:
Any automated system attempting paid ad spend.

Automation may propose ad strategies but cannot initiate them.

---

### tooling

Current tooling costs are fixed recurring subscriptions paid by the operator.

Target:
No automatic subscription changes.

Alert threshold:
Any proposed paid tool adoption.

---

### stores / mobile

App store fees and developer accounts are managed by the operator.

Automation may prepare store submissions but cannot modify store subscriptions.

Alert threshold:
Any detected store fee or subscription change.

---

### other

Any additional costs must be explicitly proposed and approved.

Alert threshold:
Any unrecognized cost source.

---

# Allowed Without Approval

The autonomous system may perform:

### zero-cost changes

Examples:

- code changes
- pipeline changes
- documentation updates
- repository restructuring
- analytics configuration updates

---

### lower-cost equivalent routing

Examples:

- switching AI providers to cheaper alternatives
- preferring local models over hosted ones
- reducing unnecessary compute use

---

### free-tier fallback

Examples:

- fallback to free API limits
- switching to free model providers
- local execution when external services become expensive

---

# Requires Approval

The following actions **require explicit human approval**.

### new paid subscription

Examples:

- new SaaS tools
- paid developer platforms
- paid AI models

Approval owner:
Operator / CEO

---

### cost ceiling increase

Examples:

- increasing model usage budget
- expanding infrastructure capacity

Approval owner:
Operator / CEO

---

### new ad spend

Examples:

- paid marketing campaigns
- promoted listings

Approval owner:
Operator / CEO

---

### infrastructure scaling that increases cost

Examples:

- additional servers
- paid compute tiers
- higher service tiers

Approval owner:
Operator / CEO

---

### store fee changes

Examples:

- app store developer plan upgrades
- subscription tier changes

Approval owner:
Operator / CEO

---

### long-term contract commitments

Examples:

- annual SaaS subscriptions
- enterprise software licenses

Approval owner:
Operator / CEO

---

# Required Metrics

These metrics must be included in the **weekly system report**.

---

### cost per successful task

Why it matters:
Measures the efficiency of the AI pipeline.

Source of truth:
Pipeline execution logs and provider usage data.

---

### cost per run

Why it matters:
Tracks the operational cost of each pipeline cycle.

Source of truth:
Provider usage metrics.

---

### cost per provider

Why it matters:
Helps identify expensive providers and optimize routing decisions.

Source of truth:
Provider billing dashboards and pipeline telemetry.

---

### cost per acquired / retained user signal

Why it matters:
Measures the relationship between platform cost and product adoption.

Source of truth:
Google Analytics combined with infrastructure and provider cost metrics.

---

# Weekly Cost Review

The weekly operational report must include:

- infrastructure cost summary
- model/API usage
- provider cost breakdown
- cost per task
- cost per run
- cost per user signal

The report should highlight:

- unusual cost increases
- opportunities for cost reduction
- proposals for beneficial paid tooling or services.

---

# Operating Principle

Automation may:

- monitor costs
- optimize usage
- propose investments

Automation may **never spend money directly**.

All financial commitments remain under human control.
