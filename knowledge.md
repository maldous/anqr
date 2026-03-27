# Known External Issues

## Codebuff SDK Bug: run_file_change_hooks Parameter Validation Error

This is an external bug in the `@codebuff/sdk` version 0.10.7 where the SDK incorrectly passes a string to the `run_file_change_hooks` tool instead of an array, causing validation errors logged as:

```
❌ Error: Invalid parameters for run_file_change_hooks: [
  {
    "expected": "array",
    "code": "invalid_type",
    "path": [
      "files"
    ],
    "message": "Invalid input: expected array, received string"
  }
]
```

This bug is harmless but causes log noise during file change events.

Current SDK version in this repo: 0.10.7.

### Actions

- Await SDK maintainers to release a fix.
- Monitor runtime-events logs for resolution.
- No local changes possible to work around this until the SDK is fixed.

## Missing Tools Issue - RESOLVED ✅

The missing tools issue (`run_file_change_hooks`, `think_deeply`, `update_subgoal`, `add_subgoal`) that was causing agents to get stuck has been **fully resolved**.

**Current Status:**
- All 13 critical tools are implemented in Symphony bridge (`scripts/ops/integrations/model/symphony-openai-bridge.mjs`)
- Symphony bridge now supports: `exec`, `read`, `write`, `glob`, `memory_search`, `memory_get`, `run_file_change_hooks`, `think_deeply`, `update_subgoal`, `add_subgoal`, `find_files`, `web_search`, `read_docs`
- Documentation updated in `docs/harness/provider-tools-inventory.md`
- No agents should experience "stuck" behavior due to missing tools

**Note:** The Symphony bridge includes a workaround for the SDK bug above - it accepts both string and array formats for `run_file_change_hooks.files` parameter (line 820: `z.union([z.string(), z.array(z.string())]).transform(val => Array.isArray(val) ? val : [val])`)
