import { ApolloClient, NormalizedCacheObject } from "@apollo/client";
import {
  LIST_COMMENTS_QUERY,
  ADD_COMMENT_MUTATION,
  UPDATE_COMMENT_MUTATION,
  DELETE_COMMENT_MUTATION,
} from "../../features/characters/graphql/comments.gql";
import { toCommentsPageVM, CommentsPageVM, CommentVM } from "../adapters/Comment.adapter";

export type CommentServiceDeps = { apollo: ApolloClient<NormalizedCacheObject> };

export class CommentService {
  constructor(private deps: CommentServiceDeps) {}

  async list(params: {
    characterId: string;
    page?: number;
    pageSize?: number;
    sort?: "CREATED_AT_DESC" | "CREATED_AT_ASC";
  }): Promise<CommentsPageVM> {
    const { data } = await this.deps.apollo.query({
      query: LIST_COMMENTS_QUERY,
      variables: { input: { characterId: params.characterId, page: params.page ?? 1, pageSize: params.pageSize ?? 10, sort: params.sort ?? "CREATED_AT_DESC" } },
      fetchPolicy: "cache-first",
    });
    return toCommentsPageVM(data);
  }

  async add(input: { characterId: string; author: string; content: string }): Promise<CommentVM> {
    const { data } = await this.deps.apollo.mutate({
      mutation: ADD_COMMENT_MUTATION,
      variables: { input },
    });
    const c = data?.addComment;
    return { id: c.id, author: c.author, content: c.content, createdAt: c.createdAt, updatedAt: c.updatedAt ?? null };
  }

  async update(input: { id: string; author: string; content: string }): Promise<CommentVM> {
    const { data } = await this.deps.apollo.mutate({
      mutation: UPDATE_COMMENT_MUTATION,
      variables: { input },
    });
    const c = data?.updateComment;
    return { id: c.id, author: c.author, content: c.content, createdAt: c.createdAt, updatedAt: c.updatedAt ?? null };
  }

  async remove(input: { id: string; author: string }): Promise<boolean> {
    const { data } = await this.deps.apollo.mutate({
      mutation: DELETE_COMMENT_MUTATION,
      variables: { input },
    });
    return Boolean(data?.deleteComment);
  }
}
