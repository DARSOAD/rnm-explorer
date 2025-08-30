import type { FeatureModule, ModuleInitDeps, ContextRegistry } from "../FeatureModule";
import { repositoryRegistry } from "../../application/factories/RepositoryRegistry";
import { FAVORITES_REPO } from "./repository.registration";
import { makeFavoriteStrategy } from "../../application/factories/FavoriteStrategy.factory";
import { IsFavorite } from "../../application/favorites/IsFavorite.usecase";
import { ToggleFavorite } from "../../application/favorites/ToggleFavorite.usecase";
import { FavoriteInputSchema } from "../../application/schemas/FavoriteInput.schema";

import "./repository.registration"; // side-effect: registra el repo

const sdl = /* GraphQL */ `
  extend type Character {
    isFavorite(viewerId: String!): Boolean!
  }

  input FavoriteInput {
    characterId: ID!
    viewerId: String!
  }

  type FavoriteStatus {
    characterId: ID!
    viewerId: String!
    isFavorite: Boolean!
  }

  extend type Query {
    isFavorite(input: FavoriteInput!): Boolean!
  }

  extend type Mutation {
    toggleFavorite(input: FavoriteInput!): FavoriteStatus!
  }
`;

const resolvers = {
  Character: {
    isFavorite: async (parent: any, args: { viewerId: string }, ctx: any) => {
      const favorites = ctx.facades.get("favorites") as {
        isFavorite: (i: { characterId: string; viewerId: string }) => Promise<boolean>;
      };
      return favorites.isFavorite({ characterId: parent.id, viewerId: args.viewerId });
    },
  },
  Query: {
    isFavorite: async (_: any, { input }: any, ctx: any) => {
      const favorites = ctx.facades.get("favorites") as {
        isFavorite: (i: any) => Promise<boolean>;
      };
      return favorites.isFavorite(input);
    },
  },
  Mutation: {
    toggleFavorite: async (_: any, { input }: any, ctx: any) => {
      const favorites = ctx.facades.get("favorites") as {
        toggle: (i: any) => Promise<any>;
      };
      return favorites.toggle(input);
    },
  },
};

async function init(deps: ModuleInitDeps, ctxReg: ContextRegistry) {
  const repo = repositoryRegistry.resolve(FAVORITES_REPO, { models: deps.models });
  const strategy = makeFavoriteStrategy(repo, deps.cache);

  const isFavUc = new IsFavorite(strategy, deps.eventBus, deps.measure);
  const toggleUc = new ToggleFavorite(strategy, deps.eventBus, deps.measure);

  ctxReg.facades.set("favorites", {
    isFavorite: (input: any) => isFavUc.execute(FavoriteInputSchema.parse(input)),
    toggle:     (input: any) => toggleUc.execute(FavoriteInputSchema.parse(input)),
  });
}

export default { name: "favorites", sdl, resolvers, init } satisfies FeatureModule;
