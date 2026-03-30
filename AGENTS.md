# AGENTS.md - AI Agent Execution Contract

This file is the **first-read execution contract** for AI agents working on ANQR 1.0.

## Read order for AI agents

1. **AGENTS.md** (this file) — your execution rules
2. [README.md](/home/user/src/anqr/README.md) — bootstrap truth and scope
3. [docs/README.md](/home/user/src/anqr/docs/README.md) — documentation index
4. [docs/program/01-anqr-1.0-definition.md](/home/user/src/anqr/docs/program/01-anqr-1.0-definition.md) — launch scope
5. [docs/harness/00-index.md](/home/user/src/anqr/docs/harness/00-index.md) — harness doctrine
6. Relevant standards, workflows, or issue context

## Tool availability

**Available tools for agents:**

- `read_files` — Read multiple files from filesystem
- `str_replace` — Replace strings in files
- `write_file` — Create or overwrite files
- `run_terminal_command` — Execute shell commands (use this, not `exec`)
- `code_search` — Search code using ripgrep
- `list_directory` — List directory contents
- `read_subtree` — Read directory tree with contents
- `memory_search` — Search MEMORY.md and knowledge files
- `memory_get` — Get full memory file content
- `run_file_change_hooks` — Execute file change hooks (accepts `files` as array)
- `think_deeply` — Deep reasoning for complex tasks
- `update_subgoal` — Update task progress tracking
- `add_subgoal` — Add new subgoal for complex tasks
- `find_files` — Find files by natural language description
- `web_search` — Search web via Linkup API (requires API key)
- `read_docs` — Fetch library documentation via Context7 API (requires API key)
- `spawn_agents` — Spawn multiple agents in parallel
- `add_message` — Add message to conversation (Codebuff context only)
- `set_messages` — Set conversation history (Codebuff context only)
- `propose_str_replace` — Propose edits without applying (Codebuff context only)
- `propose_write_file` — Propose file write without applying (Codebuff context only)
- `ask_user` — Ask user questions (Codebuff context only)
- `lookup_agent_info` — Get agent metadata

**Important notes:**

- Use `run_terminal_command` (not `exec`) for shell commands
- All tools that accept array parameters support defensive normalization:
  - `run_file_change_hooks` expects `files` as an array: `{"files": ["path1", "path2"]}`
  - `read_files` expects `paths` as an array: `{"paths": ["file1.ts", "file2.ts"]}`
  - `str_replace` expects `replacements` as an array: `{"replacements": [{"old": "...", "new": "..."}]}`
  - `spawn_agents` expects `agents` as an array: `{"agents": [{"agent_type": "..."}]}`
  - And all other array-accepting tools follow the same pattern
  - **PREFERRED:** Always pass arrays in proper format: `{"files": ["path.ts"]}`
  - **TOLERATED:** Single strings are auto-normalized: `{"files": "path.ts"}` → `["path.ts"]`
  - **TOLERATED:** JSON-encoded arrays are parsed: `{"files": "[\"a.ts\", \"b.ts\"]"}` → `["a.ts", "b.ts"]`
  - This defensive handling works around AI SDK/provider bugs that send strings instead of arrays
- Web search and docs tools require API keys to be configured

## Tool implementation by context

Tools are available in different execution contexts (Codebuff, Symphony bridge, OpenClaw). This section clarifies which tools work where.

### All contexts (Codebuff, Symphony, OpenClaw)

**Core file operations:**

- `read_files` — Read multiple files from filesystem
- `write_file` — Create or overwrite files
- `str_replace` — Replace strings in files
- `read` — Read single file (alias for `read_files`)
- `write` — Write file (alias for `write_file`)

**Code navigation:**

- `code_search` — Search code using ripgrep
- `list_directory` — List directory contents
- `read_subtree` — Read directory tree with contents
- `find_files` — Find files by natural language description
- `glob` — Find files matching patterns

**Execution:**

