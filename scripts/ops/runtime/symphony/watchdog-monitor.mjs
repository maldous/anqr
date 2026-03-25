#!/usr/bin/env node

/**
 * watchdog-monitor.mjs — Bridge Watchdog for Automatic Rollback
 *
 * Monitors Symphony and Codebuff bridges after restart. If either service
 * fails to come up within 60 seconds, automatically rolls back to the
 * previous git commit and restarts the services.
 *
 * Usage:
 *   node watchdog-monitor.mjs [--bridge symphony|codebuff|both]
 *
 * Environment:
 *   WATCHDOG_ENABLED       — Enable/disable watchdog (default: true)
 *   WATCHDOG_TIMEOUT_MS    — Health check timeout (default: 60000)
 *   WATCHDOG_ROLLBACK      — Enable git rollback (default: true)
 */

import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { sendDiscordEmbed } from "../../integrations/notifications/discord-webhook.mjs";
import { createLogger } from "../../lib/logger.mjs";

const { logInfo } = createLogger("watchdog-monitor");

const WATCHDOG_ENABLED = process.env.WATCHDOG_ENABLED !== "false";
const WATCHDOG_TIMEOUT_MS = parseInt(process.env.WATCHDOG_TIMEOUT_MS || "60000", 10);
const WATCHDOG_ROLLBACK = process.env.WATCHDOG_ROLLBACK !== "false";
const SYMPHONY_PORT = 4319;
const CODEBUFF_PORT = 4318;

const args = process.argv.slice(2);
const bridgeArg = args.find(a => a.startsWith("--bridge="))?.split("=")[1] || "both";

function log(msg) {
  logInfo(msg);
}

function exec(cmd, opts = {}) {
  try {
    return execSync(cmd, { encoding: "utf-8", ...opts }).trim();
  } catch {
    return null;
  }
}

async function checkBridgeHealth(port, name) {
  try {
    const response = await fetch(`http://127.0.0.1:${port}/health`, {
      signal: AbortSignal.timeout(5000),
    });
    
    if (!response.ok) {
      log(`❌ ${name} health check failed: HTTP ${response.status}`);
      return false;
    }
    
    const data = await response.json();
    log(`✅ ${name} health check passed: ${data.providersAvailable || 0} providers available`);
    return true;
  } catch (err) {
    log(`❌ ${name} health check error: ${err.message}`);
    return false;
  }
}

async function waitForBridge(port, name, timeoutMs) {
  const startTime = Date.now();
  const checkInterval = 2000; // Check every 2 seconds
  
  log(`⏳ Waiting for ${name} to become healthy (timeout: ${timeoutMs}ms)...`);
  
  while (Date.now() - startTime < timeoutMs) {
    const isHealthy = await checkBridgeHealth(port, name);
    if (isHealthy) {
      const elapsed = Date.now() - startTime;
      log(`✅ ${name} became healthy in ${elapsed}ms`);
      return true;
    }
    
    // Wait before next check
    await new Promise(resolve => setTimeout(resolve, checkInterval));
  }
  
  const elapsed = Date.now() - startTime;
  log(`❌ ${name} failed to become healthy within ${elapsed}ms`);
  return false;
}

