// /src/modules/characters/index.ts
import type { FeatureModule, ModuleInitDeps, ContextRegistry } from "../FeatureModule";
import { repositoryRegistry } from "../../application/factories/RepositoryRegistry";
import { CHARACTERS_REPO } from "./repository.registration";
import type { CharacterRepository } from "../../domain/character/CharacterRepository.port";

import { makeCharacterListStrategy } from "../../application/factories/CacheStrategy.factory";
import { ListCharacters } from "../../application/characters/ListCharacters.usecase";
import { GetCharacter } from "../../application/characters/GetCharacter.usecase";
import { DbOnlyStrategy } from "../../application/strategies/DbOnly.strategy";

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
    characters: async (_p: any, args: any, ctx: any) => {
      const characters = ctx.facades.get("characters") as { list: (i: any) => Promise<any> };
      const {
        page, pageSize, sort,
        status, species, gender, origin, name,
        filters = {}
      } = args;

      // Compat: mapear args sueltos → filters (prioridad a filters.* si viene)
      const mergedFilters = {
        status:  filters.status  ?? status  ?? undefined,
        species: filters.species ?? species ?? undefined,
        gender:  filters.gender  ?? gender  ?? undefined,
        name:    filters.name    ?? name    ?? undefined,
        // Soportar ID de origen y/o nombre:
        originId: filters.originId ?? origin ?? undefined,
        origin:   filters.origin   ?? undefined,
      };

      return characters.list({ page, pageSize, sort, filters: mergedFilters });
    },
    character: async (_p: any, { id }: any, ctx: any) => {
      const characters = ctx.facades.get("characters") as { get: (i: any) => Promise<any> };
      return characters.get({ id });
    },
  },
};

async function init(deps: ModuleInitDeps, ctxReg: ContextRegistry) {
  const characterRepo = repositoryRegistry.resolve<CharacterRepository>(
    CHARACTERS_REPO,
    { models: deps.models }
  );

  const listStrategy = makeCharacterListStrategy(characterRepo, deps.cache);
  const listUc = new ListCharacters(listStrategy, deps.eventBus, deps.measure);
  const getUc = new GetCharacter(new DbOnlyStrategy(characterRepo), deps.eventBus, deps.measure);

  ctxReg.facades.set("characters", {
    list: (input: any) => listUc.execute(input),
    get:  (input: any) => getUc.execute({ id: input.id }),
  });
}

export default { name: "characters", sdl, resolvers, init } satisfies FeatureModule;
