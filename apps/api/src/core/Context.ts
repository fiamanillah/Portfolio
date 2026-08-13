import { AppLogger } from "@workspace/logger";
import { config as AppConfig } from "./config";
import { ServiceMap } from "@/types/ServiceMap";
import { InfrastructureProvider } from "./InfrastructureProvider";
import { AppError } from "./errors/AppError";
import { HTTPStatusCode } from "@/types/HTTPStatusCode";

export class Context {
  public readonly config = AppConfig;
  private logger = new AppLogger("Context");

  // The internal registry of services
  private providers: Map<keyof ServiceMap, InfrastructureProvider> = new Map();

  /**
   * Register a new service. Usually called from IgnitorApp before boot.
   */
  public registerProvider<K extends keyof ServiceMap>(
    key: K,
    provider: InfrastructureProvider<ServiceMap[K]>,
  ): void {
    this.providers.set(key, provider);
    this.logger.debug(`Registered infrastructure provider: ${provider.name}`);
  }

  /**
   * Retrieve a service.
   * Notice the generic <K>: if you pass 'prisma', TS knows it returns PrismaClient!
   */
  public getService<K extends keyof ServiceMap>(key: K): ServiceMap[K] {
    const provider = this.providers.get(key);
    if (!provider) {
      throw new AppError({
        statusCode: HTTPStatusCode.INTERNAL_SERVER_ERROR,
        message: `Service '${key}' was requested but is not registered.`,
        code: "MISSING_SERVICE",
      });
    }
    return provider.getClient() as ServiceMap[K];
  }

  /** Connect all services */
  public async initialize(): Promise<void> {
    for (const provider of this.providers.values()) {
      try {
        await provider.connect();
        this.logger.info(`⛁ ${provider.name} connected successfully`);
      } catch (error) {
        this.logger.error(` Failed to connect ${provider.name}`, { error });
        throw error;
      }
    }
  }

  /** Disconnect all services safely */
  public async shutdown(): Promise<void> {
    const providers = Array.from(this.providers.values()).reverse();
    for (const provider of providers) {
      try {
        await provider.disconnect();
        this.logger.info(`⛁ ${provider.name} disconnected successfully`);
      } catch (error) {
        this.logger.error(` Failed to disconnect ${provider.name}`, { error });
      }
    }
  }
}
