import { CacheManager } from "./CacheManager.js"
import type { CacheConfig, ICacheManager } from "./types.js"

const instanceRegistry: Map<string, CacheManager> = new Map()

/**
 * Creates a new, standalone CacheManager instance.
 */
export function createCacheManager(config: CacheConfig = {}): CacheManager {
  return new CacheManager(config)
}

/**
 * Retrieves or lazily creates a singleton/named CacheManager instance.
 * Useful for sharing a single connected client across an application.
 *
 * @param name Unique identifier for this manager instance (defaults to "default")
 * @param config Optional configuration to use when initializing if not already present
 */
export function getCacheManager(
  name: string = "default",
  config: CacheConfig = {}
): CacheManager {
  let instance = instanceRegistry.get(name)
  if (!instance) {
    instance = new CacheManager(config)
    instanceRegistry.set(name, instance)
  }
  return instance
}

/**
 * Safely disconnects and removes all managed cache instances.
 * Ideal for application shutdown routines and integration test tear-down.
 */
export async function closeAllCacheManagers(): Promise<void> {
  const instances = Array.from(instanceRegistry.values())
  await Promise.all(instances.map((manager) => manager.disconnect()))
  instanceRegistry.clear()
}
