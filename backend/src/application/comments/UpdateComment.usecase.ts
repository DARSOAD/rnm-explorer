import { UpdateCommentSchema } from "../schemas/CommentInput.schema";
import type { CommentStrategy } from "../strategies/CommentStrategy.port";

type Deps = {
  strategy: CommentStrategy;
  eventBus?: { publish: (event: string, payload: unknown) => void };
  measure?: { time<T>(name: string, run: () => Promise<T>): Promise<T> };
};

export class UpdateComment {
  constructor(private deps: Deps) {}

  async execute(raw: unknown) {
    const input = UpdateCommentSchema.parse(raw);
    const run = async () => {
      const updated = await this.deps.strategy.update(input);
      this.deps.eventBus?.publish("CommentUpdated", {
        id: updated.id,
        characterId: updated.characterId,
        authorId: updated.author,
      });
      return updated;
    };
    return this.deps.measure ? this.deps.measure.time("UpdateComment", run) : run();
  }
}
