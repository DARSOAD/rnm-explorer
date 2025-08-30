import type { FavoriteInput } from "../schemas/FavoriteInput.schema";
export interface FavoriteStrategy {
  isFavorite(input: FavoriteInput): Promise<boolean>;
  toggle(input: FavoriteInput): Promise<{ isFavorite: boolean }>;
}
