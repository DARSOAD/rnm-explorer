import type {
    CommentRepository,
    Comment,
    PaginatedResult,
    ListCommentsParams,
  } from "../../domain/comments/CommentRepository.port";
  
  export interface CommentStrategy {
    list(input: ListCommentsParams): Promise<PaginatedResult<Comment>>;
    create(input: { characterId: string; authorId: string; text: string }): Promise<Comment>;
    update(input: { id: string; authorId: string; text: string }): Promise<Comment>;
    delete(input: { id: string; authorId: string }): Promise<boolean>;
  }
  
  export type CommentStrategyDeps = {
    repo: CommentRepository;
  };
  