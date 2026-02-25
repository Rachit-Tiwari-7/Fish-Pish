// Simple in-memory cache fallback if Redis fails or is not available
// The user asked for Redis, so we try to use it, but fallback is robust.
import Redis from 'ioredis';

let redis: Redis | null = null;

try {
  // Try connecting to default local redis
  redis = new Redis({
    maxRetriesPerRequest: 1,
    retryStrategy: (times) => {
      if (times > 3) return null; // Stop retrying
      return 200;
    }
  });
  
  redis.on('error', (err) => {
    // console.warn('Redis error (using memory cache):', err.message);
    redis = null;
  });
} catch (e) {
  redis = null;
}

const memoryCache = new Map<string, { data: any, expiry: number }>();

export async function getCachedResult(url: string) {
  if (redis) {
    try {
      const cached = await redis.get(`lg:${url}`);
      if (cached) return JSON.parse(cached);
    } catch (e) {}
  }

  const mem = memoryCache.get(url);
  if (mem && mem.expiry > Date.now()) {
    return mem.data;
  }
  return null;
}

export async function setCachedResult(url: string, data: any) {
  const TTL = 24 * 60 * 60; // 24 hours

  if (redis) {
    try {
      await redis.set(`lg:${url}`, JSON.stringify(data), 'EX', TTL);
    } catch (e) {}
  }

  memoryCache.set(url, {
    data,
    expiry: Date.now() + (TTL * 1000)
  });
}
