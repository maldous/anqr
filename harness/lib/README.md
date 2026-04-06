# Lib

## 1. Directory Overview

This directory contains utility libraries that provide reusable helper functions for the larger project. It serves as a central location for common functionality, particularly focused on AST (Abstract Syntax Tree) manipulation utilities using ts-morph and other supporting functions.

## 2. File Summaries

- **ast-helpers.mjs** - AUTO-GENERATED FACADE. This is a facade module that re-exports all utilities from the `./ast-helpers/index.mjs` sibling module. The original file has been decomposed into individual modules under the matching `ast-helpers/` directory for better organization and maintainability.

- **ast-helpers/** - Directory containing the actual AST helper implementations:
  - **index.mjs** - Facade index that re-exports all utilities from the directory for convenient centralized imports.
  - **is-iife-initializer.mjs** - Detects immediately invoked function expressions (IIFEs). Checks if an initializer is a CallExpression where the expression is a FunctionExpression, ArrowFunction, or ParenthesizedExpression.
  - **is-function-like-initializer.mjs** - Identifies function-like initializers (ArrowFunction or FunctionExpression nodes). Provides a simple boolean check for function-type AST nodes.
  - **is-object-like-initializer.mjs** - Checks if an initializer is an ObjectLiteralExpression. Useful for detecting object literal assignments in variable declarations.
  - **is-class-like-initializer.mjs** - Identifies class expression initializers by checking for ClassExpression SyntaxKind.
  - **default-globs.mjs** - Exports DEFAULT_GLOBS array containing glob patterns for scanning source files: `**/*.{ts,tsx,js,jsx,mjs,cjs}` with exclusions for node_modules, .git, dist, and coverage directories.
  - **setup-epipe-handler.mjs** - Configures a process-level error handler for EPIPE errors. These occur when stdout is piped to another command that closes early (e.g., piping to `head` or `tail`). The handler gracefully exits with code 0 rather than crashing.
  - **normalize-path.mjs** - Normalizes file paths to be relative to the current working directory and converts Windows backslashes to forward slashes. Ensures consistent cross-platform path handling.

## 3. Overall Directory Function

This directory serves as a utility library for AST analysis and path normalization. The primary use case is analyzing variable declarations and their initializer expressions to determine the type of value being assigned. The is-\* family of functions provide type guards that enable conditional logic based on AST node types, while normalize-path ensures consistent path representation across different operating systems.

The setup-epipe-handler addresses a specific Node.js edge case where piping output to certain commands can cause EPIPE errors. Including this handler in CLI scripts prevents unexpected crashes during output redirection.

The facade pattern (ast-helpers.mjs) allows importing all utilities through a single module while keeping the implementation details organized in a separate directory.

## 4. Usage Instructions

Import individual helpers from the facade. The import path depends on where your file is located relative to the lib directory:

```javascript
// If importing from within the lib/ directory:
import {
  isFunctionLikeInitializer,
  isObjectLikeInitializer,
  isClassLikeInitializer,
  isIifeInitializer,
  normalizePath,
  DEFAULT_GLOBS,
  setupEpipeHandler,
} from "./ast-helpers.mjs";

// If importing from elsewhere in the project:
import { isFunctionLikeInitializer } from "./lib/ast-helpers.mjs";
```

For AST type checking, pass ts-morph nodes directly:

```javascript
import { isFunctionLikeInitializer } from "./lib/ast-helpers.mjs";

const declaration = sourceFile.getVariableDeclarations()[0];
const initializer = declaration.getInitializer();
if (isFunctionLikeInitializer(initializer)) {
  // Handle function initializer
}
```

For CLI scripts that may encounter piping issues:

```javascript
import { setupEpipeHandler } from "./lib/ast-helpers.mjs";

setupEpipeHandler();
// Now safe to pipe output to commands like head/tail
```

For path normalization:

```javascript
import { normalizePath } from "./lib/ast-helpers.mjs";

const normalized = normalizePath("/absolute/path/to/file");
// Returns relative path with forward slashes
```

## 5. Dependencies

- **ts-morph** - Required for SyntaxKind constants and AST node operations. The is-\* functions use ts-morph's type system for node identification.

- **Node.js** - The normalize-path and setup-epipe-handler modules use Node.js built-in modules (path, process).

No external runtime dependencies beyond ts-morph and Node.js built-ins.

## 6. Additional Comments

- The ast-helpers.mjs file is auto-generated as a facade that re-exports all utilities from the ast-helpers/ directory. Using the facade is recommended for consistency, but direct imports from individual modules also work.

- All is-\* initializer functions follow a consistent pattern: they accept a ts-morph node (or null/undefined) and return a boolean, making them suitable for use in conditional expressions and type guards.

- The DEFAULT_GLOBS pattern excludes common directories that shouldn't be processed during source file scanning, making it suitable for glob-based file discovery in build tools or code analysis scripts.

- The normalizePath function uses process.cwd() to compute relative paths, so it should be called after the process has changed to the desired working directory if relative paths from a specific location are needed.