async function rollbackGit() {
  if (!WATCHDOG_ROLLBACK) {
    log(`⚠️ Git rollback disabled (WATCHDOG_ROLLBACK=false)`);
    return false;
  }
  
  const currentCommit = exec("git rev-parse HEAD");
  const previousCommit = exec("git rev-parse HEAD~1");
  
  if (!currentCommit || !previousCommit) {
    log(`❌ Failed to get commit hashes - cannot rollback`);
    return false;
  }
  
  // VERY OBVIOUS ROLLBACK BANNER
  log(``);
  log(`╔═══════════════════════════════════════════════════════════════════════╗`);
  log(`║                                                                       ║`);
  log(`║   🚨 🚨 🚨  WATCHDOG AUTOMATIC ROLLBACK TRIGGERED  🚨 🚨 🚨          ║`);
  log(`║                                                                       ║`);
  log(`╚═══════════════════════════════════════════════════════════════════════╝`);
  log(``);
  log(`   Reason: Bridge failed to become healthy within timeout`);
  log(`   Current commit: ${currentCommit.slice(0, 7)} (FAILED)`);
  log(`   Rolling back to: ${previousCommit.slice(0, 7)} (PREVIOUS)`);
  log(``);
  log(`═══════════════════════════════════════════════════════════════════════`);
  log(``);
  
  // Send Discord notification about rollback
  sendDiscordEmbed({
    title: "🚨 WATCHDOG AUTOMATIC ROLLBACK TRIGGERED",
    description: `Bridge failed to become healthy after restart.\n\nRolling back to previous commit...`,
    color: 0xFF0000, // Red
    fields: [
      { name: "Failed Commit", value: currentCommit.slice(0, 7), inline: true },
      { name: "Rolling Back To", value: previousCommit.slice(0, 7), inline: true },
      { name: "Timeout", value: `${WATCHDOG_TIMEOUT_MS}ms`, inline: true },
    ],
  }).catch(err => log(`⚠️ Failed to send Discord notification: ${err.message}`));
  
  // Hard reset to previous commit
  const resetResult = exec("git reset --hard HEAD~1");
  if (!resetResult) {
    log(`❌ Git reset failed`);
    return false;
  }
  
  const newHead = exec("git rev-parse HEAD");
  if (newHead === previousCommit) {
    log(``);
    log(`✅ ROLLBACK SUCCESSFUL`);
    log(`   HEAD is now at: ${newHead.slice(0, 7)}`);
    log(``);
    
    // Send Discord success notification
    sendDiscordEmbed({
      title: "✅ Watchdog Rollback Successful",
      description: `Successfully rolled back to previous commit.\n\nBridge services will be restarted.`,
      color: 0x00FF00, // Green
      fields: [
        { name: "Reverted Commit", value: currentCommit.slice(0, 7), inline: true },
        { name: "Current Commit", value: newHead.slice(0, 7), inline: true },
      ],
    }).catch(err => log(`⚠️ Failed to send Discord notification: ${err.message}`));
    
    // Update MEMORY.md with very obvious rollback notice
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const rollbackBanner = `

═══════════════════════════════════════════════════════════════════════════════
🚨 🚨 🚨  WATCHDOG AUTOMATIC ROLLBACK OCCURRED  🚨 🚨 🚨
═══════════════════════════════════════════════════════════════════════════════

### ${timestamp} - WATCHDOG ROLLBACK: ${currentCommit.slice(0, 7)} → ${newHead.slice(0, 7)}

**REASON**: Bridge health check failed after restart (timeout: ${WATCHDOG_TIMEOUT_MS}ms)

**ACTION TAKEN**:
- Git reset --hard to previous commit (${newHead.slice(0, 7)})
- Bridge services restarted with previous code
- System automatically recovered

**FAILED COMMIT**: ${currentCommit.slice(0, 7)} (reverted)
**CURRENT COMMIT**: ${newHead.slice(0, 7)} (restored)

⚠️ **IMPORTANT**: Review the failed commit to identify what broke the bridge startup!

═══════════════════════════════════════════════════════════════════════════════

`;
      writeFileSync("MEMORY.md", rollbackBanner, { flag: "a" });
      log(`📝 Updated MEMORY.md with rollback notice`);
    } catch (err) {
      log(`⚠️ Failed to update MEMORY.md: ${err.message}`);
    }
    
    return true;
  } else {
    log(`❌ Rollback verification failed: HEAD is ${newHead.slice(0, 7)}, expected ${previousCommit.slice(0, 7)}`);
    return false;
  }
}

function restartBridge(name) {
  const serviceName = name === "Symphony" ? "anqr-symphony-bridge" : "anqr-codebuff-bridge";
  
  log(``);
  log(`════════════════════════════════════════════════════════════════`);
  log(`🔄 RESTARTING ${name.toUpperCase()} BRIDGE SERVICE`);
  log(`   Service: ${serviceName}`);
  log(`   Reason: Post-rollback recovery`);
  log(`════════════════════════════════════════════════════════════════`);
  log(``);
  
  const result = exec(`systemctl --user restart ${serviceName}`);
  if (result !== null) {
    log(`✅ ${name} restart initiated`);
    return true;
  } else {
    log(`❌ ${name} restart failed`);
    return false;
  }
}

