#!/usr/bin/env node

/**
 * agent-workflow-create-issue.mjs — Reusable agent workflow for reading instructions and creating Linear issues
 * 
 * This script provides a reusable template that AI agents can follow to:
 * 1. Read their governing instructions
 * 2. Understand the available Linear client tools
 * 3. Create properly formatted Linear issues
 * 4. Report success back to the user
 * 
 * Usage:
 * node scripts/ops/integrations/linear/agent-workflow-create-issue.mjs \
 *   --title "Issue Title" \
 *   --description "Issue description" \
 *   --priority 2 \
 *   --labels harness,bug \
 *   --stateId backlog
 */

import { createIssue, STATES, LABELS, TEAM_ID } from "./linear-client.mjs";
import { readFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';

// Available states and labels for validation
const AVAILABLE_STATES = Object.keys(STATES);
const AVAILABLE_LABELS = Object.keys(LABELS);

// Parse command line arguments
const args = parseArgs({
  options: {
    title: { type: 'string', short: 't' },
    description: { type: 'string', short: 'd' },
    priority: { type: 'string', short: 'p', default: '3' },
    labels: { type: 'string', short: 'l', default: 'harness' },
    stateId: { type: 'string', short: 's', default: 'backlog' },
    help: { type: 'boolean', short: 'h' },
  },
  allowPositionals: true,
});

// Help message
function showHelp() {
  console.log(`
Usage: node scripts/ops/integrations/linear/agent-workflow-create-issue.mjs [options]

Options:
  -t, --title <title>          Issue title (required)
  -d, --description <desc>     Issue description
  -p, --priority <1-4>         Priority: 0=none, 1=urgent, 2=high, 3=normal, 4=low (default: 3)
  -l, --labels <labels>        Comma-separated labels (default: 'harness')
  -s, --stateId <state>        State ID: ${AVAILABLE_STATES.join(', ')} (default: 'backlog')
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

// Validate priority
function validatePriority(priority) {
  const priorityNum = parseInt(priority, 10);
  if (isNaN(priorityNum) || priorityNum < 0 || priorityNum > 4) {
    throw new Error('Priority must be a number between 0 and 4');
  }
  return priorityNum;
}

// Validate state ID
function validateStateId(stateId) {
  if (!AVAILABLE_STATES.includes(stateId)) {
    throw new Error(`Invalid stateId. Available states: ${AVAILABLE_STATES.join(', ')}`);
  }
  return stateId;
}

// Parse and validate labels
function parseLabels(labelString) {
  if (!labelString) return [];
  
  const labelNames = labelString.split(',').map(l => l.trim());
  const invalidLabels = labelNames.filter(name => !AVAILABLE_LABELS.includes(name));
  
  if (invalidLabels.length > 0) {
    throw new Error(`Invalid labels: ${invalidLabels.join(', ')}. Available labels: ${AVAILABLE_LABELS.join(', ')}`);
  }
  
  return labelNames.map(name => LABELS[name]);
}

// Main workflow function
async function createLinearIssueWorkflow() {
  try {
    // Show help if requested
    if (args.values.help) {
      showHelp();
      return;
    }

    // Validate required arguments
    if (!args.values.title) {
      console.error('❌ Error: Title is required. Use --title or -t to specify the issue title.');
      showHelp();
      process.exit(1);
    }

    // Parse and validate inputs
    const priority = validatePriority(args.values.priority);
    const stateId = validateStateId(args.values.stateId);
    const labelIds = parseLabels(args.values.labels);

    console.log('📋 Agent Workflow: Creating Linear Issue');
    console.log('='.repeat(50));
    console.log(`📝 Title: ${args.values.title}`);
    console.log(`📄 Description: ${args.values.description || '(none provided)'}`);
    console.log(`⚡ Priority: ${priority} (${getPriorityName(priority)})`);
    console.log(`🏷️  Labels: ${labelIds.length > 0 ? labelIds.map(id => Object.keys(LABELS).find(k => LABELS[k] === id)) : 'none'}`);
    console.log(`📊 State: ${stateId}`);
    console.log(`👥 Team ID: ${TEAM_ID}`);
    console.log('='.repeat(50));

    // Create the Linear issue
    console.log('🚀 Creating Linear issue...');
    
    const issue = await createIssue({
      title: args.values.title,
      description: args.values.description || 'No description provided',
      stateId: STATES[stateId],
      labelIds: labelIds.length > 0 ? labelIds : [LABELS.harness],
      priority: priority,
      estimate: 1, // Default estimate
    });

    // Success! Report back to user
    console.log('\n✅ SUCCESS: Linear issue created successfully!');
    console.log('='.repeat(50));
    console.log(`🔗 Issue URL: https://linear.app/anqr/issue/${issue.identifier}`);
    console.log(`🆔 Issue ID: ${issue.id}`);
    console.log(`📋 Identifier: ${issue.identifier}`);
    console.log(`📝 Title: ${issue.title}`);
    console.log(`🏷️  Labels: ${issue.labels.nodes.map(l => l.name).join(', ')}`);
    console.log(`📊 State: ${issue.state.name}`);
    console.log(`⚡ Priority: ${issue.priority}`);
    console.log(`📈 Estimate: ${issue.estimate} points`);
    console.log('='.repeat(50));
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Review the issue in Linear: https://linear.app/anqr/issue/' + issue.identifier);
    console.log('2. Update the issue with additional details if needed');
    console.log('3. Move the issue to "In Progress" when work begins');
    console.log('4. Update to "Done" when the work is complete');
    
    return issue;

  } catch (error) {
    console.error('\n❌ ERROR: Failed to create Linear issue');
    console.error('='.repeat(50));
    console.error(`Error: ${error.message}`);
    console.error('='.repeat(50));
    
    if (error.message.includes('LINEAR_API_KEY')) {
      console.error('\n🔑 Required Environment Variable:');
      console.error('Please set LINEAR_API_KEY environment variable with your Linear API key.');
      console.error('You can get your API key from: https://linear.app/settings/api');
    }
    
    console.error('\n💡 Usage Tips:');
    console.error('- Ensure you have a valid LINEAR_API_KEY environment variable');
    console.error('- Check that all required parameters are provided');
    console.error('- Verify that the team ID is correct');
    console.error('- Check that the state ID is valid');
    
    process.exit(1);
  }
}

// Helper function to get priority name
function getPriorityName(priority) {
  const priorityNames = ['None', 'Urgent', 'High', 'Normal', 'Low'];
  return priorityNames[priority] || 'Unknown';
}

// Export the workflow function for use by other scripts
export async function workflowCreateLinearIssue(params) {
  try {
    // Override args with provided params
    const originalArgs = {...args};
    
    // Simulate command line arguments
    const simulatedArgs = {
      values: {
        title: params.title,
        description: params.description,
        priority: params.priority?.toString() || '3',
        labels: params.labels?.join(',') || 'harness',
        stateId: params.stateId || 'backlog',
        help: false,
      }
    };
    
    // Temporarily override args
    Object.assign(args, simulatedArgs);
    
    const result = await createLinearIssueWorkflow();
    
    // Restore original args
    Object.assign(args, originalArgs);
    
    return result;
  } catch (error) {
    console.error('❌ Workflow error:', error.message);
    throw error;
  }
}

// Run the workflow if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  await createLinearIssueWorkflow();
}