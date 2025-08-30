import { DeleteCommentSchema } from "../schemas/CommentInput.schema";
import type { CommentStrategy } from "../strategies/CommentStrategy.port";

type Deps = {
  strategy: CommentStrategy;
  eventBus?: { publish: (event: string, payload: unknown) => void };
  measure?: { time<T>(name: string, run: () => Promise<T>): Promise<T> };
};

export class DeleteComment {
  constructor(private deps: Deps) {}

  async execute(raw: unknown) {
    const input = DeleteCommentSchema.parse(raw);
    const run = async () => {
      const ok = await this.deps.strategy.delete(input);
      if (ok) this.deps.eventBus?.publish("CommentDeleted", { id: input.id, authorId: input.authorId });
      return ok;
    };
    return this.deps.measure ? this.deps.measure.time("DeleteComment", run) : run();
  }
}
