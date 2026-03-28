### Fix schema validation bug for run_file_change_hooks input

In `scripts/ops/integrations/model/symphony-openai-bridge.mjs`, the input schema for `run_file_change_hooks` uses `z.preprocess()` to handle a known bug in `@codebuff/sdk` version ^0.10.7 where the SDK incorrectly passes `files` as a string instead of an array. The preprocess step normalizes the input to an array before validation, and the implementation function also includes defensive normalization as a fallback.

This workaround allows the tool to function correctly despite the SDK bug. Once the SDK is updated, the preprocess step can be simplified to `z.array(z.string())` directly.

This fixes ANQ-1056.
