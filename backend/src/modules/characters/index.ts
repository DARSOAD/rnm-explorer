// /src/modules/characters/index.ts (fragmentos clave)
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
      status: String
      species: String
      gender: String
      origin: ID
      name: String
    ): CharactersResult!
    
    character(id: ID!): Character
  }
`;

const resolvers = {
  Query: {
    characters: async (_p: any, args: any, ctx: any) => {
      const characters = ctx.facades.get("characters") as { list: (i: any) => Promise<any> };
      return characters.list(args);
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