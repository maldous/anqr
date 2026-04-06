# Bridge Result Normalization

## 1. Directory Overview

This directory contains utility functions for normalizing and validating Symphony bridge results. These utilities ensure consistent structure and handle edge cases like missing values, wrong types, and malformed data from bridge responses.

## 2. File Summaries

### normalize-symphony-result.mjs

The main normalization function for Symphony result objects. It validates and normalizes the following properties:

- `completed` - Boolean flag indicating task completion
- `needsContinuation` - Boolean flag indicating if more work is needed
- `failureClass` - String classification of failure type
- `mutationCount` - Numeric count of mutations made
- `changedFiles` - Array of file paths that were changed
- `validationIntent` - Boolean for validation-specific operations
- `toolCallCount` - Number of tool calls made
- `stepCount` - Number of steps executed

### normalize-string-array.mjs

Utility that normalizes arrays of strings by:

- Filtering out non-string values
- Trimming whitespace from each entry
- Removing empty strings

### normalize-failure-class.mjs

Simple normalization for failure class strings - validates and trims to ensure non-empty string or returns null.

### normalize-count.mjs

Normalizes numeric count values - ensures the value is a finite number >= 0, otherwise returns the fallback value.

### infer-symphony-result-from-completion.mjs

Infers a Symphony result from a completion response by examining:

- `finishReason` - Determines if continuation is needed (length, tool_calls, etc.)
- `text` - Response text content
- `existingResult` - Pre-existing structured result

Key behavior: **Fail-closed** - inference never produces `completed: true`; only explicit structured results can indicate completion.

### index.mjs

Generated facade that re-exports all normalization functions for convenient imports.

## 3. Overall Directory Function

These utilities work together to provide a robust normalization layer for Symphony bridge responses. They ensure:

- Type safety - Values are converted to expected types
- Consistency - Default values are applied for missing fields
- Validation - Invalid values are caught and handled gracefully

This directory is part of the core operations (`ops/core/`) and is used by the harness to process provider/bridge results in a standardized way.

## 4. Usage Instructions

Import normalization functions from the index:

```javascript
import {
  normalizeSymphonyResult,
  inferSymphonyResultFromCompletion,
} from "./ops/core/bridge-result/index.mjs";

// Normalize an existing result object
const normalized = normalizeSymphonyResult(rawResult, { mutationCount: 0 });

// Infer result from completion
const inferred = inferSymphonyResultFromCompletion({
  finishReason: "length",
  text: responseText,
  defaults: { stepCount: 5 },
});
```

## 5. Dependencies

None - these are pure utility functions with no external dependencies. They use only native JavaScript capabilities.

## 6. Additional Comments

- **Fail-closed design**: The `inferSymphonyResultFromCompletion` function uses fail-closed logic - it never infers `completed: true` from a raw completion, only from explicit structured result objects.
- **Default values**: All normalization functions accept fallback/default values for missing or invalid inputs.
- **Type coercion**: The utilities handle various input types and coerce them to expected types where appropriate (e.g., string arrays, counts).
