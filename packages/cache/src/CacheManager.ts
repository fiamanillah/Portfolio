import Redis from "ioredis"
import { AppLogger } from "@workspace/logger"
import type { CacheConfig, ICacheManager, SetCacheOptions } from "./types.js"
import { safeParse, safeStringify } from "./utils.js"

export class CacheManager implements ICacheManager {
  private client: Redis | null = null
  private isConnecting = false
  private readonly config: CacheConfig
  private readonly defaultTTLSeconds?: number
  private readonly logger: AppLogger

  constructor(config: CacheConfig = {}) {
    this.config = config
    this.defaultTTLSeconds = config.defaultTTLSeconds
    const prefix = config.keyPrefix ? `[${config.keyPrefix}]` : ""
    this.logger = new AppLogger(`CacheManager${prefix}`)
  }

  public getClient(): Redis {
    if (!this.client) {
      const redisHost =
        this.config.host || process.env.REDIS_HOST || "127.0.0.1"
      const redisPort =
        this.config.port ||
        (process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6380)
      const redisPassword =
        this.config.password || process.env.REDIS_PASSWORD || undefined
      const redisDb =
        this.config.db ??
        (process.env.REDIS_DB ? Number(process.env.REDIS_DB) : 0)
      const redisUrl = this.config.url || process.env.REDIS_URL

      const baseOptions: any = {
        keyPrefix: this.config.keyPrefix,
        lazyConnect: this.config.lazyConnect ?? false,
        maxRetriesPerRequest: this.config.maxRetriesPerRequest ?? 3,
        enableOfflineQueue: this.config.enableOfflineQueue ?? true,
        retryStrategy: (times: number) => {
          if (times > 10) {
            this.logger.error("Redis retry limit exceeded (10 attempts)")
            return null
          }
          return Math.min(times * 200, 3000)
        },
        ...this.config,
      }

      if (redisUrl) {
        this.client = new Redis(redisUrl, baseOptions)
      } else {
        this.client = new Redis({
          host: redisHost,
          port: redisPort,
          password: redisPassword,
          db: redisDb,
          ...baseOptions,
        })
      }

      this.client.on("error", (err) => {
        this.logger.error("Redis connection error encountered:", {
          error: err instanceof Error ? err.message : String(err),
        })
      })

      this.client.on("close", () => {
        this.logger.warn("Redis connection closed")
      })

      this.client.on("reconnecting", () => {
        this.logger.info("Redis reconnecting...")
      })

      this.client.on("ready", () => {
        this.logger.info("Redis client ready for operations")
      })
    }
    return this.client
  }

  public async connect(): Promise<void> {
    const client = this.getClient()
    const status = client.status as string
    if (status === "ready" || status === "connect") {
      return
    }

    if (this.isConnecting) {
      while (this.isConnecting) {
        await new Promise((resolve) => setTimeout(resolve, 50))
      }
      return
    }

    this.isConnecting = true
    try {
      const currentStatus = client.status as string
      if (currentStatus !== "ready" && currentStatus !== "connect") {
        await client.connect().catch(() => {})
      }
      const host = this.config.host || process.env.REDIS_HOST || "127.0.0.1"
      const port =
        this.config.port ||
        (process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6380)
      this.logger.info(
        `✔ Connected to Redis cache successfully (${host}:${port})`
      )
    } catch (error) {
      this.logger.error("Failed to connect to Redis cache:", { error })
    } finally {
      this.isConnecting = false
    }
  }

  public isReady(): boolean {
    return this.client?.status === "ready"
  }

  public async ping(): Promise<boolean> {
    try {
      const client = this.getClient()
      const result = await client.ping()
      return result === "PONG"
    } catch (error) {
      this.logger.error("Redis ping check failed:", { error })
      return false
    }
  }

  public async get<T = unknown>(key: string): Promise<T | null> {
    try {
      const client = this.getClient()
      const rawData = await client.get(key)
      if (rawData === null || rawData === undefined) return null
      return safeParse<T>(rawData)
    } catch (error) {
      this.logger.error(`Error retrieving key '${key}' from cache:`, { error })
      return null
    }
  }

  public async getMany<T = unknown>(keys: string[]): Promise<(T | null)[]> {
    if (!keys || keys.length === 0) return []
    try {
      const client = this.getClient()
      const results = await client.mget(...keys)
      return results.map((val) =>
        val !== null && val !== undefined ? safeParse<T>(val) : null
      )
    } catch (error) {
      this.logger.error("Error retrieving multiple keys from cache:", {
        keys,
        error,
      })
      return keys.map(() => null)
    }
  }

  public async set<T = unknown>(
    key: string,
    value: T,
    options?: SetCacheOptions | number
  ): Promise<boolean> {
    try {
      const client = this.getClient()
      const stringifiedValue = safeStringify(value)

      const opts: SetCacheOptions =
        typeof options === "number" ? { ttlSeconds: options } : options || {}

      const ttlMs = opts.ttlMs
      const ttlSec = opts.ttlSeconds ?? this.defaultTTLSeconds

      const args: (string | number)[] = [key, stringifiedValue]

      if (opts.keepTTL) {
        args.push("KEEPTTL")
      } else if (ttlMs && ttlMs > 0) {
        args.push("PX", ttlMs)
      } else if (ttlSec && ttlSec > 0) {
        args.push("EX", ttlSec)
      }

      if (opts.ifNotExists) {
        args.push("NX")
      } else if (opts.ifExists) {
        args.push("XX")
      }

      const result = await (client as any).set(...args)
      return result === "OK"
    } catch (error) {
      this.logger.error(`Error setting key '${key}' in cache:`, { error })
      return false
    }
  }

