import type { CharacterListStrategy } from "../characters/ListCharacters.usecase";
import type { CharacterEntity, CharacterRepository, ListParams, ListResult } from "../../domain/character/CharacterRepository.port";

export class DbOnlyStrategy implements CharacterListStrategy {
  constructor(private readonly repo: CharacterRepository) {}
  list(params: ListParams): Promise<ListResult> {
    return this.repo.list(params);
  }
  async getById(id: string): Promise<CharacterEntity | null> {
    return this.repo.getById(id);
  }
}
