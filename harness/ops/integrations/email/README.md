# ANQR Email Integrations

## 1. Directory Overview

This directory contains email ingest functionality and email-source integration ownership for the ANQR (Agentic Number Query Runner) harness. It provides the capability to ingest emails and integrate with the broader email-source ecosystem within the project.

## 2. File Summaries

### Facade Module

- **email-ingest.mjs** - Auto-generated facade file that re-exports from `./email-ingest/index.mjs` and `./email-ingest/runtime.mjs`. This is the main entry point for the email ingest functionality, providing a decomposed module structure for better organization and maintainability.

### README

- **README.md** - This file. Provides documentation for the email integrations directory.

## 3. Overall Directory Function

This directory serves as the email integration layer for the ANQR harness. It handles the ingestion of emails and provides integration points with the email-source system. The facade pattern is used here, where the main module exports from sibling subdirectories (index.mjs and runtime.mjs) to maintain backwards compatibility while allowing for cleaner code organization.

## 4. Usage Instructions

This directory is primarily used through imports from other harness modules. The email-ingest.mjs facade is the canonical entry point:

```javascript
import * as emailIngest from "./ops/integrations/email/email-ingest.mjs";
```

For direct execution (if applicable):

```bash
node ops/integrations/email/email-ingest.mjs
```

## 5. Dependencies

### Internal Dependencies

- **./email-ingest/index.mjs** - Main implementation module
- **./email-ingest/runtime.mjs** - Runtime carry-forward module

### External Dependencies

- Node.js with ESM support (.mjs files)
- Any email-source integration dependencies (refer to subdirectory modules)

## 6. Additional Comments

- The facade module follows the project's decomposition pattern where original files have been split into sibling modules for better organization
- Email ingest functionality is part of the broader integrations layer in the ANQR system
- This directory works in conjunction with other integration modules (linear, notifications, model, sonar) to provide comprehensive external system connectivity
