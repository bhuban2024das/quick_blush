import Redis from "ioredis";
import * as dotenv from "dotenv";

dotenv.config();

export const redisCache = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
export const redisSubClient = redisCache.duplicate();
