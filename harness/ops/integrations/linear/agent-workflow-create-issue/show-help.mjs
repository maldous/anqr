// Generated from ../../../../scripts/ops/integrations/linear/agent-workflow-create-issue.mjs:42

import { AVAILABLE_STATES } from "./available-states.mjs";

export function showHelp() {
  console.log(`
Usage: node scripts/ops/integrations/linear/agent-workflow-create-issue.mjs [options]

Options:
  -t, --title <title>          Issue title (required)
  -d, --description <desc>     Issue description
  -p, --priority <1-4>         Priority: 0=none, 1=urgent, 2=high, 3=normal, 4=low (default: 3)
  -l, --labels <labels>        Comma-separated labels (default: 'harness')
  -s, --stateId <state>        State ID: ${AVAILABLE_STATES.join(", ")} (default: 'backlog')
  -h, --help                   Show this help message

Examples:
  # Create a high-priority harness issue
  node scripts/ops/integrations/linear/agent-workflow-create-issue.mjs \\
    --title "Fix validation error in QR generation" \\
    --description "QR generation fails when input contains special characters" \\
    --priority 2 \\
    --labels harness,bug

  # Create a normal-priority documentation issue
  node scripts/ops/integrations/linear/agent-workflow-create-issue.mjs \\
    --title "Update README with new agent workflow" \\
    --description "Document the new agent workflow for creating Linear issues" \\
    --labels documentation,governance
`);
}
