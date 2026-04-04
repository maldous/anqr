# Linear Agent Workflow Documentation

This directory contains reusable workflows and tools for AI agents to interact with Linear effectively.

## 🎯 Purpose

The goal is to provide AI agents with clear instructions and tools to:

1. **Read their governing instructions** (AGENTS.md, README.md, etc.)
2. **Understand available Linear client tools** (linear-client.mjs)
3. **Create properly formatted Linear issues** following best practices
4. **Report success back to users** with issue URLs

## 📋 Available Workflows

### 1. `agent-workflow-create-issue.mjs` - Reusable Issue Creation Workflow

This is the primary workflow script that agents can use to create Linear issues.

#### 🚀 Quick Start

```bash
# Basic usage
node harness/ops/integrations/linear/agent-workflow-create-issue.mjs \
  --title "Fix validation error in QR generation" \
  --description "QR generation fails when input contains special characters" \
  --priority 2 \
  --labels harness,bug

# With state specification
node harness/ops/integrations/linear/agent-workflow-create-issue.mjs \
  --title "Update README with new agent workflow" \
  --description "Document the new agent workflow for creating Linear issues" \
  --priority 3 \
  --labels documentation,governance \
  --stateId todo
```

#### 📖 Usage Guide

**Required Parameters:**

- `--title` or `-t`: The issue title

**Optional Parameters:**

- `--description` or `-d`: Issue description (defaults to "No description provided")
- `--priority` or `-p`: Priority level (0=none, 1=urgent, 2=high, 3=normal, 4=low) (default: 3)
- `--labels` or `-l`: Comma-separated labels (default: "harness")
- `--stateId` or `-s`: State ID (backlog, todo, inProgress, inReview, done, canceled) (default: "backlog")
- `--help` or `-h`: Show help message

**Available States:**

- `backlog` - Issues that need to be prioritized
- `todo` - Issues ready to be worked on
- `inProgress` - Issues currently being worked on
- `inReview` - Issues ready for review
- `done` - Completed issues
- `canceled` - Canceled issues

**Available Labels:**

- `harness` - Harness and operations work
- `governance` - Workspace and policy work
- `hygiene` - Cleanup and maintenance
- `product` - Product features
- `release` - Release and deployment
- `growth` - Marketing and analytics
- `incident` - Incidents and hotfixes
- `research` - Exploratory work
- `bug` - Defects (legacy)
- `reliability` - Stability (legacy)
- `discord` - Discord-sourced issues

#### 🔧 Programmatic Usage

You can also import and use the workflow function programmatically:

