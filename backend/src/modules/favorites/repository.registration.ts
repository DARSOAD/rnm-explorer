import type { FavoriteRepository } from "../../domain/favorites/FavoriteRepository.port";
import { repositoryRegistry, createRepoToken } from "../../application/factories/RepositoryRegistry";
import { SequelizeFavoriteRepository } from "../../infrastructure/db/SequelizeFavoriteRepository.adapter";

export const FAVORITES_REPO = createRepoToken<FavoriteRepository>("favorites.repo");

repositoryRegistry.register(FAVORITES_REPO, (deps: { models: any }) => {
  return new SequelizeFavoriteRepository(deps.models);
});
