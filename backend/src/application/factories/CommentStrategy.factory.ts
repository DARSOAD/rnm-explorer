import type { CommentRepository } from "../../domain/comments/CommentRepository.port";
import type { Cache } from "../../domain/ports/Cache.port";
import { CommentDbOnlyStrategy } from "../strategies/CommentDbOnly.strategy";
import { CommentCacheFirstStrategy } from "../strategies/CommentCacheFirst.strategy";
import type { CommentStrategy } from "../strategies/CommentStrategy.port";

export function makeCommentStrategy(repo: CommentRepository, cache?: Cache): CommentStrategy {
  const mode = process.env.CACHE_MODE ?? "DB_ONLY";
  if (mode === "CACHE_FIRST" && cache) {
    return new CommentCacheFirstStrategy({ repo, cache });
  }
  return new CommentDbOnlyStrategy({ repo });
}
