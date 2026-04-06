# ANQR Linear Issue Template

## 1. Directory Overview

This directory contains the Linear issue creation template system for the ANQR (Agentic Number Query
Runner) harness. It provides standardized templates, customization helpers, and validation tools to
ensure high-quality, consistent issue creation in Linear. The module enforces issue quality
standards and follows the project's work type taxonomy. It currently contains 6 files and 0
subdirectories.

## 2. File Summaries

### Files

- **customize-issue.mjs** - Helper function that takes a base template and produces a customized issue by replacing placeholder text with specific issue details. Uses string replacement to customize title, description sections, acceptance criteria, evidence, and references. Currently contains a sample memory leak example that developers should modify to fit their specific issue needs.
- **index.mjs** - Facade module that re-exports the public members of this directory.
- **issue-template.mjs** - The core template definition containing the standardized issue structure. Exports `issueTemplate` object with:
- **main.mjs** - CLI entry point that orchestrates the issue creation workflow. Customizes the template, validates the issue, creates it via the Linear API, and displays the result including identifier, title, state, priority, estimate, labels, and URL. Provides next steps guidance for issue management.
- **runtime.mjs** - Runtime carry-forward entry point that imports and executes the main module.
- **validate-issue.mjs** - Validation function that checks issue input quality before creation. Runs validation through both the Linear client's validation system and the local validation module, combining results. Reports errors, warnings, and recommendations with a quality score. Exits with error code 1 if validation fails, warns if score is below 80.

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point, `main.mjs` coordinates the main execution
path, `runtime.mjs` provides a direct execution path. The README content below is aligned to the
current immediate directory contents.

## 4. Usage Instructions

```bash
node ops/integrations/linear/create-issue-template/runtime.mjs
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This directory follows the common harness pattern where `index.mjs` exposes the public API and `runtime.mjs` provides direct execution.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
