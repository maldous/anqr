import { log } from "./log.mjs";

export async function checkBridgeHealth(port, name) {
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