- `run_terminal_command` — Execute shell commands (Codebuff-native name)
- `exec` — Execute shell commands (AI SDK name)
- `shell` — Execute shell commands (OpenAI compatibility alias)
- `local_shell` — Execute shell commands (cross-provider alias)
- `run_file_change_hooks` — Execute file change hooks

**Memory:**

- `memory_search` — Search MEMORY.md and knowledge files
- `memory_get` — Get full memory file content

**External APIs** (when API keys configured):

- `web_search` — Search web via Linkup API (requires `LINKUP_API_KEY`)
- `read_docs` — Fetch library documentation via Context7 API (requires `CONTEXT7_API_KEY`)
- `browser_search` — Web search (Groq compatibility alias)
- `visit_website` — Fetch web pages (best-effort via web search)

### Native context preference

Agents should prefer ANQR's local context systems before broad or external search:

- **Library/framework questions:** use `read_docs` first
  - Symphony bridge resolves via the local Context7 MCP/HTTP service on port `4320` first
  - cloud Context7 is fallback only when local resolution is unavailable
- **Repository discovery:** use `find_files` or `file_search` before broad `code_search`
  - `find_files` uses ANQR's hybrid retrieval stack (BM25 + semantic embeddings/RAG when available)
  - `file_search` routes exact string/pattern queries to `code_search` and natural-language prompts to `find_files`
- **Exact symbol/string lookup:** use `code_search` after file discovery narrows the search surface
- **External web lookups:** use `web_search` only when current external information is actually needed, or when local docs/repo context are insufficient

This keeps agent operation cheaper, faster, and more stable than defaulting to broad file scans or internet search.

**Progress tracking:**

- `think_deeply` — Deep reasoning for complex tasks
- `add_subgoal` — Add new subgoal for complex tasks
- `update_subgoal` — Update task progress tracking
- `thinker` — Think deeply (compatibility alias)

### Agent spawning (delegated to parent)

**Available in all contexts but delegated:**

- `spawn_agents` — Spawn multiple agents in parallel
  - **Codebuff:** Spawns actual sub-agents
  - **Symphony bridge:** Acknowledges request, delegates to parent Codebuff/OpenClaw instance
  - **OpenClaw:** Routes to gateway for agent orchestration

**Codebuff context only:**

- `lookup_agent_info` — Get agent metadata (not available in Symphony/OpenClaw)

### Codebuff-only tools

These tools are **NOT available** in Symphony bridge or OpenClaw contexts:

**Proposal tools** (preview mode):

- `propose_str_replace` — Propose edits without applying
- `propose_write_file` — Propose file write without applying

**Conversation control:**

- `add_message` — Add message to conversation history
- `set_messages` — Set conversation history
- `message` — Add message (compatibility alias)

**Interactive prompts:**

- `ask_user` — Ask user questions (requires interactive session)

**Turn control:**

- `end_turn` — Signal turn completion
- `task_completed` — Signal task completion (alias)

**Planning:**

- `create_plan` — Create step-by-step plan
- `write_todos` — Write task list
- `suggest_followups` — Suggest followup prompts

**Other Codebuff-native tools:**

- `set_output` — Set agent output
- `skill` — Load skill instructions
- `apply_patch` — Apply Codex-style patches
- `browser_logs` — Check browser console (limited in headless environments)

### Symphony bridge acknowledgment-only tools

**Implementation location:** `scripts/ops/integrations/model/symphony-openai-bridge.mjs`

These tools are implemented in Symphony bridge as **acknowledgment-only** — they log activity server-side but don't block execution or spawn actual agents:

- `think_deeply` — Logs thinking activity, returns `{ acknowledged: true }`
- `add_subgoal` — Logs subgoal creation, returns `{ acknowledged: true }`
- `update_subgoal` — Logs subgoal updates, returns `{ acknowledged: true }`
- `spawn_agents` — Logs spawn request, delegates to parent, returns `{ acknowledged: true, message: "delegated" }`

This allows agents to organize work and track progress across all provider contexts without requiring Symphony bridge to implement full agent orchestration.

