import { FavoriteInputSchema, type FavoriteInput } from "../schemas/FavoriteInput.schema";
import type { FavoriteStrategy } from "../strategies/FavoriteStrategy.port";

export class IsFavorite {
  constructor(private strategy: FavoriteStrategy, _eventBus?: any, _measure?: any) {}
  async execute(input: FavoriteInput) {
    const params = FavoriteInputSchema.parse(input);
    return this.strategy.isFavorite(params);
  }
}
