// /src/modules/characters/index.ts
import type { FeatureModule, ModuleInitDeps, ContextRegistry } from "../FeatureModule";

import { repositoryRegistry } from "../../application/factories/RepositoryRegistry";
import { CHARACTERS_REPO } from "./repository.registration";
import type { CharacterRepository } from "../../domain/character/CharacterRepository.port";

// ==== Favoritos (global) ====
import type { FavoriteRepository } from "../../domain/favorites/FavoriteRepository.port";
import { FAVORITES_REPO } from "../favorites/repository.registration"; // asegúrate de tener este token
import { makeFavoriteStrategy } from "../../application/factories/FavoriteStrategy.factory";
import { IsFavorite } from "../../application/favorites/IsFavorite.usecase";

import { makeCharacterListStrategy } from "../../application/factories/CacheStrategy.factory";
import { ListCharacters } from "../../application/characters/ListCharacters.usecase";
import { GetCharacter } from "../../application/characters/GetCharacter.usecase";
import { DbOnlyStrategy } from "../../application/strategies/DbOnly.strategy";

// ID fijo para “favorito global”
const GLOBAL_VIEWER_ID = "global";

const sdl = /* GraphQL */ `
  type Mutation { _noop: Boolean }
  enum CharacterSort { NAME_ASC, NAME_DESC }

  input CharacterFiltersInput {
    status: String
    species: String
    gender: String
    name: String
    origin: String
    originId: ID
    onlyFavorites: Boolean
  }

  type Character {
    id: ID!
    name: String!
    status: String
    species: String
    type: String
    gender: String
    image: String
    originId: ID
    isFavorite: Boolean!
  }

  type PageInfo {
    page: Int!
    pageSize: Int!
    totalItems: Int!
    totalPages: Int!
    hasNext: Boolean!
    hasPrev: Boolean!
  }

  type CharactersResult {
    items: [Character!]!
    pageInfo: PageInfo!
  }

  type Query {
    characters(
      page: Int = 1,
      pageSize: Int = 20,
      sort: CharacterSort = NAME_ASC,

      # ---- Compat args (deprecated) ----
      status: String @deprecated(reason: "Use filters.status")
      species: String @deprecated(reason: "Use filters.species")
      gender: String @deprecated(reason: "Use filters.gender")
      origin: ID @deprecated(reason: "Use filters.originId (ID) o filters.origin (name)")
      name: String @deprecated(reason: "Use filters.name")
      # ----------------------------------
      filters: CharacterFiltersInput
    ): CharactersResult!

    character(id: ID!): Character
  }
`;

const resolvers = {
  Query: {
    characters: async (_p: unknown, args: any, ctx: any) => {
      const characters = ctx.facades.get("characters") as { list: (i: any) => Promise<any> };

      const {
        page,
        pageSize,
        sort,
        status,
        species,
        gender,
        origin,
        name,
        filters = {},
      } = args;

      // Merge de filtros (incluye onlyFavorites)
      const mergedFilters = {
        status:        filters.status        ?? status        ?? undefined,
        species:       filters.species       ?? species       ?? undefined,
        gender:        filters.gender        ?? gender        ?? undefined,
        name:          filters.name          ?? name          ?? undefined,
        originId:      filters.originId      ?? origin        ?? undefined,
        origin:        filters.origin        ?? undefined,
        onlyFavorites: filters.onlyFavorites ?? undefined,
      };

      
      return characters.list({ page, pageSize, sort, filters: mergedFilters });
    },

    character: async (_p: unknown, { id }: any, ctx: any) => {
      const characters = ctx.facades.get("characters") as { get: (i: any) => Promise<any> };
      return characters.get({ id });
    },
  },

  Character: {
    // Campo calculado por fila: requiere viewerId → usamos el global
    isFavorite: async (parent: any, _args: unknown, ctx: any) => {
      const favorites = ctx.facades.get("favorites") as {
        isFavorite: (characterId: string, viewerId: string) => Promise<boolean>;
      };
      return favorites.isFavorite(parent.id, GLOBAL_VIEWER_ID);
    },
  },
};

async function init(deps: ModuleInitDeps, ctxReg: ContextRegistry) {
  // ========== Characters ==========
  const characterRepo = repositoryRegistry.resolve<CharacterRepository>(CHARACTERS_REPO, {
    models: deps.models,
  });

  const listStrategy = makeCharacterListStrategy(characterRepo, deps.cache as any);
  const listUc = new ListCharacters(listStrategy, deps.eventBus, deps.measure);
  const getUc = new GetCharacter(new DbOnlyStrategy(characterRepo), deps.eventBus, deps.measure);

  ctxReg.facades.set("characters", {
    list: (input: any) => listUc.execute(input),
    get:  (input: any) => getUc.execute({ id: input.id }),
  });

  // ========== Favoritos (global) ==========
  const favoriteRepo = repositoryRegistry.resolve<FavoriteRepository>(FAVORITES_REPO, {
    models: deps.models,
  });

  // Tu factory: CACHE_FIRST si CACHE_MODE === "CACHE_FIRST" y hay cache
  const favoriteStrategy = makeFavoriteStrategy(favoriteRepo, deps.cache);
  const isFavoriteUc = new IsFavorite(favoriteStrategy, deps.eventBus, deps.measure);

  // Exponemos una fachada “favorites” que consumen los resolvers de campo
  ctxReg.facades.set("favorites", {
    // Alinear con el input de IsFavorite.usecase → requiere viewerId
    isFavorite: (characterId: string, viewerId: string) =>
      isFavoriteUc.execute({ characterId, viewerId }),
  });
}

export default { name: "characters", sdl, resolvers, init } satisfies FeatureModule;
