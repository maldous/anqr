# AST Helpers

## 1. Directory Overview

This directory implements **AST Helpers** within the ANQR harness. Key immediate entries include `index.mjs`, `is-function-like-initializer.mjs`, `is-object-like-initializer.mjs`, `is-class-like-initializer.mjs`. The current inventory is 8 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **default-globs.mjs** - Exports `DEFAULT_GLOBS`, a shared constant used by sibling modules.
- **index.mjs** - Facade module that re-exports public members from `./default-globs.mjs`, `./normalize-path.mjs`, `./is-function-like-initializer.mjs`, `./is-class-like-initializer.mjs`, `./is-object-like-initializer.mjs`, `./is-iife-initializer.mjs`, and 1 more siblings.
- **is-class-like-initializer.mjs** - Exports `isClassLikeInitializer`, which checks whether class like initializer.
- **is-function-like-initializer.mjs** - Exports `isFunctionLikeInitializer`, which checks whether function like initializer.
- **is-iife-initializer.mjs** - Exports `isIifeInitializer`, which checks whether iife initializer.
- **is-object-like-initializer.mjs** - Exports `isObjectLikeInitializer`, which checks whether object like initializer.
- **normalize-path.mjs** - Exports `normalizePath`, which normalizes path.
- **setup-epipe-handler.mjs** - Exports `setupEpipeHandler`, which sets up epipe handler.

## 3. Overall Directory Function

The directory primarily provides reusable modules that are imported by sibling runtime, orchestration, or validation code. Verified immediate files in this directory use git/worktree awareness.

## 4. Usage Instructions

```javascript
import * as moduleApi from "./lib/ast-helpers/index.mjs";
```

## 5. Dependencies

- **Node.js built-ins** - `node:path`, `node:process`
- **External packages/services referenced in immediate code** - `ts-morph`

## 6. Additional Comments

- No direct standalone runtime entry point is defined in the immediate directory contents.
