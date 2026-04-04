// Generated from ../../../../scripts/ops/integrations/linear/agent-workflow-create-issue.mjs:104

import { createIssue, STATES, LABELS, TEAM_ID } from "../linear-client.mjs";

import { args } from "./args.mjs";
import { getPriorityName } from "./get-priority-name.mjs";
import { parseLabels } from "./parse-labels.mjs";
import { showHelp } from "./show-help.mjs";
import { validatePriority } from "./validate-priority.mjs";
import { validateStateId } from "./validate-state-id.mjs";

export async function createLinearIssueWorkflow() {
  try {
    // Show help if requested
    if (args.values.help) {
      showHelp();
      return;
    }

    // Validate required arguments
    if (!args.values.title) {
      console.error("❌ Error: Title is required. Use --title or -t to specify the issue title.");
      showHelp();
      process.exit(1);
    }

    // Parse and validate inputs
    const priority = validatePriority(args.values.priority);
    const stateId = validateStateId(args.values.stateId);
    const labelIds = parseLabels(args.values.labels);

    console.log("📋 Agent Workflow: Creating Linear Issue");
    console.log("=".repeat(50));
    console.log(`📝 Title: ${args.values.title}`);
    console.log(`📄 Description: ${args.values.description || "(none provided)"}`);
    console.log(`⚡ Priority: ${priority} (${getPriorityName(priority)})`);
    console.log(
      `🏷️  Labels: ${labelIds.length > 0 ? labelIds.map((id) => Object.keys(LABELS).find((k) => LABELS[k] === id)) : "none"}`,
    );
    console.log(`📊 State: ${stateId}`);
    console.log(`👥 Team ID: ${TEAM_ID}`);
    console.log("=".repeat(50));

    // Create the Linear issue
    console.log("🚀 Creating Linear issue...");

    const issue = await createIssue({
      title: args.values.title,
      description: args.values.description || "No description provided",
      stateId: STATES[stateId],
      labelIds: labelIds.length > 0 ? labelIds : [LABELS.harness],
      priority: priority,
      estimate: 1, // Default estimate
    });

    // Success! Report back to user
    console.log("\n✅ SUCCESS: Linear issue created successfully!");
    console.log("=".repeat(50));
    console.log(`🔗 Issue URL: https://linear.app/anqr/issue/${issue.identifier}`);
    console.log(`🆔 Issue ID: ${issue.id}`);
    console.log(`📋 Identifier: ${issue.identifier}`);
    console.log(`📝 Title: ${issue.title}`);
    console.log(`🏷️  Labels: ${issue.labels.nodes.map((l) => l.name).join(", ")}`);
    console.log(`📊 State: ${issue.state.name}`);
    console.log(`⚡ Priority: ${issue.priority}`);
    console.log(`📈 Estimate: ${issue.estimate} points`);
    console.log("=".repeat(50));

    console.log("\n🎯 Next Steps:");
    console.log("1. Review the issue in Linear: https://linear.app/anqr/issue/" + issue.identifier);
    console.log("2. Update the issue with additional details if needed");
    console.log('3. Move the issue to "In Progress" when work begins');
    console.log('4. Update to "Done" when the work is complete');

    return issue;
  } catch (error) {
    console.error("\n❌ ERROR: Failed to create Linear issue");
    console.error("=".repeat(50));
    console.error(`Error: ${error.message}`);
    console.error("=".repeat(50));

    if (error.message.includes("LINEAR_API_KEY")) {
      console.error("\n🔑 Required Environment Variable:");
      console.error("Please set LINEAR_API_KEY environment variable with your Linear API key.");
      console.error("You can get your API key from: https://linear.app/settings/api");
    }

    console.error("\n💡 Usage Tips:");
    console.error("- Ensure you have a valid LINEAR_API_KEY environment variable");
    console.error("- Check that all required parameters are provided");
    console.error("- Verify that the team ID is correct");
    console.error("- Check that the state ID is valid");

    process.exit(1);
  }
}
