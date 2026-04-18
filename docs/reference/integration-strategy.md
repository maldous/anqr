# ANQR Integration Strategy

## Current Model: Direct Push to Main via Integrator

The Symphony Integrator is the single authority that pushes to `origin/main`.
Direct push is retained because:

1. The integrator processes candidates serially (no concurrent push races)
2. Cherry-pick is used, not merge — preserving linear history
3. Evidence records track every integration attempt
4. Failed integrations are quarantined, not retried blindly

## Safeguards

### Pre-Integration Checks

- Candidate must have passed validation (typecheck + tests + lint)
- Candidate branch must be ahead of current `origin/main`
- No other integration may be in progress (integration lock)

### During Integration

- Cherry-pick failure (conflict) → candidate marked as blocked
- Push failure → candidate marked for retry with exponential backoff
- Evidence record updated with result at each step

### Post-Integration

- Integration result logged with correlation ID
- Discord notification on success/failure
- Linear issue updated with integration evidence

## Failure Modes

| Scenario                         | Behavior                             |
| -------------------------------- | ------------------------------------ |
| Cherry-pick conflict             | Candidate blocked, operator notified |
| Push rejected (non-fast-forward) | Retry with fresh fetch               |
| Integrator crash mid-push        | Lock timeout → next cycle retries    |
| Invalid candidate (no commits)   | Candidate rejected with evidence     |

## Future Consideration: Protected Branch

If the team decides to add a review gate:

1. Route integrator output to a `staging` branch
2. Require PR approval before merge to `main`
3. Automate PR creation from integrator evidence

This is not currently implemented because the automation operates on a
single-operator host where the overhead of PR review is not justified.
The decision should be revisited if more operators join.
