import { useMemo, useState, useCallback } from "react";
import { useApolloClient, useMutation, useQuery } from "@apollo/client";
import {
  LIST_COMMENTS_QUERY,
  ADD_COMMENT_MUTATION,
  UPDATE_COMMENT_MUTATION,
  DELETE_COMMENT_MUTATION,
} from "../graphql/comments.gql";
import type { CommentsPageVM, CommentVM } from "../../../core/adapters/Comment.adapter";
import { toCommentsPageVM } from "../../../core/adapters/Comment.adapter";

const VIEWER = "global";

type Sort = "CREATED_AT_DESC" | "CREATED_AT_ASC";

export function useComments(characterId?: string, initialPage = 1, initialPageSize = 10, initialSort: Sort = "CREATED_AT_DESC") {
  const client = useApolloClient();

  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sort, setSort] = useState<Sort>(initialSort);

  const { data, loading, error, refetch } = useQuery(LIST_COMMENTS_QUERY, {
    variables: { input: { characterId, page, pageSize, sort } },
    skip: !characterId,
    fetchPolicy: "cache-and-network",
  });

  const pageVM: CommentsPageVM | null = useMemo(() => (data ? toCommentsPageVM(data) : null), [data]);

  // --------- Mutations ----------
  const [addMutation, addState] = useMutation(ADD_COMMENT_MUTATION);
  const [updateMutation, updateState] = useMutation(UPDATE_COMMENT_MUTATION, { onError: () => {/* opcional */} });
  const [deleteMutation, deleteState] = useMutation(DELETE_COMMENT_MUTATION);

  const addComment = useCallback(async (content: string) => {
    if (!characterId) return;

    const optimisticId = crypto?.randomUUID?.() ?? `tmp-${Date.now()}`;
    await addMutation({
      variables: { input: { characterId, author: VIEWER, content } },
      optimisticResponse: {
        addComment: {
          __typename: "Comment",
          id: optimisticId,
          characterId,
          author: VIEWER,
          content,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
      update(cache, { data: resp }) {
        const newItem = resp?.addComment;
        if (!newItem) return;
        const vars = { input: { characterId, page, pageSize, sort } };
        const existing = cache.readQuery<any>({ query: LIST_COMMENTS_QUERY, variables: vars });
        if (!existing?.comments) return;
        const next = {
          comments: {
            ...existing.comments,
            items: [newItem, ...existing.comments.items],
            pageInfo: {
              ...existing.comments.pageInfo,
              totalItems: existing.comments.pageInfo.totalItems + 1,
            },
          },
        };
        cache.writeQuery({ query: LIST_COMMENTS_QUERY, variables: vars, data: next });
      },
    });
  }, [addMutation, characterId, page, pageSize, sort]);

  const updateComment = useCallback(async (id: string, content: string) => {
    // si tu backend aún no soporta updateComment, puedes retornar sin hacer nada o implementar delete+add
    if (!characterId) return;
    await updateMutation({
      variables: { input: { id, author: VIEWER, content } },
      optimisticResponse: {
        updateComment: {
          __typename: "Comment",
          id,
          author: VIEWER,
          content,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
      update(cache, { data: resp }) {
        const updated = resp?.updateComment;
        if (!updated) return;
        const vars = { input: { characterId, page, pageSize, sort } };
        const existing = cache.readQuery<any>({ query: LIST_COMMENTS_QUERY, variables: vars });
        if (!existing?.comments) return;
        const items = existing.comments.items.map((c: any) => (c.id === id ? { ...c, content: updated.content, updatedAt: updated.updatedAt } : c));
        cache.writeQuery({
          query: LIST_COMMENTS_QUERY,
          variables: vars,
          data: { comments: { ...existing.comments, items } },
        });
      },
    });
  }, [updateMutation, characterId, page, pageSize, sort]);

  const deleteComment = useCallback(async (id: string) => {
    if (!characterId) return;
    await deleteMutation({
      variables: { input: { id, author: VIEWER } },
      optimisticResponse: { deleteComment: true },
      update(cache) {
        const vars = { input: { characterId, page, pageSize, sort } };
        const existing = cache.readQuery<any>({ query: LIST_COMMENTS_QUERY, variables: vars });
        if (!existing?.comments) return;
        const items = existing.comments.items.filter((c: any) => c.id !== id);
        cache.writeQuery({
          query: LIST_COMMENTS_QUERY,
          variables: vars,
          data: {
            comments: {
              ...existing.comments,
              items,
              pageInfo: { ...existing.comments.pageInfo, totalItems: Math.max(existing.comments.pageInfo.totalItems - 1, 0) },
            },
          },
        });
      },
    });
  }, [deleteMutation, characterId, page, pageSize, sort]);

  return {
    pageVM,
    loading,
    error,
    page, setPage,
    pageSize, setPageSize,
    sort, setSort,
    refetch,
    addComment,
    updateComment,
    deleteComment,
    adding: addState.loading,
    updating: updateState.loading,
    deleting: deleteState.loading,
  };
}
