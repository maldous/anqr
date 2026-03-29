### Fix schema validation bug for run_file_change_hooks input

In `scripts/ops/integrations/model/symphony-openai-bridge.mjs`, the input schema for `run_file_change_hooks` uses `z.preprocess()` to handle a known bug in `@codebuff/sdk` version ^0.10.7 where the SDK incorrectly passes `files` as a string instead of an array. The preprocess step normalizes the input to an array BEFORE validation (unlike `z.transform()` which runs AFTER validation).

Key insight: `z.preprocess()` is required instead of `z.union().transform()` because the AI SDK validates the schema before applying transforms, causing "expected array, received string" errors. The preprocess function runs first, converting the string to an array before validation occurs.

The implementation function also includes defensive normalization as a fallback (line 808).

This fixes ANQ-1056.
