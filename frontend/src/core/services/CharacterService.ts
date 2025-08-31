import { ApolloClient, NormalizedCacheObject, gql } from "@apollo/client";
import { buildCharactersVariables, CharactersQueryVars } from "../adapters/Filter.builder";
import { toCharacterListVM, CharacterListVM } from "../adapters/Character.adapter";
import { chooseFetchPolicy } from "../strategies/FetchPolicy.strategy";

export type CharacterServiceDeps = { apollo: ApolloClient<NormalizedCacheObject> };

export class CharacterService {
  constructor(private deps: CharacterServiceDeps) {}

  async list(input: Partial<CharactersQueryVars>): Promise<CharacterListVM> {
    const variables = buildCharactersVariables(input);

    const { data } = await this.deps.apollo.query({
      query: CHARACTERS_QUERY_WITH_FILTERS,
      variables,
      fetchPolicy: chooseFetchPolicy("list"),
    });

    return toCharacterListVM(data);
  }
}

/** Versión con input `filters`. Ajusta si tu schema usa args sueltos. */
export const CHARACTERS_QUERY_WITH_FILTERS = gql`
  query Characters(
    $page: Int, $pageSize: Int, $sort: CharacterSort,
    $filters: CharacterFiltersInput
  ) {
    characters(page: $page, pageSize: $pageSize, sort: $sort, filters: $filters) {
      items { id name status species gender image }
      pageInfo { page pageSize totalItems totalPages hasNext hasPrev }
    }
  }
`;

