import type { FavoriteRepository } from "../../domain/favorites/FavoriteRepository.port";
import type { FavoriteInput } from "../schemas/FavoriteInput.schema";
import type { FavoriteStrategy } from "./FavoriteStrategy.port";

export class FavoriteDbOnlyStrategy implements FavoriteStrategy {
  constructor(private repo: FavoriteRepository) {}
  async isFavorite(input: FavoriteInput) {
    return this.repo.exists(input);
  }
  async toggle(input: FavoriteInput) {
    const exists = await this.repo.exists(input);
    if (exists) {
      await this.repo.delete(input);
      return { isFavorite: false };
    }
    await this.repo.create(input);
    return { isFavorite: true };
  }
}
