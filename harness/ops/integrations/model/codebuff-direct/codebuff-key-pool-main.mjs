export class CodebuffKeyPool {
  constructor() {
    this.pool = initializeKeyPool();
  }

  acquireKey() {
    const key = getAvailableKey(this.pool);
    if (key) {
      key.inUse = true;
      return key.key;
    }
    return null;
  }

  releaseKey(key) {
    releaseKey(this.pool, key);
  }

  renewKey(key) {
    const index = this.pool.findIndex((k) => k.key === key.key);
    if (index !== -1) {
      this.pool[index] = renewKey(this.pool[index]);
    }
  }
}