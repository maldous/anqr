// Generated from ../../../../scripts/ops/integrations/linear/test-agent-workflow.mjs:27

import { results } from "./results.mjs";

export function logTestResult(testName, passed, details = "") {
  results.testCases.push({
    testName,
    passed,
    timestamp: new Date().toISOString(),
    details,
  });

  if (passed) {
    console.log(`✅ PASS: ${testName}`);
    if (details) console.log(`   ${details}`);
    results.passed++;
  } else {
    console.log(`❌ FAIL: ${testName}`);
    if (details) console.log(`   ${details}`);
    results.failed++;
  }
}
