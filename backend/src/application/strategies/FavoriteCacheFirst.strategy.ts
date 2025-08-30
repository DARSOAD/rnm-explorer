import type { FavoriteRepository } from "../../domain/favorites/FavoriteRepository.port";
import type { FavoriteInput } from "../schemas/FavoriteInput.schema";
import type { FavoriteStrategy } from "./FavoriteStrategy.port";
import type { Cache } from "../../domain/ports/Cache.port";

const TTL = 60 * 60 * 12; // 12h
const k = (v: string, c: string) => `fav:${v}:${c}`;

export class FavoriteCacheFirstStrategy implements FavoriteStrategy {
  constructor(private repo: FavoriteRepository, private cache: Cache) {}

  async isFavorite(input: FavoriteInput) {
    const key = k(input.viewerId, input.characterId);
    const hit = await this.cache.get<boolean>(key);
    if (hit !== null) return hit;
    const val = await this.repo.exists(input);
    await this.cache.set(key, val, TTL);
    return val;
  }

  async toggle(input: FavoriteInput) {
    const key = k(input.viewerId, input.characterId);
    const exists = await this.repo.exists(input);
    if (exists) {
      await this.repo.delete(input);
      await this.cache.set(key, false, TTL);
      return { isFavorite: false };
    }
    await this.repo.create(input);
    await this.cache.set(key, true, TTL);
    return { isFavorite: true };
  }
}
