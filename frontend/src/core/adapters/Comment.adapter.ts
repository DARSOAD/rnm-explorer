export type CommentVM = {
    id: string;
    author: string;
    content: string;
    createdAt: string;
    updatedAt?: string | null;
    isEditing?: boolean; // estado UI
    isOptimistic?: boolean; // estado UI
  };
  
  export type CommentsPageVM = {
    items: CommentVM[];
    pageInfo: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  
  export const toCommentsPageVM = (data: any): CommentsPageVM => {
    const src = data?.comments;
    return {
      items: (src?.items ?? []).map((c: any) => ({
        id: c.id,
        author: c.author,
        content: c.content,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt ?? null,
      })),
      pageInfo: {
        page: src?.pageInfo?.page ?? 1,
        pageSize: src?.pageInfo?.pageSize ?? 10,
        totalItems: src?.pageInfo?.totalItems ?? 0,
        totalPages: src?.pageInfo?.totalPages ?? 0,
        hasNext: !!src?.pageInfo?.hasNext,
        hasPrev: !!src?.pageInfo?.hasPrev,
      },
    };
  };
  