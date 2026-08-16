import { PrismaClient } from "@workspace/db"
import { S3Client } from "@aws-sdk/client-s3"

export interface ServiceMap {
  prisma: PrismaClient
  storage: S3Client
}
