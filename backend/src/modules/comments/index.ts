import type { FeatureModule, ModuleInitDeps, ContextRegistry } from "../FeatureModule";
import { repositoryRegistry } from "../../application/factories/RepositoryRegistry";
import { COMMENTS_REPO } from "./repository.registration";
import { makeCommentStrategy } from "../../application/factories/CommentStrategy.factory";

import { ListComments } from "../../application/comments/ListComments.usecase";
import { CreateComment } from "../../application/comments/CreateComment.usecase";
import { UpdateComment } from "../../application/comments/UpdateComment.usecase";
import { DeleteComment } from "../../application/comments/DeleteComment.usecase";

import {
  ListCommentsSchema,
  AddCommentSchema,
  UpdateCommentSchema,
  DeleteCommentSchema,
} from "../../application/schemas/CommentInput.schema";

import "./repository.registration"; // side-effect: register repos

const sdl = /* GraphQL */ `
  enum CommentSort { CREATED_AT_ASC, CREATED_AT_DESC }

  type Comment {
    id: ID!
    characterId: ID!
    author: String
    content: String!
    createdAt: String!
    updatedAt: String!
  }

  type CommentsResult {
    items: [Comment!]!
    pageInfo: PageInfo!
  }

  input ListCommentsInput {
    characterId: ID!
    page: Int = 1
    pageSize: Int = 20
    sort: CommentSort = CREATED_AT_DESC
  }

  input AddCommentInput {
    characterId: ID!
    author: String
    content: String!
  }

  input UpdateCommentInput {
    id: ID!
    author: String
    content: String!
  }

  input DeleteCommentInput {
    id: ID!
    author: String
  }

  extend type Query {
    comments(input: ListCommentsInput!): CommentsResult!
  }

  extend type Mutation {
    addComment(input: AddCommentInput!): Comment!
    updateComment(input: UpdateCommentInput!): Comment!
    deleteComment(input: DeleteCommentInput!): Boolean!
  }
`;

const resolvers = {
  Query: {
    comments: async (_: any, { input }: any, ctx: any) => {
      const facade = ctx.facades.get("comments") as { list: (i: any) => Promise<any> };
      return facade.list(input);
    },
  },
  Mutation: {
    addComment: async (_: any, { input }: any, ctx: any) => {
      const facade = ctx.facades.get("comments") as { add: (i: any) => Promise<any> };
      return facade.add(input);
    },
    updateComment: async (_: any, { input }: any, ctx: any) => {
      const facade = ctx.facades.get("comments") as { update: (i: any) => Promise<any> };
      return facade.update(input);
    },
    deleteComment: async (_: any, { input }: any, ctx: any) => {
      const facade = ctx.facades.get("comments") as { remove: (i: any) => Promise<boolean> };
      return facade.remove(input);
    },
  },
};

async function init(deps: ModuleInitDeps, ctxReg: ContextRegistry) {
  const repo = repositoryRegistry.resolve(COMMENTS_REPO, { models: deps.models });
  const strategy = makeCommentStrategy(repo, deps.cache);

  const listUc   = new ListComments({ strategy, eventBus: deps.eventBus });
  const createUc = new CreateComment({ strategy, eventBus: deps.eventBus });
  const updateUc = new UpdateComment({ strategy, eventBus: deps.eventBus });
  const deleteUc = new DeleteComment({ strategy, eventBus: deps.eventBus });

  ctxReg.facades.set("comments", {
    list: async (input: any) => {
      const r = await listUc.execute(ListCommentsSchema.parse(input));
      return {
        items: r.items,
        pageInfo: {
          page: r.page,
          pageSize: r.pageSize,
          totalItems: r.totalItems,
          totalPages: r.totalPages,
          hasNext: r.hasNext,
          hasPrev: r.hasPrev,
        },
      };
    },
  
    add: (input: any) => {
      const normalized = {
        ...input,
        authorId: input.authorId ?? input.author ?? "global",
        text: input.text ?? input.content,
      };
      return createUc.execute(normalized); 
    },
  
    update: (input: any) => {
      const normalized = {
        ...input,
        authorId: input.authorId ?? input.author ?? "global",
        text: input.text ?? input.content,
      };
      return updateUc.execute(normalized);
    },
  
    remove: (input: any) => {
      const normalized = {
        ...input,
        authorId: input.authorId ?? input.author ?? "global",
      };
      return deleteUc.execute(normalized);
    },
  });
}

export default { name: "comments", sdl, resolvers, init } satisfies FeatureModule;
