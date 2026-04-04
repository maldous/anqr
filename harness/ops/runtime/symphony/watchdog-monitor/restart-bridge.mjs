import { exec } from "./exec.mjs";
import { log } from "./log.mjs";

export function restartBridge(name) {
  const serviceName = name === "Symphony" ? "anqr-symphony-bridge" : "anqr-codebuff-bridge";

  log(``);
  log(`════════════════════════════════════════════════════════════════`);
  log(`🔄 RESTARTING ${name.toUpperCase()} BRIDGE SERVICE`);
  log(`   Service: ${serviceName}`);
  log(`   Reason: Post-rollback recovery`);
  log(`════════════════════════════════════════════════════════════════`);
  log(``);

  const result = exec(`systemctl --user restart ${serviceName}`);
  if (result === null) {
    log(`❌ ${name} restart failed`);
    return false;
  } else {
    log(`✅ ${name} restart initiated`);
    return true;
  }
}
