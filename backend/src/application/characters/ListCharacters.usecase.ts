import type { EventBus } from "../../domain/events/EventBus.port";
import type { ListResult } from "../../domain/character/CharacterRepository.port";
import { CharacterFilterBuilder, type CharacterListInput } from "../builders/CharacterFilterBuilder";

export interface CharacterListStrategy {
  list(params: { page: number; pageSize: number; sort: "NAME_ASC" | "NAME_DESC" }): Promise<ListResult>;
}

export type Timing = <T>(label: string, fn: () => Promise<T>) => Promise<T>;

export class ListCharacters {
  constructor(
    private readonly strategy: CharacterListStrategy,
    private readonly bus: EventBus,
    private readonly measure?: Timing
  ) {}

  async execute(input: CharacterListInput): Promise<ListResult> {
    const run = async () => {
      const params = new CharacterFilterBuilder()
        .withPage(input.page)
        .withPageSize(input.pageSize)
        .withSort(input.sort)
        .build();

      const result = await this.strategy.list(params);

      this.bus.publish({
        type: "CharactersListed",
        payload: { ...params, returned: result.items.length },
        at: new Date(),
      });

      return result;
    };
    return this.measure ? this.measure("ListCharacters", run) : run();
  }
}