async function main() {
  if (!WATCHDOG_ENABLED) {
    log(`⚠️ Watchdog disabled (WATCHDOG_ENABLED=false)`);
    process.exit(0);
  }
  
  log(`🔍 Starting bridge health monitoring (timeout: ${WATCHDOG_TIMEOUT_MS}ms)...`);
  
  const checkSymphony = bridgeArg === "both" || bridgeArg === "symphony";
  const checkCodebuff = bridgeArg === "both" || bridgeArg === "codebuff";
  
  const results = {
    symphony: checkSymphony ? await waitForBridge(SYMPHONY_PORT, "Symphony", WATCHDOG_TIMEOUT_MS) : true,
    codebuff: checkCodebuff ? await waitForBridge(CODEBUFF_PORT, "Codebuff", WATCHDOG_TIMEOUT_MS) : true,
  };
  
  const allHealthy = results.symphony && results.codebuff;
  
  if (allHealthy) {
    log(`✅ All monitored bridges are healthy`);
    process.exit(0);
  } else {
    log(`❌ One or more bridges failed health checks`);
    log(`   Symphony: ${results.symphony ? "✅" : "❌"}`);
    log(`   Codebuff: ${results.codebuff ? "✅" : "❌"}`);
    
    // Attempt rollback
    const rolledBack = await rollbackGit();
    
    if (!rolledBack) {
      log(`❌ Rollback failed - manual intervention required`);
      process.exit(1);
    }
    
    // Restart failed bridges after rollback
    if (!results.symphony && checkSymphony) {
      restartBridge("Symphony");
    }
    if (!results.codebuff && checkCodebuff) {
      restartBridge("Codebuff");
    }
    
    // Wait 10 seconds for bridges to start after rollback
    log(`⏳ Waiting 10s for bridges to restart after rollback...`);
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Re-check health
    const afterRollback = {
      symphony: checkSymphony ? await checkBridgeHealth(SYMPHONY_PORT, "Symphony") : true,
      codebuff: checkCodebuff ? await checkBridgeHealth(CODEBUFF_PORT, "Codebuff") : true,
    };
    
    if (afterRollback.symphony && afterRollback.codebuff) {
      log(``);
      log(`╔═══════════════════════════════════════════════════════════════════════╗`);
      log(`║                                                                       ║`);
      log(`║   ✅ ✅ ✅  WATCHDOG RECOVERY SUCCESSFUL  ✅ ✅ ✅                    ║`);
      log(`║                                                                       ║`);
      log(`╚═══════════════════════════════════════════════════════════════════════╝`);
      log(``);
      log(`   All bridges are now healthy after rollback`);
      log(`   System is operational`);
      log(``);
      
      // Send final success notification to Discord
      await sendDiscordEmbed({
        title: "🎉 WATCHDOG RECOVERY COMPLETE",
        description: `All bridges are healthy after automatic rollback.\n\nSystem is operational.`,
        color: 0x00FF00, // Green
        fields: [
          { name: "Symphony Bridge", value: "✅ Healthy", inline: true },
          { name: "Codebuff Bridge", value: "✅ Healthy", inline: true },
        ],
      }).catch(err => log(`⚠️ Failed to send Discord notification: ${err.message}`));
      
      process.exit(0);
    } else {
      log(``);
      log(`╔═══════════════════════════════════════════════════════════════════════╗`);
      log(`║                                                                       ║`);
      log(`║   ❌ ❌ ❌  WATCHDOG RECOVERY FAILED  ❌ ❌ ❌                        ║`);
      log(`║                                                                       ║`);
      log(`╚═══════════════════════════════════════════════════════════════════════╝`);
      log(``);
      log(`   Rollback did not fix the issue`);
      log(`   MANUAL INTERVENTION REQUIRED`);
      log(`   Symphony: ${afterRollback.symphony ? "✅ Healthy" : "❌ Failed"}`);
      log(`   Codebuff: ${afterRollback.codebuff ? "✅ Healthy" : "❌ Failed"}`);
      log(``);
      
      // Send critical failure notification to Discord
      await sendDiscordEmbed({
        title: "🚨 WATCHDOG RECOVERY FAILED - MANUAL INTERVENTION REQUIRED",
        description: `Automatic rollback did not fix the issue.\n\n**ACTION NEEDED**: Manual investigation required!`,
        color: 0xFF0000, // Red
        fields: [
          { name: "Symphony Bridge", value: afterRollback.symphony ? "✅ Healthy" : "❌ Failed", inline: true },
          { name: "Codebuff Bridge", value: afterRollback.codebuff ? "✅ Healthy" : "❌ Failed", inline: true },
        ],
      }).catch(err => log(`⚠️ Failed to send Discord notification: ${err.message}`));
      
      process.exit(1);
    }
  }
}

main().catch(err => {
  log(`❌ Watchdog error: ${err.message}`);
  process.exit(1);
});
