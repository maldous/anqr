#!/usr/bin/env node

/**
 * list-open-issues.mjs — List all open Linear issues for review
 */

import { listIssuesByState } from './linear-client.mjs';
import { createLogger } from '../../lib/logger.mjs';

const { logInfo } = createLogger();

const OPEN_STATES = ['Backlog', 'Todo', 'In Progress', 'In Review', 'Blocked', 'Human Review'];

async function main() {
  logInfo('[list-open-issues] Fetching all open issues...\n');
  
  const issues = await listIssuesByState(OPEN_STATES);
  
  logInfo(`[list-open-issues] Found ${issues.length} open issues\n`);
  
  // Group by state
  const byState = {};
  for (const issue of issues) {
    const state = issue.state.name;
    if (!byState[state]) byState[state] = [];
    byState[state].push(issue);
  }
  
  // Print summary
  for (const state of OPEN_STATES) {
    const stateIssues = byState[state] || [];
    if (stateIssues.length === 0) continue;
    
    logInfo(`\n${'='.repeat(60)}`);
    logInfo(`${state} (${stateIssues.length} issues)`);
    logInfo('='.repeat(60));
    
    for (const issue of stateIssues) {
      const labels = (issue.labels?.nodes || []).map(l => l.name).join(', ');
      const priority = issue.priority ? `P${issue.priority}` : 'No P';
      const age = Math.floor((Date.now() - new Date(issue.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      
      logInfo(`\n${issue.identifier}: ${issue.title}`);
      logInfo(`  Priority: ${priority} | Labels: ${labels || 'none'}`);
      logInfo(`  Created: ${issue.createdAt.split('T')[0]} (${age}d ago)`);
      logInfo(`  Updated: ${issue.updatedAt.split('T')[0]}`);
      
      if (issue.description) {
        const preview = issue.description.substring(0, 150).replace(/\n/g, ' ');
        logInfo(`  Description: ${preview}${issue.description.length > 150 ? '...' : ''}`);
      }
    }
  }
  
  // Summary by label
  logInfo(`\n\n${'='.repeat(60)}`);
  logInfo('Summary by Label');
  logInfo('='.repeat(60));
  
  const labelCounts = {};
  for (const issue of issues) {
    const labels = issue.labels?.nodes || [];
    for (const label of labels) {
      labelCounts[label.name] = (labelCounts[label.name] || 0) + 1;
    }
  }
  
  const sortedLabels = Object.entries(labelCounts).sort((a, b) => b[1] - a[1]);
  for (const [label, count] of sortedLabels) {
    logInfo(`  ${label}: ${count}`);
  }
  
  logInfo('\n');
}

await main();
