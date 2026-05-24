import { getCachedHealth, setCachedHealth } from "./refresh-health.mjs";
import { aggregateHealth } from "./aggregate-health.mjs";

export async function getHealth() {
  const { cachedHealth, healthAge } = getCachedHealth();
  if (cachedHealth && Date.now() - healthAge < 30_000) return cachedHealth;
  const newHealth = await aggregateHealth();
  const newAge = Date.now();
  setCachedHealth(newHealth, newAge);
  return newHealth;
}
