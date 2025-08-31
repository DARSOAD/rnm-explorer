// frontend/src/core/adapters/Filter.builder.ts
export type Sort = "NAME_ASC" | "NAME_DESC";

export type Filters = {
  status?: string;   // Alive/Dead/unknown
  species?: string;  // Human, Alien, ...
  gender?: string;   // Male/Female/Genderless/unknown
  name?: string;     // 
  origin?: string;   // 
};

export type CharactersQueryVars = {
  page: number;
  pageSize: number;
  sort?: Sort;
  filters?: Filters;
  viewerId: string; 
};

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

export function buildCharactersVariables(input: Partial<CharactersQueryVars>): CharactersQueryVars {
  const page = clamp(input.page ?? 1, 1, 999999);
  const pageSize = clamp(input.pageSize ?? 15, 1, 50);
  const sort: Sort = input.sort ?? "NAME_ASC";

  const clean = (v?: string) => (v && v.trim() ? v.trim() : undefined);
  const filters: Filters | undefined = input.filters
    ? {
        status: clean(input.filters.status),
        species: clean(input.filters.species),
        gender: clean(input.filters.gender),
        name: clean(input.filters.name),
        origin: clean(input.filters.origin),
      }
    : undefined;

  return { page, pageSize, sort, filters, viewerId: "global" };
}
