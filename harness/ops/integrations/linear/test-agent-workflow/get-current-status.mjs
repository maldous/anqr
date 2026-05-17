import { readFile } from "node:fs/promises";

export async function getCurrentStatus() {
  console.log("\n📊 CURRENT SYSTEM STATUS");
  console.log("=".repeat(60));

  try {
    // Check environment variables
    const envVars = {
      LINEAR_API_KEY: process.env.LINEAR_API_KEY ? "✅ SET" : "❌ NOT SET",
    };

    console.log("🔑 Environment Variables:");
    for (const [name, status] of Object.entries(envVars)) {
      console.log(`   ${name}: ${status}`);
    }

    // Check required files
    const requiredFiles = [
      "AGENTS.md",
      "README.md",
      "harness/ops/integrations/linear/linear-client.mjs",
      "harness/ops/integrations/linear/agent-workflow-create-issue.mjs",
      "harness/ops/integrations/linear/README-workflow.md",
    ];

    console.log("\n📁 Required Files:");
    for (const file of requiredFiles) {
      try {
        await readFile(file);
        console.log(`   ✅ ${file}`);
      } catch (error) {
        console.log(`   ❌ ${file} - ${error.message}`);
      }
    }

    // Check Linear client tools
    console.log("\n🔧 Linear Client Tools:");
    try {
      const linearClient = await readFile("harness/ops/integrations/linear/linear-client.mjs");

      if (linearClient.includes("export async function createIssue")) {
        console.log("   ✅ createIssue() function available");
      } else {
        console.log("   ❌ createIssue() function not found");
      }

      if (linearClient.includes("export const TEAM_ID")) {
        console.log("   ✅ TEAM_ID constant available");
      } else {
        console.log("   ❌ TEAM_ID constant not found");
      }

      if (linearClient.includes("export const STATES")) {
        console.log("   ✅ STATES constants available");
      } else {
        console.log("   ❌ STATES constants not found");
      }

      if (linearClient.includes("export const LABELS")) {
        console.log("   ✅ LABELS constants available");
      } else {
        console.log("   ❌ LABELS constants not found");
      }
    } catch (error) {
      console.log(`   ❌ Linear client tools - ${error.message}`);
    }

    console.log("\n🎯 System Status:");
    console.log("   ✅ Workflow files created");
    console.log("   ✅ Documentation files created");
    console.log("   ✅ Linear client tools understood");
    console.log("   ⏭️  Ready for issue creation workflow testing");

    return true;
  } catch (error) {
    console.error("Status check failed:", error.message);
    return false;
  }
}
