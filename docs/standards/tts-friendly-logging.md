# TTS-Friendly Logging Standards

Log messages in this project may be read aloud by text-to-speech systems (voice announcements, Discord TTS, accessibility tools). Messages that sound good in a terminal look terrible when spoken. Follow this guide to make log output human-comprehensible when voiced.

## Core principle

Write log messages as if you're telling a colleague what happened. Avoid code notation, symbols that get spelled out, and machine-oriented formatting.

## Patterns to avoid

### Symbols that become words

| Symbol | TTS says | Instead use |
|--------|----------|-------------|
| `=` | "equals" | natural phrasing: "dispatched 3" not "dispatched=3" |
| `/` | "slash" | "per" or "out of": "3 out of 5 checks" |
| `~` | "tilde" | round to exact or omit |
| `>` / `<` | "greater than" / "less than" | "exceeds" / "under" |
| `|` | "pipe" | use sentence structure instead |
| `+` | "plus" | "and" or "with" |
| `-` (in IDs) | "dash" | "ANQ 3646" not "ANQ-3646" |
| `->` / `→` | "arrow" | "to" or "assigned to" |
| `:` | "colon" | build natural sentences |
| `_` | "underscore" | use natural words: "integrated main" not "integrated_main" |

### Code notation

| Pattern | TTS problem | Instead |
|---------|-------------|---------|
| `status=done` | "status equals done" | "status is done" |
| `(s)` plural | "parentheses s" | proper if/else plural |
| `[bracket text]` | "bracket open ... bracket close" | avoid brackets in spoken content |
| ISO timestamps | "2026 dash 05 dash 17" | relative time: "47 seconds ago" |
| hex SHAs | "two two a b six e" | "at commit 22ab6e6" with context |
| ms timing `(123ms)` | "one two three em es" | "completed in 123 milliseconds" |

### Emoji

Emoji are invisible to most TTS but can confuse screen readers and Discord TTS. Avoid emoji in log messages that will be spoken:

| Before | After |
|--------|-------|
| `✅ ANQ-3654 integrated` | `ANQ 3654 integrated` |
| `⚠️ Context pruning` | `Context pruning` |
| `✂️ Pass 1 complete` | `Pass one complete` |
| `🔧 Repair candidate` | `Repair candidate` |
| `❌ Validation failed` | `Validation failed` |

Use emoji only in Discord embed `color` fields or non-spoken metadata.

### Error-first prefixes

Avoid hanging a function name or code prefix on a spoken message:

| Before | After |
|--------|-------|
| `[truncateMessagesForProvider] No messages` | `No messages provided for provider` |
| `[scheduler] Cycle complete: dispatched=1` | `Cycle complete. Dispatched 1 issue.` |

## Good patterns

### Natural sentences

```
Before: dispatched=1 rejected=0 eligible=261 budget=1 (2473ms)
After:  dispatched 1 issue, rejected 0, 261 eligible. Completed in 2473 milliseconds.
```

### Relative time, not absolute

```
Before: active since 2026-05-17T12:08:26.123Z
After:  active for 47 seconds
```

### Contextual identifiers

```
Before: branch=symphony/wt3 head=30991ede
After:  on branch symphony/wt3, at commit 30991ede
```

### Proper plurals

```js
// Bad — TTS says "issue(s)"
`Archived ${count} issue(s)`

// Good
const plural = count === 1 ? "issue" : "issues";
`Archived ${count} ${plural}`
```

## Exceptions

- `logDebug` messages can use any format — they are not spoken by default
- Structured metadata fields (second argument to `logInfo`/`logWarn`/`logError`) are machine-readable and not spoken — only the first argument string is announced
- Error stack traces in exception handlers should remain as-is for debugging; prefix with natural language context

## Verification

Before committing new log messages, read them aloud or paste into a TTS preview. If any symbol or abbreviation catches your ear as odd, rewrite it.

## Prior art

See the following files for reference implementations of TTS-friendly logging:

- `harness/ops/orchestration/symphony-scheduler/schedule-cycle.mjs`
- `harness/ops/orchestration/symphony-integrator/integrate-candidate/integrate-candidate.mjs`
- `harness/ops/integrations/model/symphony-bridge-truncation/truncate-messages-for-provider.mjs`
