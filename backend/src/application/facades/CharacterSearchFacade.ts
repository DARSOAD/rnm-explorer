import type { CharacterListInput } from "../builders/CharacterFilterBuilder";
import type { ListResult } from "../../domain/character/CharacterRepository.port";

export class CharacterSearchFacade {
  constructor(
    private readonly listCharactersUsecase: { execute: (input: CharacterListInput) => Promise<ListResult> }
  ) {}
  listCharacters(input: CharacterListInput) {
    return this.listCharactersUsecase.execute(input);
  }
}
