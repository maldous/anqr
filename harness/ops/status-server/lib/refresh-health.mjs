import { aggregateHealth } from "./aggregate-health.mjs";

let cachedHealth = null;
let healthAge = 0;

export function getCachedHealth() {
  return { cachedHealth, healthAge };
}

export function setCachedHealth(health, age) {
  cachedHealth = health;
  healthAge = age;
}

export async function refreshHealth() {
  cachedHealth = await aggregateHealth();
  healthAge = Date.now();
}
