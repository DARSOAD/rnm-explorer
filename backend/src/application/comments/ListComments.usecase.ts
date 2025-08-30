import { ListCommentsSchema, type ListCommentsInput } from "../schemas/CommentInput.schema";
import type { CommentStrategy } from "../strategies/CommentStrategy.port";

type Deps = {
  strategy: CommentStrategy;
  eventBus?: { publish: (event: string, payload: unknown) => void };
  measure?: { time<T>(name: string, run: () => Promise<T>): Promise<T> };
};

export class ListComments {
  constructor(private deps: Deps) {}

  async execute(raw: unknown) {
    const input = ListCommentsSchema.parse(raw);
    const run = async () => {
      const result = await this.deps.strategy.list(input);
      this.deps.eventBus?.publish("CommentsListed", { characterId: input.characterId });
      return result;
    };
    return this.deps.measure ? this.deps.measure.time("ListComments", run) : run();
  }
}
