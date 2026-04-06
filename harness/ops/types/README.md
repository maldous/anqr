# ANQR Types

## 1. Directory Overview

This directory contains TypeScript type declarations and shims for the ANQR (Agentic Number Query
Runner) harness. It provides type definitions that enable TypeScript to properly understand and
type-check `.mjs` (ECMAScript Module) files within the project. It currently contains 1 file and 0
subdirectories.

## 2. File Summaries

### Files

- **mjs-shim.d.ts** - TypeScript declaration file that provides module shimming for `.mjs` files. It declares a module for all `*.mjs` files and exports a generic `Record<string, any>` type, allowing TypeScript to import and use ES modules without strict type checking on the module contents.

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, the files in this directory are intended to be consumed together. The README content
below is aligned to the current immediate directory contents.

## 4. Usage Instructions

This directory is primarily consumed through its files and child modules rather than a single entry point.

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
