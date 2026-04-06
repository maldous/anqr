# AST Helpers

## 1. Directory Overview

This directory provides a collection of utility functions for working with Abstract Syntax Tree
(AST) nodes using the ts-morph library. These helpers enable type checking and normalization of
various AST node types, particularly initializer expressions commonly found in variable
declarations. It currently contains 8 files and 0 subdirectories.

## 2. File Summaries

### Files

- **default-globs.mjs** - Exports DEFAULT_GLOBS array containing glob patterns for scanning source files: `**/*.{ts,tsx,js,jsx,mjs,cjs}` with exclusions for node_modules, .git, dist, and coverage directories.
- **index.mjs** - Facade module that re-exports all utilities from the directory for convenient centralized imports.
- **is-class-like-initializer.mjs** - Identifies class expression initializers by checking for ClassExpression SyntaxKind. Useful when analyzing class-based variable declarations.
- **is-function-like-initializer.mjs** - Identifies function-like initializers (ArrowFunction or FunctionExpression nodes). Provides a simple boolean check for function-type AST nodes.
- **is-iife-initializer.mjs** - Detects immediately invoked function expressions (IIFEs). Checks if an initializer is a CallExpression where the expression is a FunctionExpression, ArrowFunction, or ParenthesizedExpression. Useful for identifying self-invoking function patterns.
- **is-object-like-initializer.mjs** - Checks if an initializer is an ObjectLiteralExpression. Useful for detecting object literal assignments in variable declarations.
- **normalize-path.mjs** - Normalizes file paths to be relative to the current working directory and converts Windows backslashes to forward slashes. Ensures consistent cross-platform path handling.
- **setup-epipe-handler.mjs** - Configures a process-level error handler for EPIPE errors. These occur when stdout is piped to another command that closes early (e.g., piping to `head` or `tail`). The handler gracefully exits with code 0 rather than crashing.

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
- **Imported packages** - Representative external dependencies referenced here include `ts-morph`.

## 6. Additional Comments

- This directory exposes a public API through `index.mjs`.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
