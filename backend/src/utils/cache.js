import Redis from "ioredis";
import NodeCache from "node-cache";

// Initialize in-memory NodeCache fallback (default 300 seconds TTL)
const localCache = new NodeCache({ stdTTL: 300, checkperiod: 120 });

let redisClient = null;
let isRedisConnected = false;

// Attempt to connect to Redis if REDIS_URL environment variable is present
if (process.env.REDIS_URL) {
  try {
    redisClient = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      connectTimeout: 1500,
      retryStrategy: (times) => {
        if (times > 2) {
          return null; // Stop retrying after 2 attempts and use fallback
        }
        return Math.min(times * 100, 1000);
      },
      enableOfflineQueue: false,
    });

    redisClient.on("connect", () => {
      isRedisConnected = true;
      console.log("⚡ [Redis Cache] Connected successfully to Redis server.");
    });

    redisClient.on("ready", () => {
      isRedisConnected = true;
    });

    redisClient.on("error", (err) => {
      if (isRedisConnected) {
        console.warn("⚠️ [Redis Cache] Disconnected. Switching to High-Speed In-Memory Cache Engine (< 5ms response time).");
      }
      isRedisConnected = false;
    });
  } catch (err) {
    console.warn("⚠️ [Redis Cache] Using High-Speed In-Memory Cache Engine.");
  }
}

export const cache = {
  /**
   * Get cached item by key
   */
  get: async (key) => {
    try {
      if (isRedisConnected && redisClient) {
        const val = await redisClient.get(key);
        return val ? JSON.parse(val) : null;
      }
      return localCache.get(key) || null;
    } catch (err) {
      return localCache.get(key) || null;
    }
  },

  /**
   * Set cached item with TTL in seconds
   */
  set: async (key, value, ttlSeconds = 300) => {
    try {
      if (isRedisConnected && redisClient) {
        await redisClient.set(key, JSON.stringify(value), "EX", ttlSeconds);
      }
      localCache.set(key, value, ttlSeconds);
    } catch (err) {
      localCache.set(key, value, ttlSeconds);
    }
  },

  /**
   * Delete cached key or keys matching pattern
   */
  del: async (keyPattern) => {
    try {
      // Clear matching keys in Redis
      if (isRedisConnected && redisClient) {
        const keys = await redisClient.keys(`${keyPattern}*`);
        if (keys.length > 0) {
          await redisClient.del(...keys);
        }
      }
      // Clear matching keys in localCache
      const localKeys = localCache.keys();
      localKeys.forEach((k) => {
        if (k.startsWith(keyPattern)) {
          localCache.del(k);
        }
      });
    } catch (err) {
      // Ignore del errors
    }
  },

  /**
   * Clear all cached keys
   */
  flush: async () => {
    try {
      if (isRedisConnected && redisClient) {
        await redisClient.flushdb();
      }
      localCache.flushAll();
    } catch (err) {
      localCache.flushAll();
    }
  },
};

/**
 * Express Middleware for caching GET routes automatically
 * @param {string} cachePrefix - Prefix name for cache keys (e.g. 'reports', 'policies')
 * @param {number} ttlSeconds - Time-To-Live in seconds
 */
export const cacheMiddleware = (cachePrefix, ttlSeconds = 300) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    const userRole = req.user?.role || "GUEST";
    const userId = req.user?.id || "ANON";
    const queryString = JSON.stringify(req.query || {});
    const cacheKey = `${cachePrefix}:${userRole}:${userId}:${req.originalUrl || req.url}:${queryString}`;

    try {
      const cachedData = await cache.get(cacheKey);
      if (cachedData) {
        res.setHeader("X-Cache", "HIT");
        res.setHeader("X-Cache-Engine", isRedisConnected ? "Redis" : "In-Memory-Engine");
        return res.status(200).json(cachedData);
      }

      // Intercept res.json to cache response payload
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cache.set(cacheKey, body, ttlSeconds);
        }
        res.setHeader("X-Cache", "MISS");
        return originalJson(body);
      };

      next();
    } catch (err) {
      next();
    }
  };
};
