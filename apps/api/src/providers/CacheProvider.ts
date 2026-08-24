import { InfrastructureProvider } from "@/core/InfrastructureProvider"
import { CacheManager, CacheConfig } from "@workspace/cache"
import { config } from "@/core/config"
import { AppLogger } from "@workspace/logger"

export class CacheProvider implements InfrastructureProvider<CacheManager> {
  public name = "Redis Cache"
  private cacheManager: CacheManager
  private logger = new AppLogger("CacheProvider")

  constructor(options?: CacheConfig) {
    const cacheConfig: CacheConfig = {
      host: options?.host || config.redis.host,
      port: options?.port || config.redis.port,
      password: options?.password || config.redis.password,
      db: options?.db ?? config.redis.db,
      keyPrefix: options?.keyPrefix || config.redis.keyPrefix,
      url: options?.url || config.redis.url,
      defaultTTLSeconds: options?.defaultTTLSeconds ?? config.redis.defaultTTLSeconds,
      ...options,
    }

    this.cacheManager = new CacheManager(cacheConfig)
  }

  public getClient(): CacheManager {
    return this.cacheManager
  }

  public async connect(): Promise<void> {
    try {
      await this.cacheManager.connect()
      this.logger.info(
        `✔ Redis Cache provider connected (${config.redis.host}:${config.redis.port})`
      )
    } catch (error) {
      this.logger.warn(
        `⚠️ Redis Cache connection failed: ${error instanceof Error ? error.message : String(error)}. Cache operations will gracefully fall back.`
      )
    }
  }

  public async disconnect(): Promise<void> {
    await this.cacheManager.disconnect()
    this.logger.info("⛁ Redis Cache provider disconnected")
  }
}
