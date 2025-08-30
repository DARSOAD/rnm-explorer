// /src/modules/characters/repository.registration.ts
import type { CharacterRepository } from "../../domain/character/CharacterRepository.port";
import { repositoryRegistry, createRepoToken } from "../../application/factories/RepositoryRegistry";
import { SequelizeCharacterRepository } from "../../infrastructure/db/SequelizeCharacterRepository.adapter";

export const CHARACTERS_REPO = createRepoToken<CharacterRepository>("characters.repo");

repositoryRegistry.register(CHARACTERS_REPO, (deps: { models: any }) => {
  return new SequelizeCharacterRepository(deps.models);
});
