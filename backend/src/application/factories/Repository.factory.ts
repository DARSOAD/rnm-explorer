import { SequelizeCharacterRepository } from "../../infrastructure/db/SequelizeCharacterRepository.adapter";
import type { CharacterRepository } from "../../domain/character/CharacterRepository.port";

export function makeCharacterRepository(models: any): CharacterRepository {
  return new SequelizeCharacterRepository(models);
}
