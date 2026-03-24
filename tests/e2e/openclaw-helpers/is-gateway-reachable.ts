import { runCli } from "./run-cli";

export function isGatewayReachable(): boolean {
  try {
    const out = runCli("health", 10_000);
    return out.includes("Agents:") || out.includes("Heartbeat");
  } catch {
    return false;
  }
}
