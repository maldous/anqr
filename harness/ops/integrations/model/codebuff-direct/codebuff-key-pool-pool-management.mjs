export function initializeKeyPool() {
  const pool = [];
  for (let i = 0; i < KEY_POOL_SIZE; i++) {
    pool.push({
      key: generateKey(),
      createdAt: Date.now(),
      inUse: false,
    });
  }
  return pool;
}

export function getAvailableKey(pool) {
  // Find expired keys first
  const expired = pool.filter((k) => isKeyExpired(k));
  if (expired.length > 0) {
    return expired[0];
  }

  // Then find unused keys
  const unused = pool.filter((k) => !k.inUse);
  if (unused.length > 0) {
    return unused[0];
  }

  // If we're below threshold, generate a new key
  if (pool.length < KEY_RENEWAL_THRESHOLD) {
    const newKey = {
      key: generateKey(),
      createdAt: Date.now(),
      inUse: false,
    };
    pool.push(newKey);
    return newKey;
  }

  // Otherwise return null (pool exhausted)
  return null;
}

export function releaseKey(pool, key) {
  const index = pool.findIndex((k) => k.key === key.key);
  if (index !== -1) {
    pool[index] = { ...key, inUse: false };
  }
}