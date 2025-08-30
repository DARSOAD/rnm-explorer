import { FavoriteInputSchema, type FavoriteInput } from "../schemas/FavoriteInput.schema";
import type { FavoriteStrategy } from "../strategies/FavoriteStrategy.port";

export class ToggleFavorite {
  constructor(private strategy: FavoriteStrategy, private eventBus?: any, private measure?: any) {}

  async execute(input: FavoriteInput) {
    const params = FavoriteInputSchema.parse(input);
    const run = async () => {
      const { isFavorite } = await this.strategy.toggle(params);
      // opcional: publicar evento
      this.eventBus?.publish?.({
        type: "CharacterFavorited",
        payload: { ...params, isFavorite },
        at: new Date().toISOString(),
      });
      return { ...params, isFavorite };
    };
    // si tienes decorador de tiempos en deps.measure
    return this.measure?.time ? this.measure.time("ToggleFavorite", run) : run();
  }
}
