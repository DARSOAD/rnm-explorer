import { z } from "zod";

export const CommentSortSchema = z.enum(["CREATED_AT_ASC", "CREATED_AT_DESC"]);
export type CommentSort = z.infer<typeof CommentSortSchema>;

export const ListCommentsSchema = z.object({
  characterId: z.string().min(1, "characterId required"),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(20),
  sort: CommentSortSchema.default("CREATED_AT_DESC"),
});
export type ListCommentsInput = z.infer<typeof ListCommentsSchema>;

export const AddCommentSchema = z.object({
  characterId: z.string().min(1),
  authorId: z.string().min(1),
  text: z.string().min(1).max(1000),
});
export type AddCommentInput = z.infer<typeof AddCommentSchema>;

export const UpdateCommentSchema = z.object({
  id: z.string().min(1),
  authorId: z.string().min(1),
  text: z.string().min(1).max(1000),
});
export type UpdateCommentInput = z.infer<typeof UpdateCommentSchema>;

export const DeleteCommentSchema = z.object({
  id: z.string().min(1),
  authorId: z.string().min(1),
});
export type DeleteCommentInput = z.infer<typeof DeleteCommentSchema>;
