#!/usr/bin/env node

/**
 * reopen-stuck-issues.mjs — Reopen Linear issues closed without evidence due to "Stuck: X consecutive turns"
 * 
 * Finds issues that were canceled with the "Stuck: 3 consecutive turns without tool calls" message,
 * which indicates they were closed by the symphony runner without capturing evidence.
 * 
 * Usage:
 *   LINEAR_API_KEY=... node scripts/ops/integrations/linear/reopen-stuck-issues.mjs
 *   LINEAR_API_KEY=... node scripts/ops/integrations/linear/reopen-stuck-issues.mjs --dry-run
 */

import { listIssuesByState, updateIssue, addComment, STATES } from './linear-client.mjs';
import { createLogger } from '../../lib/logger.mjs';

const { logInfo, logWarn, logError } = createLogger();

const STUCK_PATTERN = new RegExp(String.raw`Stuck:\s*\d+\s*consecutive turns without tool calls`, 'i');

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  
  logInfo(`[reopen-stuck-issues]${dryRun ? ' (DRY RUN)' : ''} Starting...\\n`);
  
  // Search both Canceled and Done states for stuck issues
  const canceledIssues = await listIssuesByState(['Canceled']);
  const doneIssues = await listIssuesByState(['Done']);
  const allIssues = [...canceledIssues, ...doneIssues];
  
  logInfo(`[reopen-stuck-issues] Searching ${allIssues.length} closed issues\\n`);
  
  const stuckIssues = [];
  
  for (const issue of allIssues) {
    const description = issue.description || '';
    
    // Check if description contains the "Stuck: X consecutive turns" pattern
    if (STUCK_PATTERN.test(description)) {
      // Check if it lacks evidence (no "Evidence Payload", no "Commands run", no substantive content)
      const hasEvidence = 
        description.includes('Evidence Payload') ||
        description.includes('Commands run') ||
        description.includes('✅') ||
        description.includes('Type errors') ||
        description.includes('Lint errors') ||
        description.includes('Test results') ||
        (description.length > 500 && description.includes('Summary'));
      
      if (!hasEvidence) {
        stuckIssues.push({
          issue,
          reason: 'Closed with "Stuck" message without evidence',
          state: issue.state.name,
        });
      }
    }
  }
  
  if (stuckIssues.length === 0) {
    logInfo('[reopen-stuck-issues] No stuck issues without evidence found\\n');
    return;
  }
  
  logWarn(`\\n[reopen-stuck-issues] Found ${stuckIssues.length} issues to reopen:\\n`);
  
  for (const { issue, reason, state } of stuckIssues) {
    const labels = (issue.labels?.nodes || []).map(l => l.name).join(', ');
    const priority = issue.priority ? `P${issue.priority}` : 'No P';
    
    logWarn(`\\n${issue.identifier}: ${issue.title}`);
    logWarn(`  State: ${state} | Priority: ${priority} | Labels: ${labels || 'none'}`);
    logWarn(`  Reason: ${reason}`);
    logWarn(`  Created: ${issue.createdAt.split('T')[0]}`);
    
    if (issue.description) {
      const preview = issue.description.substring(0, 300).replaceAll('\\n', ' ');
      logWarn(`  Description: ${preview}${issue.description.length > 300 ? '...' : ''}`);
    }
  }
  
  if (dryRun) {
    logInfo('\\n[DRY RUN] Would reopen these issues and move to Backlog state\\n');
    return;
  }
  
  logInfo(`\\n[reopen-stuck-issues] Reopening ${stuckIssues.length} issues...\\n`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (const { issue, reason } of stuckIssues) {
    try {
      // Move to Backlog state
      await updateIssue(issue.id, {
        stateId: STATES.backlog,
      });
      
      // Add comment explaining the reopening
      await addComment(
        issue.id,
        `🔄 **Issue reopened to capture evidence**

Reason: ${reason}

**Problem**: This issue was closed by the Symphony runner with a "Stuck: X consecutive turns without tool calls" message, but no evidence was captured. This is an unacceptable result.

**Root Cause**: The runner's turn-tracking logic (symphony-agent.mjs:825) is too strict and doesn't distinguish between:
- Legitimate planning/reading phases that don't require tools
- Agents that are actively working but haven't called tools yet
- Streaming responses that don't populate tool_calls arrays
- Autonomous agents (like Codebuff) that work differently

**Required Actions**:
1. **Re-execute the task** — Run the Symphony runner again to capture proper evidence
2. **Verify completion** — Ensure all validation tools ran (typecheck, lint, cspell, ast-density, tests)
3. **Document evidence** — Capture commands run, results, commit hash, before/after state
4. **Close properly** — Only close after evidence is documented

**Related Issues**:
- ANQ-1052: Fix improper issue closure bug (root cause fix)
- See scripts/ops/integrations/linear/create-stuck-issue-close-bug.mjs for full analysis

Do not close this issue again without proper evidence.`
      );
      
      logInfo(`✅ Reopened ${issue.identifier}: ${issue.title}`);
      successCount++;
      
      // Rate limit: small delay between updates
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      logError(`❌ Failed to reopen ${issue.identifier}: ${error.message}`);
      failCount++;
    }
  }
  
  logInfo(`\\n[reopen-stuck-issues] Complete: ${successCount} reopened, ${failCount} failed\\n`);
}

await main();
