#!/usr/bin/env node

/**
 * deprioritize-test-coverage-issues.mjs — Set test coverage issues to low priority
 * 
 * Focus areas are harness job stability, invalid tools, and Symphony features.
 * Test generation is deprioritized.
 */

import { findOpenIssuesByTitle, updateIssue } from "./linear-client.mjs";

const TEST_COVERAGE_PATTERNS = [
  "Phase 2: Domain Core Unit Tests",
  "Phase 3: Application Services Tests",
  "Phase 4: Platform & Netlify Adapters",
  "Phase 5: Harness Model Routing Tests",
  "Testing Infrastructure & Utilities",
  "UI & Analytics Coverage",
];

async function main() {
  console.log("🔍 Finding test coverage issues...\n");

  const allIssues = [];
  for (const pattern of TEST_COVERAGE_PATTERNS) {
    const issues = await findOpenIssuesByTitle(pattern);
    allIssues.push(...issues);
  }

  if (allIssues.length === 0) {
    console.log("ℹ️  No test coverage issues found. They may not have been created yet.");
    return;
  }

  console.log(`Found ${allIssues.length} test coverage issue(s):\n`);

  const updated = [];
  for (const issue of allIssues) {
    const currentPriority = issue.priority ? `P${issue.priority}` : "No P";
    console.log(`  ${issue.identifier}: ${issue.title.slice(0, 60)}...`);
    console.log(`    Current priority: ${currentPriority}`);

    if (issue.priority === 4) {
      console.log(`    ✓ Already at P4 (low), skipping\n`);
      continue;
    }

    try {
      await updateIssue(issue.id, { priority: 4 });
      updated.push(issue);
      console.log(`    ✅ Updated to P4 (low)\n`);
    } catch (err) {
      console.error(`    ❌ Failed to update: ${err.message}\n`);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Found: ${allIssues.length} test coverage issues`);
  console.log(`   Updated: ${updated.length} to P4 (low priority)`);
  console.log(`   Skipped: ${allIssues.length - updated.length} (already P4)\n`);
  console.log(`✅ Test coverage issues deprioritized. Focus on:`);
  console.log(`   - Harness job stability and processing`);
  console.log(`   - Invalid tools issues`);
  console.log(`   - Symphony features\n`);
}

await main();
