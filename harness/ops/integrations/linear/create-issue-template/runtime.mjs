import { main, issueTemplate, customizeIssue, validateIssue } from "./index.mjs";

if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}

export default {
  issueTemplate,
  customizeIssue,
  validateIssue,
  main,
};