```javascript
import { workflowCreateLinearIssue } from "./harness/ops/integrations/linear/agent-workflow-create-issue.mjs";

// Create an issue programmatically
const issue = await workflowCreateLinearIssue({
  title: "Fix validation error in QR generation",
  description: "QR generation fails when input contains special characters",
  priority: 2, // High priority
  labels: ["harness", "bug"],
  stateId: "todo",
});

console.log(`Created issue: ${issue.identifier}`);
console.log(`URL: https://linear.app/anqr/issue/${issue.identifier}`);
```

#### 📊 Output Format

The workflow provides detailed output including:

- Issue URL for direct access
- Issue identifier (e.g., ANQ-1234)
- Issue ID (internal Linear ID)
- Labels applied
- State and priority information
- Next steps for the user

#### 🎯 Best Practices

**When creating issues, follow these guidelines:**

1. **Use descriptive titles**: Clearly state what needs to be done
2. **Provide complete descriptions**: Include context, scope, and acceptance criteria
3. **Apply appropriate labels**: Use the label taxonomy to categorize work
4. **Set correct priority**: Use priority levels appropriately
5. **Choose the right state**: Start with "backlog" or "todo" for new work
6. **Include estimates**: Set reasonable story point estimates

**Example Issue Structure:**

````markdown
## Title

Fix validation error in QR generation

## Description

QR generation fails when input contains special characters like <, >, &, etc.

## Scope Class

- docs-harness / current-platform / launch-convergence / operational-external

## Required Context

- README.md
- AGENTS.md
- docs/README.md

## Touched Paths

- apps/web/src/components/QRGenerator.tsx
- packages/domain/qr/src/validation.ts

## Constraints

- Must preserve existing QR generation behavior for valid inputs
- Must handle special characters gracefully
- Must maintain backward compatibility

## Verification

```bash
npm run test:unit
npm run test:basic
```
````

## Expected Evidence

- Summary of changes
- Commands run with pass/fail results
- Changed files
- Commit hash
- Rollback note

## Escalate If

- Paid spend is required
- Production auth changes are needed

````

## 🔍 Linear Client Tools

The workflow uses the following Linear client tools from `linear-client.mjs`:

### Core Functions

- `createIssue(input)` - Create a new Linear issue
- `updateIssue(issueId, input)` - Update an existing issue
- `addComment(issueId, body)` - Add a comment to an issue
- `applyLabels(issueId, labelIds)` - Apply labels to an issue

### Constants

- `TEAM_ID` - The target team ID (hardcoded to ANQR workspace)
- `STATES` - Available states with their IDs
- `LABELS` - Available labels with their IDs

### State IDs

```javascript
STATES = {
  backlog: "d9eeea8d-825b-4aa3-8429-75223a6b3624",
  todo: "ad8eea3e-7f5b-48dc-89c0-14506781a8c9",
  inProgress: "55a7c230-419f-4f42-95f7-84cf923a261d",
  inReview: "5e9dd779-e3dd-4743-a9c2-c588e67dd43e",
  done: "348275d1-b2a6-481d-81e0-cf2465cbfefd",
  canceled: "eb842399-5ae1-4fd2-a73e-e53801cfba56",
};
````

### Label IDs

```javascript
LABELS = {
  harness: "647b6fd0-4deb-4da2-85f7-becb8a1605c9",
  governance: "9802d98b-326b-42e0-865b-8049043123b8",
  hygiene: "3d7df5f8-0312-44b4-ac7a-862b15fbf5da",
  product: "8a20cdc8-9272-4fa0-871e-790170a6aaca",
  release: "e8879dd8-2263-4ff2-a5fe-aac78af318d6",
  growth: "b63cf9fb-73c1-4285-b414-26655f1feccf",
  incident: "c4a5d8e2-5f91-4e84-b3d4-8a7bc3de12f5",
  research: "9e2f1a3b-4c6d-4e85-a1b8-9c7de2f4a1b6",
  bug: "0c2caa97-5497-461e-bb44-2ee29739e76d",
  reliability: "e0a66df5-7c67-4dec-80b0-ea33af32ab7c",
  discord: "9341d965-e21d-4c3d-81b2-73beff08356d",
};
```

## 📝 Example Workflows

### Creating a Documentation Issue

```bash
node harness/ops/integrations/linear/agent-workflow-create-issue.mjs \
  --title "Update AGENTS.md with new workflow documentation" \
  --description "Document the new agent workflow for creating Linear issues following best practices" \
  --priority 3 \
  --labels documentation,governance
```

### Creating a Bug Report

```bash
node harness/ops/integrations/linear/agent-workflow-create-issue.mjs \
  --title "Fix: QR generation fails with special characters" \
  --description "When QR input contains <, >, or & characters, generation fails with validation error" \
  --priority 2 \
  --labels harness,bug,reliability
```

### Creating a Feature Request

```bash
node harness/ops/integrations/linear/agent-workflow-create-issue.mjs \
  --title "Add support for animated QR codes" \
  --description "Implement support for generating animated QR codes using APNG format" \
  --priority 3 \
  --labels product,feature
```

## 🔧 Environment Setup

### Required Environment Variables

- `LINEAR_API_KEY` - Your Linear API key

