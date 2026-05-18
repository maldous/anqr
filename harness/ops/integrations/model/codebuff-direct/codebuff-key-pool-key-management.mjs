export function generateKey() {
  return crypto.randomBytes(32).toString('hex');
}

export function isKeyExpired(key) {
  const now = Date.now();
  return now - key.createdAt > KEY_EXPIRY_MS;
}

export function renewKey(key) {
  return { ...key, createdAt: Date.now() };
}