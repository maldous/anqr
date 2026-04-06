# ANQR Types

## 1. Directory Overview

This directory contains TypeScript type declarations and shims for the ANQR (Agentic Number Query Runner) harness. It provides type definitions that enable TypeScript to properly understand and type-check `.mjs` (ECMAScript Module) files within the project.

## 2. File Summaries

- **mjs-shim.d.ts** - TypeScript declaration file that provides module shimming for `.mjs` files. It declares a module for all `*.mjs` files and exports a generic `Record<string, any>` type, allowing TypeScript to import and use ES modules without strict type checking on the module contents.

## 3. Overall Directory Function

This directory serves as a TypeScript compatibility layer for the ANQR harness. Since the project uses ES modules (`.mjs` files) extensively, this directory provides the necessary type declarations to allow TypeScript to compile and type-check the project without errors related to module resolution.

The `mjs-shim.d.ts` file acts as a catch-all type declaration that tells TypeScript "any .mjs file can be imported and will have an object-like exports structure." This enables the project to use ES modules while maintaining TypeScript compatibility.

## 4. Usage Instructions

This directory is automatically included in TypeScript compilation through the project's `tsconfig.json`. No direct interaction is required.

To verify the types are working correctly:

```bash
npx tsc --noEmit
```

The type declarations in this directory should be automatically picked up by the TypeScript compiler when it processes the project.

## 5. Dependencies

### Runtime Requirements

- **TypeScript** - The type declarations require TypeScript to be installed and configured in the project

### Configuration Dependencies

- **tsconfig.json** - The project's TypeScript configuration must include this directory or reference the declaration file

## 6. Additional Comments

- **Catch-all approach**: The current implementation uses a generic `Record<string, any>` type which provides basic type compatibility but loses type safety. This is a pragmatic approach to support ES modules in a TypeScript project.

- **Module augmentation**: If more precise typing is needed for specific `.mjs` files, more specific declaration files can be added to override or augment this generic shim.

- **ESM support**: This directory exists because the project uses ES modules (`.mjs`) which have different loading semantics than CommonJS modules that TypeScript understands by default.