export async function getHealth() {
    let cachedHealth = await aggregateHealth();
    return cachedHealth;
}