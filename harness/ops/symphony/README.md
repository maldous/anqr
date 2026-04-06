# ANQR Symphony

## 1. Directory Overview

This directory contains the live system prompt used by the ANQR (Agentic Number Query Runner) harness runner when executing worktree tasks. It defines the execution environment, workflow rules, and behavioral guidelines for AI agents running in concurrent git worktrees.

## 2. File Summaries

- **WORKFLOW.md** - The live system prompt for the ANQR harness runner. Contains comprehensive instructions for worktree execution, including git operation handling, read order for documentation, launch truth and scope boundaries, execution rules, validation requirements, and the standard working sequence. This file serves as the authoritative behavioral reference for all agents operating within the harness.

## 3. Overall Directory Function

This directory serves as the behavioral core for the ANQR harness runner. The WORKFLOW.md file defines how agents should execute worktree tasks by:

- **Worktree Execution Environment**: Managing git operations automatically (sync, replay changes, commit/push) so agents focus on implementation rather than version control
- **Documentation Read Order**: Establishing a canonical reading order to ensure agents understand project context before making changes
- **Launch Truth**: Defining the current 1.0 claim scope to prevent agents from implying broader readiness
- **Scope Boundaries**: Clarifying which parts of the codebase are product-architecture, harness/runtime, live doctrine, or transitional residue
- **Execution Rules**: Encoding minimal-change philosophy, architecture boundary respect, and escalation paths for sensitive operations
- **Validation Requirements**: Mandating gates from quality-gates documentation and evidence formatting
- **Working Sequence**: Standardizing the agent workflow from issue reading through task completion

## 4. Usage Instructions

This directory is not directly executed but is read by the harness runner when spawning agent tasks. The WORKFLOW.md is automatically loaded as the system prompt for each worktree execution.

**For harness operators:**
- Edit WORKFLOW.md to modify agent behavior, execution rules, or documentation reading order
- Changes take effect on the next worktree task execution

**For agents (handled automatically):**
- The runner loads WORKFLOW.md automatically
- Agents should follow the "Read order" section to understand project context
- Agents must complete validation gates before calling `task_complete`

## 5. Dependencies

This directory has no external dependencies. It is a documentation-only directory that is consumed directly by the harness runner.

- The harness runner must be configured to read WORKFLOW.md as the system prompt
- No additional tooling or packages required

## 6. Additional Comments

- **Truth Rule**: WORKFLOW.md explicitly states that when code, docs, and issue text disagree, canonical docs and current repository state take precedence over stale workflow notes
- **Isolation Model**: Multiple agents may run concurrently in different worktrees; the lease system prevents duplicate work on the same issue
- **Minimal Change Philosophy**: The execution rules emphasize making the smallest truthful change that closes the issue rather than speculative improvements
- **Validation First**: Agents must run gates from `docs/harness/05-quality-gates.md` and produce evidence per `docs/harness/06-evidence-and-reporting.md` before completion