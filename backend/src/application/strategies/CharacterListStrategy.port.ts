import type { ListResult } from "../../domain/character/CharacterRepository.port";
import type { CharacterListInput } from "../schemas/CharacterListInput.schema";

export interface CharacterListStrategy {
  list(params: CharacterListInput): Promise<ListResult>;
}
