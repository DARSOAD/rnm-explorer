import type { FavoriteRepository } from "../../domain/favorites/FavoriteRepository.port";

export class SequelizeFavoriteRepository implements FavoriteRepository {
  constructor(private readonly models: any) {}

  private get Model() {
    const M = this.models.Favorite;
    if (!M) throw new Error("Favorite model not found in models registry");
    return M;
  }

  async exists({ characterId, viewerId }: { characterId: string; viewerId: string }) {
    const row = await this.Model.findOne({
      where: { character_id: characterId, user_id: viewerId, deleted_at: null },
      attributes: ["id"],
    });
    return !!row;
  }

  async create({ characterId, viewerId }: { characterId: string; viewerId: string }) {
    await this.Model.create({
      character_id: characterId,
      user_id: viewerId,
      created_at: new Date(),
      updated_at: new Date(),
    });
  }

  async delete({ characterId, viewerId }: { characterId: string; viewerId: string }) {
    await this.Model.destroy({
      where: { character_id: characterId, user_id: viewerId, deleted_at: null },
    });
  }
}
