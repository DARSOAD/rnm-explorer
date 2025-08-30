import Redis from "ioredis";
import type { Cache } from "../../domain/ports/Cache.port";

export class RedisCache implements Cache {
  private client: Redis;
  constructor(url = process.env.REDIS_URL) {
    this.client = new Redis(url || "redis://localhost:6379");
  }

  async get<T>(key: string): Promise<T | null> {
    const raw = await this.client.get(key);
    if (raw) {
      console.log("[Cache] HIT", key);   
      return JSON.parse(raw) as T;
    }
    console.log("[Cache] MISS", key);    
    return null;
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    await this.client.set(key, JSON.stringify(value), "EX", ttlSeconds);
    console.log("[Cache] SET", key, "ttl:", ttlSeconds);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
    console.log("[Cache] DEL", key); // 👈 log al borrar
  }
}