### Cross-provider compatibility tools

Symphony bridge includes compatibility shims for tools from other platforms:

**Groq/OpenAI compatibility:**

- `code_interpreter` — Execute code (routes to `exec` or language-specific runtime)
- `file_search` — Search files (routes to `code_search` or `find_files`)
- `image_generation` — Not available (returns helpful error)
- `wolfram_alpha` — Not available (suggests `code_interpreter` instead)

**UI automation (not available in headless environment):**

- `browser_automation` — Not available (suggests Playwright tests)
- `computer_use` — Not available (headless server environment)
- `tts` — Not available (no audio output)

**Connectors (Groq-specific, not available):**

- `connector_gmail` — Not available
- `connector_googlecalendar` — Not available
- `connector_googledrive` — Not available

**MCP tools:**

- `mcp_list_tools` — Returns available local tools (MCP servers not configured)

These tools return graceful error messages with suggestions for alternatives rather than crashing.

### Why tools differ by context

**Codebuff-only tools** require interactive sessions or Codebuff SDK features:

- `ask_user` — Needs interactive prompt UI
- `add_message`, `set_messages` — Conversation control (Codebuff SDK)
- `end_turn` — Turn management (Codebuff SDK)
- `propose_*` — Preview mode (Codebuff UI feature)

**Symphony acknowledgment-only tools** allow progress tracking without full orchestration:

