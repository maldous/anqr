# Bridge Result Normalization

## 1. Directory Overview

This directory contains utility functions for normalizing and validating Symphony bridge results.
These utilities ensure consistent structure and handle edge cases like missing values, wrong types,
and malformed data from bridge responses. It currently contains 6 files and 0 subdirectories.

## 2. File Summaries

### Files

- **index.mjs** - Generated facade that re-exports all normalization functions for convenient imports.
- **infer-symphony-result-from-completion.mjs** - Infers a Symphony result from a completion response by examining:
- **normalize-count.mjs** - Normalizes numeric count values - ensures the value is a finite number >= 0, otherwise returns the fallback value.
- **normalize-failure-class.mjs** - Simple normalization for failure class strings - validates and trims to ensure non-empty string or returns null.
- **normalize-string-array.mjs** - Utility that normalizes arrays of strings by:
- **normalize-symphony-result.mjs** - The main normalization function for Symphony result objects. It validates and normalizes the following properties:

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point. The README content below is aligned to the
current immediate directory contents.

## 4. Usage Instructions

```javascript
import * as moduleApi from "./index.mjs";
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This directory exposes a public API through `index.mjs`.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
