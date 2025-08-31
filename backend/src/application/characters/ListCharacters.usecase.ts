import type { CharacterListStrategy } from "../strategies/CharacterListStrategy.port";
import { normalizeCharacterListInput, type CharacterListInput } from "../schemas/CharacterListInput.schema";
import type { EventBus } from "../../domain/events/EventBus.port";
import { EVENTS } from "../../domain/events/events";

export class ListCharacters {
  constructor(
    private readonly strategy: CharacterListStrategy,
    private readonly eventBus?: EventBus,
    private readonly measure?: (name: string, fn: () => Promise<any>) => Promise<any>
  ) {}

  async execute(rawInput: Partial<CharacterListInput>) {
    const work = async () => {
      const input = normalizeCharacterListInput(rawInput);
      const result = await this.strategy.list(input);

      await this.eventBus?.publish({
        type: EVENTS.CharactersListed,
        payload: {
          page: input.page,
          pageSize: input.pageSize,
          sort: input.sort,
          filters: input.filters,
        },
        occurredAt: new Date(),
      });

      return result;
    };

    return this.measure ? this.measure("ListCharacters.execute", work) : work();
  }
}
