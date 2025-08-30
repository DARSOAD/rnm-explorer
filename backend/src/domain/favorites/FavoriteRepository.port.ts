export interface FavoriteRepository {
    exists(params: { characterId: string; viewerId: string }): Promise<boolean>;
    create(params: { characterId: string; viewerId: string }): Promise<void>;
    delete(params: { characterId: string; viewerId: string }): Promise<void>;
  }
  