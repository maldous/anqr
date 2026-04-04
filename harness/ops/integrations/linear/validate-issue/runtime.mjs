// Generated runtime carry-forward.

import {
  main,
  validateIssueInput,
  formatValidationResult,
  getIssueQualityChecklist,
  validateCategorization,
  determinePriority,
  PRIORITY_LEVELS,
} from "./index.mjs";

if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}

export default {
  validateIssueInput,
  formatValidationResult,
  getIssueQualityChecklist,
  validateCategorization,
  determinePriority,
  PRIORITY_LEVELS,
};
