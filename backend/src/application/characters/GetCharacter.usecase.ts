import type { EventBus } from "../../domain/events/EventBus.port";
import type { Character } from "../../domain/character/Character.entity";


export interface CharacterGetStrategy {
  getById(id: string): Promise<Character | null>;
}

// Times decorator
export type Timing = <T>(label: string, fn: () => Promise<T>) => Promise<T>;

/**
 * Use case: Get a character by ID
 * - Publishes "CharacterViewed" event
 * - Uses a strategy to fetch the character (DB, Cache, etc.)
 * - Optionally measures execution time
 * @returns Character or null if not found
 */
export class GetCharacter {
  constructor(
    private readonly strategy: CharacterGetStrategy,
    private readonly bus: EventBus,
    private readonly measure?: Timing
  ) {}

  async execute(input: { id: string }): Promise<Character | null> {
    const run = async () => {
      const character = await this.strategy.getById(input.id);

      this.bus.publish({
        type: "CharacterViewed",
        payload: { id: input.id, found: Boolean(character) },
        at: new Date(),
      });

      return character; // null si no existe
    };

    return this.measure ? this.measure("GetCharacter", run) : run();
  }
}
