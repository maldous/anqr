# ANQR Codebuff Direct

## 1. Directory Overview

This directory implements **ANQR Codebuff Direct** within the ANQR harness. Key immediate entries include `index.mjs`, `invoke-codebuff-direct-stream.mjs`, `extract-text-from-unknown.mjs`, `ensure-no-sdk-error.mjs`. The current inventory is 27 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **build-prompt.mjs** - Exports `buildPrompt`, which builds prompt.
- **codebuff-max-continuations.mjs** - Exports `CODEBUFF_MAX_CONTINUATIONS`, a shared constant used by sibling modules.
- **codebuff-max-steps.mjs** - Exports `CODEBUFF_MAX_STEPS`, a shared constant used by sibling modules.
- **codebuff-model-id.mjs** - Exports `CODEBUFF_MODEL_ID`, a shared constant used by sibling modules.
- **codebuff-noisy-tools.mjs** - Exports `CODEBUFF_NOISY_TOOLS`, a shared `Set` constant used by this module group.
- **codebuff-timeout-ms.mjs** - Exports `CODEBUFF_TIMEOUT_MS`, a shared constant used by sibling modules.
- **ensure-no-sdk-error.mjs** - Exports `ensureNoSdkError`, which ensures no sdk error.
- **extract-sdk-message.mjs** - Exports `extractSdkMessage`, which implements extract sdk message.
- **extract-text-from-unknown.mjs** - Exports `extractTextFromUnknown`, which implements extract text from unknown.
- **extract-text.mjs** - Exports `extractText`, which implements extract text.
- **get-api-key.mjs** - Exports `getApiKey`, which gets api key.
- **get-shared-client.mjs** - Exports `getSharedClient`, which gets shared client.
- **index.mjs** - Facade module that re-exports public members from `./codebuff-model-id.mjs`, `./codebuff-max-steps.mjs`, `./codebuff-max-continuations.mjs`, `./codebuff-timeout-ms.mjs`, `./tool-parameter-rules.mjs`, `./codebuff-noisy-tools.mjs`, and 17 more siblings.
- **invoke-codebuff-direct-stream.mjs** - Exports `invokeCodebuffDirectStream`, which implements invoke codebuff direct stream.
- **invoke-codebuff-direct.mjs** - Exports `invokeCodebuffDirect`, which implements invoke codebuff direct.
- **is-payment-required-error.mjs** - Exports `isPaymentRequiredError`, which checks whether payment required error.
- **is-rate-limit-error.mjs** - Exports `isRateLimitError`, which checks whether rate limit error.
- **is-recoverable-error.mjs** - Exports `isRecoverableError`, which checks whether recoverable error.
- **logger.mjs** - Shared logging helper module exporting `logDebug`, `logInfo`, `logWarn`.
- **make-timeout.mjs** - Exports `makeTimeout`, which implements make timeout.
- **normalize-cwd.mjs** - Exports `normalizeCwd`, which normalizes cwd.
- **reset-shared-client.mjs** - Exports `resetSharedClient`, which implements reset shared client.
- **run-client-quietly.mjs** - Exports `runClientQuietly`, which runs client quietly.
- **shared-client-key.mjs** - Exports `setSharedClientKey`, `sharedClientKey`, providing the reusable API for this directory concern.
- **shared-client.mjs** - Exports `setSharedClient`, `sharedClient`, providing the reusable API for this directory concern.
- **tool-parameter-rules.mjs** - Exports `TOOL_PARAMETER_RULES`, a shared constant used by sibling modules.
- **try-mode.mjs** - Exports `tryMode`, which implements try mode.

## 3. Overall Directory Function

The directory primarily provides reusable modules that are imported by sibling runtime, orchestration, or validation code. Verified immediate files in this directory include timer, scheduling, cooldown, or watchdog behavior, Symphony integration, and git/worktree awareness. Environment-driven configuration is present in the immediate code.

## 4. Usage Instructions

```javascript
import * as moduleApi from "./ops/integrations/model/codebuff-direct/index.mjs";
```

## 5. Dependencies

- **External packages/services referenced in immediate code** - `@codebuff/sdk`
- **Internal relative modules** - `../../../core/bridge-result.mjs`, `../../../lib/logger.mjs`, `./build-prompt.mjs`, `./codebuff-max-continuations.mjs`, `./codebuff-max-steps.mjs`, `./codebuff-model-id.mjs`, `./codebuff-noisy-tools.mjs`, `./codebuff-timeout-ms.mjs`, `./ensure-no-sdk-error.mjs`, `./extract-sdk-message.mjs`, `./extract-text-from-unknown.mjs`, `./extract-text.mjs`

## 6. Additional Comments

- No direct standalone runtime entry point is defined in the immediate directory contents.
