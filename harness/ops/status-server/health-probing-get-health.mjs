export async function getHealth() {
  const cachedHealth = await aggregateHealth();
  return cachedHealth;
}
