import { PrismaClient } from "@workspace/db"
import { S3Client } from "@aws-sdk/client-s3"
import { CacheManager } from "@workspace/cache"

export interface ServiceMap {
  prisma: PrismaClient
  storage: S3Client
  cache: CacheManager
}