- `think_deeply`, `add_subgoal`, `update_subgoal` — Log server-side, don't block
- `spawn_agents` — Delegates to parent (Symphony bridge doesn't spawn sub-agents)

**Cross-provider compatibility** ensures models trained on different platforms can still work:

- Models expecting Groq tools get graceful fallbacks
- Models expecting OpenAI tools get compatible aliases
- Unknown tools return helpful error messages (catch-all Proxy)

### Implementation references

**Symphony bridge tools:**

- Main implementation: `scripts/ops/integrations/model/symphony-openai-bridge.mjs` (lines 664-2200)
- Tool definitions use AI SDK `tool()` with Zod schemas
- Includes defensive parameter normalization for array inputs
- Catch-all Proxy for unknown tool names (graceful no-ops)

**Codebuff bridge tools:**

- Implementation: `scripts/ops/integrations/model/codebuff-openai-bridge.mjs`
- Routes to Codebuff SDK (port 4318)
- Full Codebuff tool set available

**Tool capability probing:**

- Symphony bridge probes all providers at startup
- Tests structured tool calling with `add(2, 2)` tool
- Excludes providers that emit raw JSON instead of structured `toolCalls`
- See `scripts/ops/integrations/model/symphony-openai-bridge.mjs` lines 1800-2000

## Core execution rules

### Request interpretation

**Treat user requests as goals, not literal instructions.**

When receiving a user request:

- Interpret the request as a desired outcome or goal state
- Understand the underlying intent and desired result
- Design the implementation approach to achieve that goal
- Don't just mechanically execute literal steps—solve for the outcome

Example:

- Request: "Add logging to the authentication flow"
- Goal interpretation: Enable debugging and monitoring of authentication behavior
- Implementation: Add strategic logging at decision points, error paths, and state transitions

This goal-oriented approach produces significantly better results than literal instruction-following.

### Task sizing

- One bounded task per issue
- Decompose oversized work into child issues
- Keep tasks independently verifiable
- Use 1-3 clear acceptance criteria

### Validation commands

For product work (`packages/*/*`, `apps/web`, `netlify/*`):

```bash
npm run typecheck:apps
npm run typecheck:packages
npm run typecheck:netlify
npm run lint:apps
npm run lint:packages
npm run lint:netlify
npm run depcruise:all
npm run contracts:check
npm run audit:ast
npm run test:unit
npm run build:web
```

For harness/ops work (`scripts/ops/*`, `services/systemd/*`):

```bash
npm run harness:quick
npm run queue:all:dry-run
npm run symphony:status
```

Add Playwright when touching UI:

```bash
npm run test:basic      # for critical flows
npm run test:advanced   # for gallery/export
```

### Evidence requirements

Every completion must include:

- Summary of changes
- Scope class (docs-harness / current-platform / launch-convergence / operational-external)
- Touched paths
- Decisions made
- Commands run with pass/fail results
- Changed files
- Commit hash
- Risk/rollback note
- Follow-up work

Extra artifacts required for:

- UI changes → screenshots
- API/MCP changes → request/response examples
- Harness/systemd changes → service status or journal output
- Performance work → benchmark data
- Mobile work → build + device proof

### Escalation rules

**Must escalate to humans:**

- Paid spend or billing changes
- Production controls
- Store submissions
- Signing material
- Org-level security/admin changes
- Privacy/compliance posture changes
- Changing the default anonymous MCP posture
- Adding mobile to the launch claim

**Safe for automation:**

- Documentation updates
- Code changes within scope
- Refactors
- Validation runs
- Non-costing config cleanups
- Issue decomposition
- Backlog hygiene

### Scope boundaries

**Current official 1.0 claim:**

- `apps/web` — canonical web delivery
- `netlify/*` — canonical API/MCP delivery
- `packages/*/*` — canonical reusable architecture
- `public/*` — static/public assets

**Reserved/deferred:**

- `apps/api` — not part of current claim
- Android — not yet claimed for 1.0
- iPhone — not yet claimed for 1.0

**Harness (separate from product architecture):**

- `scripts/ops/*` — canonical harness runtime
- `services/systemd/*` — canonical operator automation

### Quality gates

**Blocking checks** (must pass before merge):

- `typecheck` — TypeScript compilation
- `lint` — oxlint violations
- `test-unit` — unit test correctness
- `depcruise` — architecture boundaries
- `ast-density` — one declaration per file

**Advisory checks** (tracked but not blocking):

- `cspell-coverage` — spelling
- `docs-freshness` — stale documentation
- `sonar-audit` — quality insights
- `ollama-health` — environment-dependent
- `litellm-routing` — environment-dependent

### Harness workflow

The maintained control flow:

```
harness-report → linear-guardian → queue control → symphony runner → notify
```

Supporting jobs:

- nightly ops pass
- email ingest
- Sonar sync and audit
- provider credit/routing checks

**Concurrency model:**

- Symphony runner supports concurrent execution via git worktrees
- Each worktree runs independently with its own working directory, branch, and lock file
- Shared state (`reports/symphony/state.json`) uses file-based locking for atomicity
- Lease system prevents concurrent work on the same Linear issue
- Default: 8 concurrent agents (4 Symphony runners wt1-wt4 + 4 Discord bridges wt5-wt8)
- Configurable via `MAX_CONCURRENT_AGENTS` in `symphony-config.mjs`
- Worktree setup: `node scripts/ops/orchestration/symphony-worktree-pool.mjs init [count]`
- Documentation: `docs/harness/12-concurrent-execution-with-worktrees.md`, `docs/harness/WORKTREE-QUICKSTART.md`

**Worktree execution environment:**

When running in a worktree (Symphony runner with concurrency enabled):

- **Working directory:** Each runner operates in an isolated worktree directory (e.g., `/home/user/src/anqr-wt1`, `/home/user/src/anqr-wt2`)
- **Environment variables:**
  - `ANQR_WORKTREE_ID` — Worktree identifier (e.g., `wt1`, `wt2`)
  - `ANQR_WORKTREE_PATH` — Absolute path to worktree directory
- **Branch isolation:** Each worktree uses a unique branch (e.g., `symphony/wt1`, `symphony/wt2`) that tracks `origin/main`
- **Git operations:** All git commands (status, add, commit, push) operate on the worktree's isolated working directory and index
- **Main repo restriction:** `scripts/ops/orchestration/symphony-runner.mjs` refuses to execute from the main repository without worktree context; use a worktree or set `ANQR_WORKTREE_ID`/`ANQR_WORKTREE_PATH` explicitly
- **Sync workflow:** Worktrees sync with `origin/main` before each issue execution via `git fetch origin main && git merge origin/main --ff-only`
  - **CRITICAL:** This brings in all work from other worktrees that has been pushed to `origin/main`
  - **CRITICAL:** Work committed in other worktrees but not yet pushed to origin won't be visible
  - **CRITICAL:** Push completed work immediately (via `git push origin HEAD:main`) to make it available to other worktrees
- **Lock files:** Each worktree has its own PID lock file (e.g., `/run/user/${UID}/symphony-runner/lock-wt1`)
- **Validation commands:** All validation commands (typecheck, lint, tests) run in the worktree's isolated environment
- **Dependencies:** Each worktree has its own `node_modules` directory (installed during worktree creation)

**Agent awareness:**

Agents running in Symphony bridge should be aware that:

- Multiple agents may be executing different issues concurrently in different worktrees
- File changes are isolated to the specific worktree until committed and pushed
- The lease system ensures no two agents work on the same Linear issue simultaneously
- Issue routing is source-aware:
  - `wt1`-`wt4` handle non-Discord Symphony work
  - `wt5`-`wt8` handle Discord-sourced work only
- Discord notifications include worktree ID to distinguish concurrent executions
- Worktree failures (sync errors, corruption) are handled with automatic recovery or hard reset

**Important:** Temporary working scripts (e.g., one-off issue creation scripts, test scripts) must be placed in git-ignored directories to ensure concurrent operations do not conflict. Use `scripts/ops/.workspace/` (already in `.gitignore`) for such temporary files.

**Discord integration without git pollution:**

- Interactive Discord sessions use isolated worktrees for experimentation
- Discord worktrees are separate from Symphony runner worktrees
- No changes pushed to main repository unless explicitly requested
- Allows simultaneous Discord interaction and Symphony automation without conflicts

### Testing strategy

**Current approach:** Intentional rebuild around current architecture, not wholesale legacy import.

**Coverage strategy:** 7-phase protected scope defined in `coverage-scope.json`

- Phase 1 (active): Contracts & Domain Primitives
- Phases 2-7 (deferred): Application, UI, Platform, Analytics, Observability, Config/Testing

**Test suites:**

- Unit tests — `npm run test:unit`
- E2E tests — 90+ tests for OpenClaw/Symphony integration
- Playwright — `npm run test:basic` (critical flows), `npm run test:advanced` (gallery/export)

**Test location:** `tests/` with intentional architecture ownership

### Provider routing

The harness uses a cascading provider model with failure cooldown:

1. **codex** (gpt-5.4) — primary, uses OpenAI credits
2. **groq**, **mistral**, **gemini** — free tier providers
3. **codebuff** (SDK-based) — autonomous agent with paid → free mode fallback
4. **codebuff-bridge** (HTTP) — OpenAI-compatible gateway for OpenClaw integration
5. **ollama-local** — local fallback

Codebuff uses a single API key with automatic mode selection:

- `CODEBUFF_API_KEY` — single account (paid mode first, free mode fallback)

**Codebuff bridge:** `http://127.0.0.1:4318` (OpenAI-compatible gateway)

- Exposes Codebuff SDK via OpenAI-compatible HTTP API
- Supports streaming responses (SSE)
- Automatic paid → free mode fallback with periodic re-validation
- Configured via `.openclaw/models.json` for OpenClaw integration

### Degraded mode

The harness remains usable when:

- Provider routing is degraded
- Queue runs in dry-run mode
- Public MCP/API continues without authenticated hardening

When degraded, **say so explicitly** instead of pretending full capability.

### Documentation ownership

- `docs/program/*` — product definition, scope, program policy
- `docs/harness/*` — harness operating model, runtime, governance
- `docs/standards/*` — engineering standards
- `docs/workflows/*` — operator workflows
- `docs/archive/*` — historical context only
- `docs/generated/*` — generated artifacts (not doctrine source)
- `migration/*` — archive-only (no new operational truth)

**Single sources of truth:**

- Launch scope → `docs/program/01-anqr-1.0-definition.md`
- Bootstrap → `README.md`
- Agent rules → `AGENTS.md` (this file)
- Docs index → `docs/README.md`
- Harness doctrine → `docs/harness/00-index.md`

**Migration ledger:** `MCP-MIGRATION.md` (preserved reference, not live doctrine)

### Workspace governance

Use the hybrid Linear model:

- Projects by stream/package family
- Concrete packages tracked by labels
- Required states: Backlog, Todo, In Progress, In Review, Blocked, Human Review, Done, Canceled
- Use `Human Review` for approvals, secrets, legal, store, billing
- Use `Blocked` only for external blockers
- Preserve evidence in issue body or linked artifacts

### Linear integration

Agents can efficiently CRUD Linear issues using the canonical client library:

**Location:** `scripts/ops/integrations/linear/linear-client.mjs`

**Key functions:**

```javascript
// Import from: scripts/ops/integrations/linear/linear-client.mjs
import {
  createIssue,
  updateIssue,
  addComment,
  applyLabels,
  findOpenIssuesByTitle,
  findOpenIssuesByDescriptionFragment,
  listIssuesByState,
  getIssueDetail,
  getQueueDepth,
  TEAM_ID,
  STATES,
  LABELS,
} from "linear-client.mjs";

// Create issue (returns issue object with id, identifier, title, state, labels)
const issue = await createIssue({
  title: "Issue title",
  description: "Issue description",
  stateId: STATES.backlog, // or .todo, .inProgress, .inReview, .done, .canceled
  labelIds: [LABELS.harness, LABELS.bug], // See taxonomy below
  priority: 1, // 0=none, 1=urgent, 2=high, 3=normal, 4=low (optional)
});

// Update issue
await updateIssue(issue.id, {
  stateId: STATES.done,
  priority: 2,
});

// Add comment
await addComment(issue.id, "Comment body");

// Find issues
const issues = await findOpenIssuesByTitle("fragment");
const byDesc = await findOpenIssuesByDescriptionFragment("text");
const inState = await listIssuesByState(["Todo", "In Progress"]);

// Get full issue detail with comments
const detail = await getIssueDetail(issueId);
```

**Available states:**

- `STATES.backlog`, `STATES.todo`, `STATES.inProgress`, `STATES.inReview`, `STATES.done`, `STATES.canceled`
- Note: "Blocked" and "Human Review" states exist in workspace but aren't currently exposed in constants

**Available label taxonomy** (from `docs/program/04-taxonomy.md`):

- `LABELS.harness` — harness/ops work
- `LABELS.governance` — workspace/policy work
- `LABELS.hygiene` — cleanup/maintenance
- `LABELS.product` — product features
- `LABELS.release` — release/deployment
- `LABELS.growth` — marketing/analytics
- `LABELS.incident` — incidents/hotfixes
- `LABELS.research` — exploratory work
- `LABELS.bug` — defects (legacy)
- `LABELS.reliability` — stability (legacy)

**Environment requirement:**

- Requires `LINEAR_API_KEY` environment variable
- Team ID is hardcoded to ANQR workspace: `01534c1e-4041-474d-a81e-24f917f33912`

**Example scripts for reference:**

- `scripts/ops/integrations/linear/create-*.mjs` — issue creation patterns
- `scripts/ops/integrations/linear/close-reviewed-issues.mjs` — bulk state transitions
- `scripts/ops/integrations/linear/reopen-marked-issues.mjs` — conditional updates with comments

**CRITICAL: Read entire issue before starting work**

Before working on ANY Linear issue:

1. **ALWAYS call `getIssueDetail(issueId)`** to get the FULL issue including ALL comments
2. **Read ALL existing comments** to understand what work has already been done
3. **Check for duplicate findings** — never repeat findings already documented in comments
4. **Mark issues as Done properly** when work is complete to prevent reopening and rework
5. **Update existing comments** when adding to prior findings (use `updateComment`)

```javascript
// ALWAYS do this first when starting work on an issue:
const detail = await getIssueDetail(issue.id);
const allComments = detail.comments.nodes || [];

// Review all comments to understand prior work:
for (const comment of allComments) {
  console.log(`[${comment.createdAt}] ${comment.body.slice(0, 200)}...`);
}

// Check if findings already exist before adding new ones
```

**Issue state transitions:**

- When work is complete and all acceptance criteria met → `STATES.done`
- When work needs human review (secrets, billing, etc.) → `STATES.inReview` (Human Review state)
- When blocked by external dependency → `STATES.todo` with comment explaining blocker
- Never leave completed issues in `In Progress` or `Todo`

### Symphony bridge architecture

The harness uses two OpenAI-compatible bridges:

**Symphony Bridge** (port 4319):

- AI SDK-based with tool execution
- 4-tier provider cascade (paid → free-cloud → local-proxy → local-safety-net)
- 42 providers with dynamic tool-capability probing
- Adaptive context: shrinks ceilings on 413/context errors, throttles on 429/rate-limit
- Structured result contract: returns `_symphonyResult` on streaming and non-streaming responses so the runner can consume provider/usage outcome data directly
- Codex SDK path defaults to `CODEX_SANDBOX_MODE=danger-full-access` unless overridden
- Service: `anqr-symphony-bridge.service`
- **Concurrency-safe:** Handles multiple concurrent requests from worktree runners

**Codebuff Bridge** (port 4318):

- Codebuff SDK exposed as OpenAI-compatible HTTP
- Automatic paid → free mode fallback with periodic re-validation
- Structured result contract: returns `_symphonyResult` so the runner and bridge client share the same completion contract
- Service: `anqr-codebuff-bridge.service`
- **Concurrency-safe:** Supports simultaneous Discord and Symphony requests

**Key modules** (all under `scripts/ops/integrations/model/`):

- `symphony-openai-bridge.mjs` — main bridge with streaming, tool execution
- `symphony-credit-gate.mjs` — 4-tier provider selection
- `symphony-adaptive-context.mjs` — dynamic token ceilings, rate-limit tracking
- `symphony-bridge-truncation.mjs` — static limits and message truncation
- `codebuff-openai-bridge.mjs` — Codebuff SDK bridge

**Bridge restart procedure (CRITICAL):**

**⚠️ WARNING: Never restart bridges during active concurrent requests — data loss will occur.**

Restarting during active concurrent requests drops streaming connections and causes partial results to be lost. Always verify zero concurrency before proceeding.

**Procedure:**

1. **STOP TASK EXECUTION FIRST:**
   ```bash
   node scripts/ops/orchestration/symphony-control.mjs --stop
   ```
   - **CRITICAL:** This must be the FIRST step before any other actions
   - Disables all Symphony runner timers to prevent new tasks from starting
   - Shows "🛑 STOPPED - no new tasks will be picked up" status
   - Without this step, new tasks may start while you wait for concurrency to drop

2. **Check concurrent runner status:**
   ```bash
   node scripts/ops/orchestration/symphony-runner.mjs --status
   ```
   - Shows active worktree runners and their current work
   - Displays lock status and in-progress issues

3. **Wait for zero concurrency:**
   - All worktree runners must be idle (no active leases)
   - Check Discord for "(0 concurrent)" confirmation in status messages
   - If runners are active, wait for current issues to complete
   - Typical wait: 5-20 minutes depending on issue complexity

4. **Commit and push first:**
   ```bash
   git add -A && git commit -m "..." && git push
   ```
   - Ensures all changes are saved before restart
   - Prevents loss of in-flight configuration changes

5. **Restart bridge:**
   ```bash
   systemctl --user restart anqr-symphony-bridge
   # OR
   systemctl --user restart anqr-codebuff-bridge
   ```

6. **RESTART TASK EXECUTION:**
   ```bash
   node scripts/ops/orchestration/symphony-control.mjs --start
   ```
   - **CRITICAL:** Must restart task execution after bridge restart
   - Re-enables all Symphony runner timers
   - Runners will resume picking up tasks on next timer cycle
   - Shows "✅ RUNNING - new tasks will be picked up" status
   - **Without this step, the system remains stopped and no work will be processed**

7. **Update MEMORY.md:**
   - Add stop/start entries with timestamp and reason
   - Commit and push again: `git add MEMORY.md && git commit -m "..." && git push`

**Impact of unsafe restart:**
- Streaming connections dropped → incomplete LLM responses
- Partial file writes → corrupted issue state
- Lost validation results → re-execution required
- Wasted provider credits → duplicate API calls

**For emergency restarts:**
If bridge must restart immediately (e.g., security patch):
1. Run `--stop` first (always, no exceptions)
2. Accept that in-progress work will be lost and re-executed
3. Restart bridge after concurrency drops to zero
4. Run `--start` to resume task execution

**CRITICAL: Don't forget steps 1 and 4!**
The `--stop` and `--start` steps are mandatory for ALL service changes, not just restarts. Skipping these steps will either:
- Cause data loss (if you skip `--stop`)
- Leave the system permanently disabled (if you skip `--start`)

**CRITICAL: Don't forget to restart tasks!**
After using `--stop`, you MUST use `--start` to resume task execution. Without this, runners remain disabled and no work will be processed.

### Bootstrap contract

**Reduced capability** (developer machine):

- git, bash, node, npm, python3, curl, jq, zip
- repo checkout + `npm install`
- Can run local validation, edit source, generate docs
- Cannot run scheduled harness, provider-routed automation, or mobile builds

**Full harness capability:**

- All reduced capability requirements
- `services/systemd/anqr-ops.env` or secret-managed equivalent
- systemd user service access (`systemctl --user`) or documented runner mechanism
- AI provider credentials
- Linear credentials
- Netlify/Sentry/Sonar credentials when in scope

**Mobile/release capability** (human-only unless delegated):

- Android SDK / adb / Gradle
- iOS/Xcode toolchain
- fastlane/bundler
- Store credentials and signing material

### Repository context

**Current architecture surface:**

- `packages/<group>/<package>` — two-level reusable architecture (e.g., `packages/domain/qr`)
- `apps/web` — canonical web delivery
- `netlify/*` — canonical API/MCP delivery
- `scripts/ops/*` — harness runtime (outside depcruise product claim)
- `services/systemd/*` — operator automation (outside depcruise product claim)
- `public/*` — static/public assets
- `docs/*` — canonical knowledge

**Reserved/deferred:**

- `src/*` — transitional residue, never regains authority
- `apps/api` — reserved for future promotion
- Android/iPhone — not yet in 1.0 claim

**Current phase:** Phase 4 (current platform refinement) — harness fully operational, product architecture maintained

### Truth rules

- Do not claim a gate passed unless it actually ran
- Do not claim mobile is launch-ready because roots exist
- Do not treat `apps/api` as live unless explicitly promoted
- Do not import legacy wholesale — rebuild intentionally
- Keep launch truth in one place (docs/program/01-anqr-1.0-definition.md)

### Handover block format

Use this structure for task handover:

````markdown
## Task

<one bounded objective>

## Scope class

- docs-harness / current-platform / launch-convergence / operational-external

## Required context

- README.md, AGENTS.md, docs/README.md, relevant docs

## Touched paths

- <path>

## Constraints

- architecture / privacy / cost / human-only / launch-claim constraints

## Verification

```bash
<commands>
```
````

## Expected evidence

- summary, decisions, results, changed files, commit, artifacts, rollback note, follow-ups

## Escalate if

- paid spend, prod auth changes, store/signing work, operator secrets, launch scope changes

```

---

For human/operator read order, see [README.md](/home/user/src/anqr/README.md).
```
