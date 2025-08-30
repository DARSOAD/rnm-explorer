import type { EventBus } from "../../domain/events/EventBus.port";
import type { ListResult } from "../../domain/character/CharacterRepository.port";
import type { CharacterListStrategy } from "../strategies/CharacterListStrategy.port";
import { CharacterListInputSchema, CharacterListInput } from "../schemas/CharacterListInput.schema";


export type Timing = <T>(label: string, fn: () => Promise<T>) => Promise<T>;

export class ListCharacters {
  constructor(
    private readonly strategy: CharacterListStrategy,
    private readonly bus: EventBus,
    private readonly measure?: Timing
  ) {}

  async execute(input: Partial<CharacterListInput>): Promise<ListResult> {
    
    const params = CharacterListInputSchema.parse(input);

    const run = async () => {
      // Strategy delegation
      const result = await this.strategy.list(params);

      // Event emission
      this.bus.publish({
        type: "CharactersListed",
        payload: { ...params, returned: result.items.length },
        at: new Date(),
      });

      return result;
    };

    // Decorator pattern for timing
    return this.measure ? this.measure("ListCharacters", run) : run();
  }
}
