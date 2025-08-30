import type {
    Comment,
    PaginatedResult,
    ListCommentsParams,
  } from "../../domain/comments/CommentRepository.port";
  import type { CommentStrategy, CommentStrategyDeps } from "./CommentStrategy.port";
  
  export class CommentDbOnlyStrategy implements CommentStrategy {
    private repo = this.deps.repo;
    constructor(private deps: CommentStrategyDeps) {}
  
    list(input: ListCommentsParams): Promise<PaginatedResult<Comment>> {
      return this.repo.list(input);
    }
    create(input: { characterId: string; authorId: string; text: string }): Promise<Comment> {
      return this.repo.create(input);
    }
    update(input: { id: string; authorId: string; text: string }): Promise<Comment> {
      return this.repo.update(input);
    }
    async delete(input: { id: string; authorId: string }): Promise<boolean> {
      return this.repo.delete(input);
    }
  }
  