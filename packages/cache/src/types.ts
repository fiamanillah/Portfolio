import type { RedisOptions } from "ioredis"

export interface CacheConfig extends RedisOptions {
  host?: string
  port?: number
  password?: string
  db?: number
  keyPrefix?: string
  defaultTTLSeconds?: number
  url?: string
}

export interface SetCacheOptions {
  /**
   * Time-to-live in seconds for the cached item.
   * If omitted or undefined, default TTL is used (if specified in CacheConfig).
   */
  ttlSeconds?: number

  /**
   * Time-to-live in milliseconds. If specified, overrides ttlSeconds.
   */
  ttlMs?: number

  /**
   * Only set the key if it does not already exist (NX in Redis).
   */
  ifNotExists?: boolean

  /**
   * Only set the key if it already exists (XX in Redis).
   */
  ifExists?: boolean

  /**
   * Retain the existing time-to-live associated with the key (KEEPTTL in Redis).
   */
  keepTTL?: boolean
}

export interface ICacheManager {
  /**
   * Returns the underlying ioredis client instance.
   */
  getClient(): import("ioredis").default

  /**
   * Connect to Redis if not already connected.
   */
  connect(): Promise<void>

  /**
   * Disconnect the Redis client safely.
   */
  disconnect(): Promise<void>

  /**
   * Returns whether the Redis client is currently connected and ready.
   */
  isReady(): boolean

  /**
   * Ping the Redis server to verify connectivity.
   */
  ping(): Promise<boolean>

  /**
   * Retrieve an item from the cache and deserialize it.
   */
  get<T = unknown>(key: string): Promise<T | null>

  /**
   * Retrieve multiple items from the cache by their keys.
   */
  getMany<T = unknown>(keys: string[]): Promise<(T | null)[]>

  /**
   * Store an item in the cache with optional TTL and conditional flags.
   */
  set<T = unknown>(
    key: string,
    value: T,
    options?: SetCacheOptions | number
  ): Promise<boolean>

  /**
   * Store multiple key-value pairs in the cache in a single atomic pipeline.
   */
  setMany<T = unknown>(
    entries: { key: string; value: T; ttlSeconds?: number }[]
  ): Promise<boolean>

  /**
   * Delete one or more keys from the cache.
   */
  del(keys: string | string[]): Promise<number>

  /**
   * Delete all keys matching a glob-style pattern (e.g. 'blogs:*') using non-blocking SCAN.
   */
  delByPattern(pattern: string): Promise<number>

  /**
   * Check if a key exists in the cache.
   */
  exists(key: string): Promise<boolean>

  /**
   * Cache-aside helper: Retrieve cached value or fetch from factory, cache it, and return.
   * If Redis is unreachable, gracefully falls back to executing the factory function.
   */
  getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options?: SetCacheOptions | number
  ): Promise<T>

  /**
   * Atomically increment a numeric key by the given delta.
   */
  increment(key: string, by?: number, ttlSeconds?: number): Promise<number>

  /**
   * Atomically decrement a numeric key by the given delta.
   */
  decrement(key: string, by?: number, ttlSeconds?: number): Promise<number>

  /**
   * Set a time-to-live expiration (in seconds) on an existing key.
   */
  expire(key: string, ttlSeconds: number): Promise<boolean>

  /**
   * Get the remaining time-to-live of a key in seconds (-1 if no expiry, -2 if key does not exist).
   */
  ttl(key: string): Promise<number>

  /**
   * Flush the current Redis database.
   */
  flushDb(): Promise<void>

  /**
   * Create a sub-namespaced cache manager sharing the same connection.
   */
  createNamespace(prefix: string): ICacheManager
}
