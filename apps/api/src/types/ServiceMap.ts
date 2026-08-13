import { PrismaClient } from "@workspace/db";
// import { Redis } from "ioredis";
// import Stripe from "stripe";

export interface ServiceMap {
  prisma: PrismaClient;
  // redis: Redis;
  // stripe: Stripe;
}
