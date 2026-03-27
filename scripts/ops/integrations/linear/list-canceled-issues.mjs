#!/usr/bin/env node

/**
 * list-canceled-issues.mjs — List all canceled Linear issues for review
 */

import { listIssuesByState } from './linear-client.mjs';
import { createLogger } from '../../lib/logger.mjs';

const { logInfo } = createLogger();

async function main() {
  logInfo('[list-canceled-issues] Fetching all canceled issues...\n');
  
  const issues = await listIssuesByState(['Canceled']);
  
  logInfo(`[list-canceled-issues] Found ${issues.length} canceled issues\n`);
  
  logInfo(`\n${'='.repeat(80)}`);
  logInfo(`CANCELED ISSUES (${issues.length} total)`);
  logInfo('='.repeat(80));
  
  for (const issue of issues) {
    const labels = (issue.labels?.nodes || []).map(l => l.name).join(', ');
    const priority = issue.priority ? `P${issue.priority}` : 'No P';
    
    logInfo(`\n${issue.identifier}: ${issue.title}`);
    logInfo(`  Priority: ${priority} | Labels: ${labels || 'none'}`);
    logInfo(`  Created: ${issue.createdAt.split('T')[0]}`);
    logInfo(`  Updated: ${issue.updatedAt.split('T')[0]}`);
    
    if (issue.description) {
      const preview = issue.description.substring(0, 200).replaceAll('\n', ' ');
      logInfo(`  Description: ${preview}${issue.description.length > 200 ? '...' : ''}`);
    }
  }
  
  logInfo('\n');
}

await main();
