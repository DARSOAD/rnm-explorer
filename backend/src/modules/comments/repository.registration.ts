import { createRepoToken, repositoryRegistry } from "../../application/factories/RepositoryRegistry";
import type { CommentRepository } from "../../domain/comments/CommentRepository.port";
import { SequelizeCommentRepository } from "../../infrastructure/db/SequelizeCommentRepository.adapter";

export const COMMENTS_REPO = createRepoToken<CommentRepository>("comments.repo");

// Builder por defecto: Sequelize (recibe models desde init)
repositoryRegistry.register(COMMENTS_REPO, (deps: { models: any }) => {
  return new SequelizeCommentRepository(deps.models);
});
