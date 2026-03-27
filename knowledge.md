### Fix schema validation bug for run_file_change_hooks input

In `scripts/ops/integrations/model/symphony-openai-bridge.mjs`, the input schema for `run_file_change_hooks` was incorrectly using a union with transform. It has been corrected to use `z.array(z.string())` directly for the `files` property to properly validate the input.

This fixes ANQ-1056.
