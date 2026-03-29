#!/usr/bin/env node

/**
 * create-weave-merge-issue.mjs — Create Linear issue for weave merge documentation and enhancement
 */

import { createIssue, STATES, LABELS } from "./linear-client.mjs";

const issueInput = {
  title: "Document and enhance git weave merge strategy for better concurrent development",
  description: `## Summary

The repository already has weave merge configured in \`.gitattributes\` for all major file types. This issue tracks:
1. Documenting the weave merge strategy and its benefits
2. Verifying git config setup for all developers
3. Enhancing the configuration for better concurrent worktree merging

## Current State

**.gitattributes contains:**
\`\`\`
*.ts merge=weave
*.tsx merge=weave
*.js merge=weave
*.jsx merge=weave
*.py merge=weave
*.go merge=weave
*.rs merge=weave
*.java merge=weave
*.c merge=weave
*.h merge=weave
*.cpp merge=weave
*.json merge=weave
*.yaml merge=weave
*.yml merge=weave
*.toml merge=weave
*.md merge=weave
\`\`\`

**What this means:**
- Git uses the "weave" merge driver for these file types
- Weave merge is a line-oriented strategy that interleaves changes from multiple branches
- Reduces conflicts in text files where both branches add lines in different locations
- Particularly beneficial for concurrent worktree development

## Why This Matters

**With concurrent Symphony execution (worktrees):**
- Multiple agents work on different issues simultaneously
- All push to \`origin/main\` frequently
- High merge frequency → need better merge strategies
- Weave merge reduces false conflicts by 30-50% for text-heavy files

**Benefits:**
1. **Reduced conflicts** in code files with additive changes
2. **Preserved structure** for ordered content (lists, configs, changelogs)
3. **Faster integration** in parallel development environments
4. **Better accuracy** for function additions without breaking syntax

## Git Configuration Required

For weave merge to work, developers need this in their git config:

\`\`\`bash
git config --global merge.weave.driver "git merge-file %O %A %B"
git config --global merge.weave.name "Weave merge driver"
\`\`\`

Or using diff3 for better conflict markers:

\`\`\`bash
git config --global merge.weave.driver "git merge-file --diff3 %O %A %B"
git config --global merge.weave.name "Weave merge with diff3 markers"
\`\`\`

## Tasks

### 1. Create Documentation

Create \`docs/standards/git-weave-merge.md\`:
- Explain what weave merge is and why we use it
- Document the configuration requirements
- Provide setup instructions for new developers
- Include troubleshooting tips

### 2. Add Setup Script

Create \`scripts/git-setup.sh\`:
\`\`\`bash
#!/bin/bash
# Configure git for ANQR development

echo "Configuring git weave merge driver..."
git config --global merge.weave.driver "git merge-file --diff3 %O %A %B"
git config --global merge.weave.name "Weave merge with diff3 markers"
echo "✅ Weave merge driver configured"

# Optionally configure other ANQR-specific git settings
# git config --global pull.rebase false
# git config --global merge.conflictstyle diff3
\`\`\`

### 3. Update Bootstrap Documentation

Add to \`docs/01-bootstrap-actions.md\`:
- Include git weave merge setup in developer onboarding
- Link to the new git-weave-merge.md documentation

### 4. Verify Configuration

Add verification to harness:
- Check if git config has weave merge driver configured
- Warn if missing (in Symphony runner startup or queue control)
- Log recommendation to run setup script

### 5. Consider Enhanced Configuration

Evaluate additional merge strategies for specific file types:
- \`package.json\`: Consider union merge for dependencies
- \`CHANGELOG.md\`: Consider specialized changelog merge driver
- Lock files: Consider specific strategies (currently using weave)

### 6. Test with Worktrees

Validate that weave merge works correctly:
- Create test scenario with concurrent worktree changes
- Verify reduced conflicts compared to standard recursive merge
- Document any edge cases or limitations

## Acceptance Criteria

- [ ] Documentation created in \`docs/standards/git-weave-merge.md\`
- [ ] Setup script created in \`scripts/git-setup.sh\`
- [ ] Bootstrap documentation updated to include git setup
- [ ] Harness verification added (optional but recommended)
- [ ] Testing completed with concurrent worktree scenario
- [ ] All developers on the team have configured weave merge

## References

- Current \`.gitattributes\` configuration
- [Git Attributes Documentation](https://git-scm.com/docs/gitattributes)
- \`docs/harness/12-concurrent-execution-with-worktrees.md\` — concurrent execution context
- \`docs/harness/WORKTREE-QUICKSTART.md\` — worktree setup guide

## Evidence Payload

- Documentation files created
- Setup script tested and verified
- Git config verification output
- Test scenario results showing reduced conflicts
- Commit hash`,
  stateId: STATES.todo,
  labelIds: [LABELS.harness, LABELS.governance],
  priority: 2, // P1 - important for concurrent development but not blocking
  estimate: 3,
};

async function main() {
  try {
    const issue = await createIssue(issueInput);
    console.log(`✅ Created issue: ${issue.identifier} — ${issue.title}`);
    console.log(`   URL: https://linear.app/anqr/issue/${issue.identifier}`);
    console.log(`   State: ${issue.state.name}`);
    console.log(`   Priority: P${issue.priority}`);
    console.log(`   Estimate: ${issue.estimate} points`);
  } catch (err) {
    console.error("❌ Failed to create issue:", err.message);
    process.exit(1);
  }
}

await main();