**How to get your Linear API key:**

1. Go to https://linear.app/settings/api
2. Click "Create new token"
3. Give it a descriptive name (e.g., "ANQR Agent")
4. Copy the generated API key
5. Set it as an environment variable:

```bash
# Linux/macOS
export LINEAR_API_KEY="your-api-key-here"

# Windows (Command Prompt)
set LINEAR_API_KEY=your-api-key-here

# Windows (PowerShell)
$env:LINEAR_API_KEY="your-api-key-here"
```

**Permanent setup:**

Add the export command to your shell configuration file (`.bashrc`, `.zshrc`, etc.)

## 🎯 Integration with Symphony Agents

This workflow is designed to work seamlessly with Symphony agents. Agents can:

1. Read their governing instructions from AGENTS.md
2. Use the workflow script to create properly formatted issues
3. Report success back to users with issue URLs

### Agent Implementation Pattern

```javascript
// Example agent implementation pattern

// 1. Read governing instructions
const agentsMd = await readFile("AGENTS.md", "utf8");
const readme = await readFile("README.md", "utf8");

// 2. Understand the workflow
const workflow = await import("./harness/ops/integrations/linear/agent-workflow-create-issue.mjs");

// 3. Create the issue using the workflow
const issue = await workflow.workflowCreateLinearIssue({
  title: "Implement new feature X",
  description: "Detailed description of the feature and acceptance criteria",
  priority: 2,
  labels: ["product", "feature"],
  stateId: "todo",
});

// 4. Report success
console.log(`✅ Issue created: ${issue.identifier}`);
console.log(`🔗 URL: https://linear.app/anqr/issue/${issue.identifier}`);
```

## 📚 Related Documentation

- [AGENTS.md](../AGENTS.md) - AI Agent Execution Contract
- [linear-client.mjs](linear-client.mjs) - Linear API client library
- [docs/harness/05-quality-gates.md](../../docs/harness/05-quality-gates.md) - Quality gates and validation
- [docs/harness/06-evidence-and-reporting.md](../../docs/harness/06-evidence-and-reporting.md) - Evidence and reporting requirements

## 🆘 Troubleshooting

### Common Issues

**1. LINEAR_API_KEY not set**

```
❌ ERROR: Failed to create Linear issue
==================================================
Error: LINEAR_API_KEY environment variable is not set
==================================================
```

**Solution:** Set the LINEAR_API_KEY environment variable as shown above.

**2. Invalid stateId**

```
❌ ERROR: Failed to create Linear issue
==================================================
Error: Invalid stateId. Available states: backlog, todo, inProgress, inReview, done, canceled
==================================================
```

**Solution:** Use one of the available state IDs.

**3. Invalid labels**

```
❌ ERROR: Failed to create Linear issue
==================================================
Error: Invalid labels: invalid-label. Available labels: harness, governance, hygiene, product, release, growth, incident, research, bug, reliability, discord
==================================================
```

**Solution:** Use valid label names from the available list.

### Debug Mode

For debugging, you can run the script with additional logging:

```bash
# Enable verbose logging
DEBUG=linear-workflow* node harness/ops/integrations/linear/agent-workflow-create-issue.mjs --title "Test issue"
```

## 📈 Success Metrics

This workflow enables agents to:

- ✅ Autonomously create Linear issues
- ✅ Properly categorize and prioritize issues
- ✅ Follow best practices for issue formatting
- ✅ Report completion workflow reliably

## 🚀 Next Steps

1. **Review the workflow**: Understand how it works and what it provides
2. **Set up your API key**: Ensure you have a valid Linear API key
3. **Try it out**: Create a test issue to verify the workflow
4. **Integrate with agents**: Use the workflow in your AI agent implementations
5. **Provide feedback**: Report any issues or suggest improvements

---

**Last Updated:** 2025-01-01
**Workflow Version:** 1.0.0
**Status:** Ready for production use
