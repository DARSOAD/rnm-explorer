import { AddCommentSchema } from "../schemas/CommentInput.schema";
import type { CommentStrategy } from "../strategies/CommentStrategy.port";

type Deps = {
  strategy: CommentStrategy;
  eventBus?: { publish: (event: string, payload: unknown) => void };
  measure?: { time<T>(name: string, run: () => Promise<T>): Promise<T> };
};

export class CreateComment {
  constructor(private deps: Deps) {}

  async execute(raw: unknown) {
    const input = AddCommentSchema.parse(raw);
    const run = async () => {
      const created = await this.deps.strategy.create(input);
      this.deps.eventBus?.publish("CommentAdded", {
        id: created.id,
        characterId: created.characterId,
        authorId: created.authorId,
      });
      return created;
    };
    return this.deps.measure ? this.deps.measure.time("CreateComment", run) : run();
  }
}
