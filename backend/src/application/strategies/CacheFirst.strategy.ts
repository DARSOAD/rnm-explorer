// application/strategies/CacheFirst.strategy.ts
import crypto from "crypto";
import type { CharacterListStrategy } from "./CharacterListStrategy.port";
import type { CharacterRepository, ListResult, ListParams } from "../../domain/character/CharacterRepository.port";
import type { Cache } from "../../domain/ports/Cache.port";
import type { CharacterListInput } from "../schemas/CharacterListInput.schema";

function makeCacheKey(params: CharacterListInput): string {
  const serialized = JSON.stringify({
    page: params.page,
    pageSize: params.pageSize,
    sort: params.sort,
    status: params.status ?? null,
    species: params.species ?? null,
    gender: params.gender ?? null,
    origin: params.origin ?? null,
    name: params.name ?? null,
  });
  const hash = crypto.createHash("sha1").update(serialized).digest("hex").slice(0, 20);
  return `ch:list:${hash}`;
}

function omitUndefined<T extends Record<string, unknown>>(obj: T) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>;
}

export class CacheFirstStrategy implements CharacterListStrategy {
  constructor(
    private readonly cache: Cache,
    private readonly repo: CharacterRepository
  ) {}

  async list(params: CharacterListInput): Promise<ListResult> {
    const key = makeCacheKey(params);

    const hit = await this.cache.get<ListResult>(key);
    if (hit) return hit;

    // Construimos ListParams SIN propiedades undefined
    const repoParams: ListParams = {
      page: params.page,
      pageSize: params.pageSize,
      sort: params.sort,
      ...omitUndefined({
        status: params.status,
        species: params.species,
        gender: params.gender,
        origin: params.origin,
        name: params.name,
      }),
    } as ListParams;

    const result = await this.repo.list(repoParams);

    await this.cache.set(key, result, 120);
    return result;
  }
}