  public async setMany<T = unknown>(
    entries: { key: string; value: T; ttlSeconds?: number }[]
  ): Promise<boolean> {
    if (!entries || entries.length === 0) return true
    try {
      const client = this.getClient()
      const pipeline = client.pipeline()

      for (const entry of entries) {
        const stringified = safeStringify(entry.value)
        const ttl = entry.ttlSeconds ?? this.defaultTTLSeconds
        if (ttl && ttl > 0) {
          pipeline.set(entry.key, stringified, "EX", ttl)
        } else {
          pipeline.set(entry.key, stringified)
        }
      }

      const results = await pipeline.exec()
      return results !== null && results.every(([err]) => !err)
    } catch (error) {
      this.logger.error("Error setting multiple keys in cache pipeline:", {
        error,
      })
      return false
    }
  }

  public async del(keys: string | string[]): Promise<number> {
    try {
      const client = this.getClient()
      const keysToDelete = Array.isArray(keys) ? keys : [keys]
      if (keysToDelete.length === 0) return 0
      return await client.del(...keysToDelete)
    } catch (error) {
      this.logger.error("Error deleting keys from cache:", { keys, error })
      return 0
    }
  }

  public async delByPattern(pattern: string): Promise<number> {
    try {
      const client = this.getClient()
      const prefix = this.config.keyPrefix || ""
      let cursor = "0"
      let totalDeleted = 0

      do {
        const [nextCursor, keys] = await client.scan(
          cursor,
          "MATCH",
          prefix ? `${prefix}${pattern}` : pattern,
          "COUNT",
          100
        )
        cursor = nextCursor

        if (keys.length > 0) {
          // If keyPrefix is active on client, strip prefix before calling del since del adds it automatically
          const cleanedKeys = prefix
            ? keys.map((k) =>
                k.startsWith(prefix) ? k.slice(prefix.length) : k
              )
            : keys

          if (cleanedKeys.length > 0) {
            const count = await client.del(...cleanedKeys)
            totalDeleted += count
          }
        }
      } while (cursor !== "0")

      return totalDeleted
    } catch (error) {
      this.logger.error(`Error deleting keys by pattern '${pattern}':`, {
        error,
      })
      return 0
    }
  }

  public async exists(key: string): Promise<boolean> {
    try {
      const client = this.getClient()
      const count = await client.exists(key)
      return count > 0
    } catch (error) {
      this.logger.error(`Error checking existence of key '${key}':`, { error })
      return false
    }
  }

  public async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options?: SetCacheOptions | number
  ): Promise<T> {
    try {
      const cachedValue = await this.get<T>(key)
      if (cachedValue !== null && cachedValue !== undefined) {
        return cachedValue
      }
    } catch (error) {
      this.logger.warn(
        `Cache read failure on key '${key}'. Falling back to data factory:`,
        { error }
      )
    }

    const freshValue = await factory()
    if (freshValue !== undefined && freshValue !== null) {
      this.set<T>(key, freshValue, options).catch((err) => {
        this.logger.warn(`Failed to asynchronously cache key '${key}':`, {
          error: err,
        })
      })
    }
    return freshValue
  }

  public async increment(
    key: string,
    by: number = 1,
    ttlSeconds?: number
  ): Promise<number> {
    try {
      const client = this.getClient()
      const count =
        by === 1 ? await client.incr(key) : await client.incrby(key, by)

      const ttl = ttlSeconds ?? this.defaultTTLSeconds
      if (ttl && ttl > 0) {
        await client.expire(key, ttl)
      }
      return count
    } catch (error) {
      this.logger.error(`Error incrementing key '${key}':`, { error })
      throw error
    }
  }

  public async decrement(
    key: string,
    by: number = 1,
    ttlSeconds?: number
  ): Promise<number> {
    try {
      const client = this.getClient()
      const count =
        by === 1 ? await client.decr(key) : await client.decrby(key, by)

      const ttl = ttlSeconds ?? this.defaultTTLSeconds
      if (ttl && ttl > 0) {
        await client.expire(key, ttl)
      }
      return count
    } catch (error) {
      this.logger.error(`Error decrementing key '${key}':`, { error })
      throw error
    }
  }

  public async expire(key: string, ttlSeconds: number): Promise<boolean> {
    try {
      const client = this.getClient()
      const result = await client.expire(key, ttlSeconds)
      return result === 1
    } catch (error) {
      this.logger.error(`Error setting expiration on key '${key}':`, { error })
      return false
    }
  }

  public async ttl(key: string): Promise<number> {
    try {
      const client = this.getClient()
      return await client.ttl(key)
    } catch (error) {
      this.logger.error(`Error fetching TTL for key '${key}':`, { error })
      return -2
    }
  }

  public async flushDb(): Promise<void> {
    try {
      const client = this.getClient()
      await client.flushdb()
      this.logger.info("Flushed Redis DB successfully")
    } catch (error) {
      this.logger.error("Error flushing Redis DB:", { error })
      throw error
    }
  }

  public createNamespace(prefix: string): ICacheManager {
    const parentPrefix = this.config.keyPrefix || ""
    const newPrefix = `${parentPrefix}${prefix}`
    return new CacheManager({
      ...this.config,
      keyPrefix: newPrefix,
    })
  }

  public async disconnect(): Promise<void> {
    if (this.client) {
      try {
        await this.client.quit()
      } catch (error) {
        this.logger.error("Error disconnecting Redis client:", { error })
      } finally {
        this.client = null
      }
    }
  }
}
