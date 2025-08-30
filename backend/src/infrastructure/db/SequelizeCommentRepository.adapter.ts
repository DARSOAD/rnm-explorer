import { Op } from "sequelize";
import type {
  CommentRepository,
  Comment,
  PaginatedResult,
  ListCommentsParams,
  CommentSort,
} from "../../domain/comments/CommentRepository.port";

function toDomain(row: any): Comment {
  const r = typeof row?.get === "function" ? row.get({ plain: true }) : row; // 
  return {
    id: r.id,
    characterId: r.character_id ?? r.characterId,
    author: r.author ?? r.authorId,     
    content: r.content ?? r.text,            
    createdAt: r.created_at ?? r.createdAt,
    updatedAt: r.updated_at ?? r.updatedAt,
  };
}

function orderOf(sort: CommentSort): [string, "ASC" | "DESC"] {
  return sort === "CREATED_AT_ASC" ? ["created_at", "ASC"] : ["created_at", "DESC"];
}

export class SequelizeCommentRepository implements CommentRepository {
  constructor(private models: any) {}

  async list(params: ListCommentsParams): Promise<PaginatedResult<Comment>> {
    const { Comment } = this.models;
    const offset = (params.page - 1) * params.pageSize;
    const [col, dir] = orderOf(params.sort);

    const { rows, count } = await Comment.findAndCountAll({
      where: { character_id: params.characterId },
      order: [[col, dir]],
      limit: params.pageSize,
      offset,
    });

    const totalPages = Math.max(1, Math.ceil(count / params.pageSize));
    return {
      items: rows.map(toDomain),
      totalItems: count,
      page: params.page,
      pageSize: params.pageSize,
      totalPages,
      hasNext: params.page < totalPages,
      hasPrev: params.page > 1,
    };
  }

  async create(input: { characterId: string; authorId: string; text: string }): Promise<Comment> {
    const { Comment } = this.models;
    const row = await Comment.create({
      character_id: input.characterId,
      author: input.authorId,
      content: input.text,
    });
    return toDomain(row);
  }

  async getById(id: string): Promise<Comment | null> {
    const { Comment } = this.models;
    const row = await Comment.findByPk(id);
    return row ? toDomain(row) : null;
  }

  async update(input: { id: string; authorId: string; text: string }): Promise<Comment> {
    const { Comment } = this.models;
    const row = await Comment.findOne({ 
      where: { 
        id: input.id, 
        author: input.authorId 
      } 
    });
    if (!row) throw new Error("Comment not found or not owned by author");
    row.content = input.text;
    await row.save();
    return toDomain(row);
  }

  async delete(input: { id: string; authorId: string }): Promise<boolean> {
    const { Comment } = this.models;
    const n = await Comment.destroy({ 
      where: { 
        id: input.id, 
        author: input.authorId 
      } 
    });
    return n > 0;
  }
}
