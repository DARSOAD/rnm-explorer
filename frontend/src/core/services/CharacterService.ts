// src/core/services/CharacterService.ts
import { ApolloClient, NormalizedCacheObject, gql } from "@apollo/client";
import { buildCharactersVariables, CharactersQueryVars } from "../adapters/Filter.builder";
import { toCharacterListVM, CharacterListVM, toCharacterVM, CharacterVM } from "../adapters/Character.adapter";
import { chooseFetchPolicy } from "../strategies/FetchPolicy.strategy";

const VIEWER = "global";

export type CharacterServiceDeps = { apollo: ApolloClient<NormalizedCacheObject> };

export class CharacterService {
  constructor(private deps: CharacterServiceDeps) {}

  async list(input: Partial<CharactersQueryVars>): Promise<CharacterListVM> {
    // ⬇️ añade viewerId a las variables (tu fragment/selección lo requiere)
    const variables = { ...buildCharactersVariables(input), viewerId: VIEWER };
    const { data } = await this.deps.apollo.query({
      query: CHARACTERS_WITH_FAVS_QUERY,
      variables,
      fetchPolicy: chooseFetchPolicy("list"),
    });
    return toCharacterListVM(data);
  }

  async get(id: string): Promise<CharacterVM | null> {
    const { data } = await this.deps.apollo.query({
      query: CHARACTER_DETAIL_QUERY,
      // ⬇️ envía viewerId
      variables: { id, viewerId: VIEWER },
      fetchPolicy: chooseFetchPolicy("detail"),
    });
    return data?.character ? toCharacterVM(data.character) : null;
  }
}

export const CHARACTERS_WITH_FAVS_QUERY = gql`
  query Characters(
    $page:Int,
    $pageSize:Int,
    $sort:CharacterSort,
    $filters:CharacterFiltersInput,
    $viewerId: String!
  ){
    characters(page:$page,pageSize:$pageSize,sort:$sort,filters:$filters){
      items {
        id
        name
        status
        species
        gender
        image
        originId
        isFavorite(viewerId: $viewerId)   # ✅ con arg y usando la var
      }
      pageInfo { page pageSize totalItems totalPages hasNext hasPrev }
    }
  }
`;

export const CHARACTER_DETAIL_QUERY = gql`
  # ✅ declara $viewerId y elimina el duplicado de isFavorite
  query CharacterDetail($id: ID!, $viewerId: String!) {
    character(id: $id) {
      id
      name
      image
      species
      status
      gender
      isFavorite(viewerId: $viewerId)   # ✅ una sola vez y con arg
      originId                          # ✅ tu schema actual no tiene origin{}
    }
  }
`;
