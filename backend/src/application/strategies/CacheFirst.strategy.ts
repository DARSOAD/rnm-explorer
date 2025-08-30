import type { CharacterListStrategy } from "../characters/ListCharacters.usecase";
import type { CharacterRepository, ListParams, ListResult } from "../../domain/character/CharacterRepository.port";
import type { Cache } from "../../domain/ports/Cache.port";

export class CacheFirstStrategy implements CharacterListStrategy {
  constructor(private readonly cache: Cache, private readonly repo: CharacterRepository) {}
  async list(params: ListParams): Promise<ListResult> {
    const key = `ch:list:${params.sort}:${params.page}:${params.pageSize}`;
    const hit = await this.cache.get<ListResult>(key);
    if (hit) return hit;
    const result = await this.repo.list(params);
    await this.cache.set(key, result, 120); // TTL 120s (ajustable)
    return result;
  }
}
