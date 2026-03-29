#!/usr/bin/env node

/**
 * create-workspace-relocation-issue.mjs
 * 
 * Creates a Linear issue to investigate git worktree usage for concurrent
 * Symphony runner operations without impacting the main working tree.
 */

import { createIssue, STATES, LABELS } from "../linear/linear-client.mjs";

const ISSUE_TITLE = "Investigate git worktrees for concurrent Symphony runner operations";

const ISSUE_DESCRIPTION = `## Context

The Symphony runner currently operates on the main working tree and uses file-based locking to prevent concurrent execution. This creates potential bottlenecks and idle time between task completions.

## Problem

- Single Symphony runner instance can process one issue at a time
- File lock (\`/run/user/\${uid}/symphony-runner/lock\`) prevents concurrency
- Working tree must be clean before execution starts
- No parallel execution capability for independent tasks

## Investigation scope

Determine if git worktrees can enable:

1. **Concurrent execution** — Multiple Symphony runners operating independently in isolated worktrees
2. **Clean separation** — Each worktree maintains its own working tree state
3. **Safe isolation** — No cross-contamination between concurrent task executions
4. **Resource efficiency** — Shared .git object store, separate working directories

## Key questions

### Feasibility
- Can Symphony runner safely operate in a git worktree?
- What modifications are needed to support worktree-based execution?
- How to handle worktree lifecycle (create, execute, cleanup)?

### Concurrency model
- How many concurrent worktrees are practical? (CPU, memory, disk constraints)
- How to assign issues to available worktrees?
- How to handle worktree pool management?

### State isolation
- Does \`symphony-state.mjs\` need modifications for worktree-aware state?
- How to handle shared state (leases, cooldowns, retries) across worktrees?
- Can file-based locks be replaced with worktree-aware coordination?

### Integration impact
- Does this change the runner's core execution model?
- What happens to validation, commit, and push workflows?
- How does Sonar post-commit scanning work with worktrees?

## Constraints

- Must not break existing single-runner mode
- Should preserve current validation and quality gates
- Must maintain git history integrity
- Should be opt-in or configurable initially

## Success criteria

- [ ] Document git worktree feasibility assessment
- [ ] Identify required changes to symphony-runner.mjs
- [ ] Prototype worktree-based execution (if feasible)
- [ ] Measure performance impact (parallel vs sequential)
- [ ] Document worktree lifecycle and cleanup strategy
- [ ] Provide recommendation: adopt, defer, or reject

## References

- \`scripts/ops/orchestration/symphony-runner.mjs\` — current runner implementation
- \`scripts/ops/symphony-state.mjs\` — state management and leasing
- Git worktree docs: https://git-scm.com/docs/git-worktree

## Acceptance

Deliver investigation findings with recommendation and prototype (if feasible).`;

async function main() {
  try {
    const issue = await createIssue({
      title: ISSUE_TITLE,
      description: ISSUE_DESCRIPTION,
      stateId: STATES.backlog,
      priority: 2,
      labelIds: [LABELS.harness],
    });

    console.log(`✅ Created issue: ${issue.identifier} — ${issue.title}`);
    console.log(`   URL: https://linear.app/anqr/issue/${issue.identifier}`);
    console.log(`   State: ${issue.state.name}`);
    console.log(`   Priority: ${issue.priority}`);
    console.log(`   Labels: ${issue.labels.nodes.map((l) => l.name).join(", ")}`);
  } catch (err) {
    console.error(`❌ Failed to create issue: ${err.message}`);
    process.exit(1);
  }
}

await main();
