import type { CharacterRepository } from "../../domain/character/CharacterRepository.port";
import type { CharacterListStrategy } from "../strategies/CharacterListStrategy.port";
import { DbOnlyStrategy } from "../strategies/DbOnly.strategy";
import { CacheFirstStrategy } from "../strategies/CacheFirst.strategy";
import type { Cache } from "../../domain/ports/Cache.port";

export function makeCharacterListStrategy(
  repo: CharacterRepository,
  cache?: Cache
): CharacterListStrategy {
  const mode = (process.env.CACHE_MODE ?? "db-only").toLowerCase();
  if (mode === "cache-first" && cache) return new CacheFirstStrategy(cache, repo);
  return new DbOnlyStrategy(repo);
}
