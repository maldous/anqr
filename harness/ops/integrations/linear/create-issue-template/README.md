# ANQR Linear Issue Template

## 1. Directory Overview

This directory contains the Linear issue creation template system for the ANQR (Agentic Number Query Runner) harness. It provides standardized templates, customization helpers, and validation tools to ensure high-quality, consistent issue creation in Linear. The module enforces issue quality standards and follows the project's work type taxonomy.

## 2. File Summaries

### index.mjs (Facade Index)

Auto-generated facade that exports all public API members from sibling modules. Re-exports `issueTemplate`, `customizeIssue`, `validateIssue`, and `main` from their respective implementation files.

### runtime.mjs (Runtime Carry-Forward)

Generated runtime module that imports from `./index.mjs` and executes the main function when run directly. Exports the default object containing `issueTemplate`, `customizeIssue`, `validateIssue`, and `main` for programmatic usage.

### issue-template.mjs

The core template definition containing the standardized issue structure. Exports `issueTemplate` object with:

- **title**: Format `[Component] Issue title describing the work` (e.g., `[QR Engine] Fix memory leak in rendering component`)
- **description**: Multi-section Markdown template including Problem, Root Cause, Impact, Solution, Acceptance Criteria, Evidence, References, and Additional Context sections with detailed guidance and examples
- **stateId**: Default state (STATES.todo)
- **labelIds**: Default labels ([LABELS.harness])
- **priority**: Default priority level (3 = Normal)
- **estimate**: Default story points (2 = Small task)

### customize-issue.mjs

Helper function that takes a base template and produces a customized issue by replacing placeholder text with specific issue details. Uses string replacement to customize title, description sections, acceptance criteria, evidence, and references. Currently contains a sample memory leak example that developers should modify to fit their specific issue needs.

### validate-issue.mjs

Validation function that checks issue input quality before creation. Runs validation through both the Linear client's validation system and the local validation module, combining results. Reports errors, warnings, and recommendations with a quality score. Exits with error code 1 if validation fails, warns if score is below 80.

### main.mjs

CLI entry point that orchestrates the issue creation workflow. Customizes the template, validates the issue, creates it via the Linear API, and displays the result including identifier, title, state, priority, estimate, labels, and URL. Provides next steps guidance for issue management.

## 3. Overall Directory Function

This directory serves as the standardized issue creation layer for the ANQR project. The files work together to provide:

- **Template Enforcement**: The `issue-template.mjs` ensures all issues follow the same structure with required sections (Problem, Root Cause, Impact, Solution, Acceptance Criteria, Evidence, References)
- **Customization**: The `customize-issue.mjs` allows developers to easily create issue-specific content while maintaining the standardized structure
- **Quality Validation**: The `validate-issue.mjs` validates issues against quality standards before creation, preventing low-quality or incomplete issues from being submitted
- **Automated Creation**: The `main.mjs` automates the entire workflow from template to creation in Linear

The module integrates with the broader Linear integration layer (`../linear-client.mjs`) for API operations and uses the work type taxonomy defined in `docs/program/04-taxonomy.md` for labeling.

## 4. Usage Instructions

### Programmatic Usage

```javascript
import {
  issueTemplate,
  customizeIssue,
  validateIssue,
} from "./ops/integrations/linear/create-issue-template/index.mjs";

// Customize the template for your specific issue
const myIssue = customizeIssue(issueTemplate);

// Validate before creation
await validateIssue(myIssue);

// Use with Linear client to create
import { createIssue } from "../linear-client.mjs";
const created = await createIssue(myIssue);
```

### CLI Usage

Run via the facade (recommended):

```bash
node ops/integrations/linear/create-issue-template.mjs
```

Or directly:

```bash
node ops/integrations/linear/create-issue-template/main.mjs
```

### Customization

Edit `customize-issue.mjs` to customize the template with your specific issue details:

- Replace title with your component and description
- Fill in Problem, Root Cause, Impact, Solution sections
- Update Acceptance Criteria with specific, measurable checkboxes
- Add Evidence (error logs, screenshots, metrics)
- Link Related issues and documentation

## 5. Dependencies

### Internal Dependencies

- **../linear-client.mjs** - Linear API client providing `createIssue`, `STATES`, and `LABELS`
- **../validate-issue.mjs** - Local issue validation logic

### External Dependencies

- Node.js with ESM support (.mjs files)
- Valid Linear API credentials configured in environment
- Documentation reference: `docs/program/04-taxonomy.md` for work type labels

### Configuration Requirements

- Linear API key configured (LINEAR_API_KEY or similar)
- Understanding of project work type taxonomy:
  - harness: AI pipeline and automation work
  - governance: Rules, policies, decision frameworks
  - hygiene: Cleanup and maintenance
  - product: User-facing features
  - release: Version preparation and deployment
  - growth: Marketing and adoption
  - incident: Unexpected failures or outages
  - research: Exploratory work

## 6. Additional Comments

- **Quality Scoring**: Issues with a quality score below 80 will trigger a warning but still allow creation. This encourages improvement without blocking rapid issue creation.

- **Dual Validation**: The validation system runs both Linear client validation and local validation to catch different types of issues.

- **Template Guidance**: The template includes extensive examples showing the difference between good and bad issue descriptions, helping users write high-quality issues.

- **Estimation Guidelines**: The template provides story point estimation guidance (1-13+ points) based on task complexity and time required.

- **Priority Levels**: Priority mapping follows standard Linear conventions (1=Urgent, 2=High, 3=Normal, 4=Low, 0=None).
