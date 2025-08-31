import { gql } from "@apollo/client";

export const LIST_COMMENTS_QUERY = gql`
  query ListComments($input: ListCommentsInput!) {
    comments(input: $input) {
      items {
        id
        author
        content
        createdAt
        updatedAt
      }
      pageInfo {
        page
        pageSize
        totalItems
        totalPages
        hasNext
        hasPrev
      }
    }
  }
`;

export const ADD_COMMENT_MUTATION = gql`
  mutation AddComment($input: AddCommentInput!) {
    addComment(input: $input) {
      id
      characterId
      author
      content
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_COMMENT_MUTATION = gql`
  mutation UpdateComment($input: UpdateCommentInput!) {
    updateComment(input: $input) {
      id
      author
      content
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_COMMENT_MUTATION = gql`
  mutation DeleteComment($input: DeleteCommentInput!) {
    deleteComment(input: $input)
  }
`;
