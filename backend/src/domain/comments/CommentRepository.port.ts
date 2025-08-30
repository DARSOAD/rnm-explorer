export type CommentSort = "CREATED_AT_ASC" | "CREATED_AT_DESC";

export interface Comment {
  id: string;
  characterId: string;
  author: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListCommentsParams {
  characterId: string;
  page: number;
  pageSize: number;
  sort: CommentSort;
}

export interface PaginatedResult<T> {
  items: T[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface CommentRepository {
  list(params: ListCommentsParams): Promise<PaginatedResult<Comment>>;
  create(input: { characterId: string; authorId: string; text: string }): Promise<Comment>;
  getById(id: string): Promise<Comment | null>;
  update(input: { id: string; authorId: string; text: string }): Promise<Comment>;
  delete(input: { id: string; authorId: string }): Promise<boolean>;
}
