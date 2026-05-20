export async function getHealth() {
  if (cachedHealth && Date.now() - cacheAge < REFRESH_INTERVAL_MS) {
    return cachedHealth;
  }
  const cachedHealth = await aggregateHealth();
  cacheAge = Date.now();
  return cachedHealth;
}