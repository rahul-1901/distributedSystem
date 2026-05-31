export class CacheService {
  constructor(redisClient) {
    this.redisClient = redisClient;
  }

  async get(key) {
    const value = await this.redisClient.get(key);

    if (!value) {
      return null;
    }

    return JSON.parse(value);
  }

  async set(key, value, ttlSeconds = 300) {
    await this.redisClient.set(key, JSON.stringify(value), {
      EX: ttlSeconds,
    });
  }

  async del(key) {
    await this.redisClient.del(key);
  }

  async delMany(keys) {
    if (!keys.length) return;

    await this.redisClient.del(keys);
  }
}
