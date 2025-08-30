import type { FavoriteRepository } from "../../domain/favorites/FavoriteRepository.port";
import type { Cache } from "../../domain/ports/Cache.port";
import type { FavoriteStrategy } from "../strategies/FavoriteStrategy.port";
import { FavoriteDbOnlyStrategy } from "../strategies/FavoriteDbOnly.strategy";
import { FavoriteCacheFirstStrategy } from "../strategies/FavoriteCacheFirst.strategy";

export function makeFavoriteStrategy(
  repo: FavoriteRepository,
  cache?: Cache
): FavoriteStrategy {
  if (process.env.CACHE_MODE === "CACHE_FIRST" && cache) {
    return new FavoriteCacheFirstStrategy(repo, cache);
  }
  return new FavoriteDbOnlyStrategy(repo);
}
