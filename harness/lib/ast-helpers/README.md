# AST Helpers

## 1. Directory Overview

This directory provides a collection of utility functions for working with Abstract Syntax Tree (AST) nodes using the ts-morph library. These helpers enable type checking and normalization of various AST node types, particularly initializer expressions commonly found in variable declarations.

## 2. File Summaries

- **is-iife-initializer.mjs** - Detects immediately invoked function expressions (IIFEs). Checks if an initializer is a CallExpression where the expression is a FunctionExpression, ArrowFunction, or ParenthesizedExpression. Useful for identifying self-invoking function patterns.

- **is-function-like-initializer.mjs** - Identifies function-like initializers (ArrowFunction or FunctionExpression nodes). Provides a simple boolean check for function-type AST nodes.

- **default-globs.mjs** - Exports DEFAULT_GLOBS array containing glob patterns for scanning source files: `**/*.{ts,tsx,js,jsx,mjs,cjs}` with exclusions for node_modules, .git, dist, and coverage directories.

- **is-object-like-initializer.mjs** - Checks if an initializer is an ObjectLiteralExpression. Useful for detecting object literal assignments in variable declarations.

- **setup-epipe-handler.mjs** - Configures a process-level error handler for EPIPE errors. These occur when stdout is piped to another command that closes early (e.g., piping to `head` or `tail`). The handler gracefully exits with code 0 rather than crashing.

- **index.mjs** - Facade module that re-exports all utilities from the directory for convenient centralized imports.

- **is-class-like-initializer.mjs** - Identifies class expression initializers by checking for ClassExpression SyntaxKind. Useful when analyzing class-based variable declarations.

- **normalize-path.mjs** - Normalizes file paths to be relative to the current working directory and converts Windows backslashes to forward slashes. Ensures consistent cross-platform path handling.

## 3. Overall Directory Function

This directory serves as a utility library for AST analysis and path normalization. The primary use case is analyzing variable declarations and their initializer expressions to determine the type of value being assigned. The is-\* family of functions provide type guards that enable conditional logic based on AST node types, while normalize-path ensures consistent path representation across different operating systems.

The setup-epipe-handler addresses a specific Node.js edge case where piping output to certain commands can cause EPIPE errors. Including this handler in CLI scripts prevents unexpected crashes during output redirection.

## 4. Usage Instructions

Import individual helpers from the index. Adjust the import path based on your file's location relative to this directory:

```javascript
// If importing from a file in lib/ast-helpers/:
import {
  isFunctionLikeInitializer,
  isObjectLikeInitializer,
  isClassLikeInitializer,
  isIifeInitializer,
  normalizePath,
  DEFAULT_GLOBS,
  setupEpipeHandler,
} from "./index.mjs";

// If importing from elsewhere in the project:
import { isIifeInitializer } from "./lib/ast-helpers/index.mjs";
```

For AST type checking, pass ts-morph nodes directly:

```javascript
import { isFunctionLikeInitializer } from "./lib/ast-helpers/index.mjs";

const declaration = sourceFile.getVariableDeclarations()[0];
const initializer = declaration.getInitializer();
if (isFunctionLikeInitializer(initializer)) {
  // Handle function initializer
}
```

For CLI scripts that may encounter piping issues:

```javascript
import { setupEpipeHandler } from "./lib/ast-helpers/index.mjs";

setupEpipeHandler();
// Now safe to pipe output to commands like head/tail
```

For path normalization:

```javascript
import { normalizePath } from "./lib/ast-helpers/index.mjs";

const normalized = normalizePath("/absolute/path/to/file");
// Returns relative path with forward slashes
```

## 5. Dependencies

- **ts-morph** - Required for SyntaxKind constants and AST node operations. The is-\* functions use ts-morph's type system for node identification.

- **Node.js** - The normalize-path and setup-epipe-handler modules use Node.js built-in modules (path, process).

No external runtime dependencies beyond ts-morph and Node.js built-ins.

## 6. Additional Comments

- The index.mjs file is auto-generated as a facade that re-exports all utilities. Direct imports from individual modules work but using the facade is recommended for consistency.

- All is-\* initializer functions follow a consistent pattern: they accept a ts-morph node (or null/undefined) and return a boolean, making them suitable for use in conditional expressions and type guards.

- The DEFAULT_GLOBS pattern excludes common directories that shouldn't be processed during source file scanning, making it suitable for glob-based file discovery in build tools or code analysis scripts.

- The normalizePath function uses process.cwd() to compute relative paths, so it should be called after the process has changed to the desired working directory if relative paths from a specific location are needed.
