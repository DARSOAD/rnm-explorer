// src/domain/character/CharacterRepository.port.ts
import type { Character } from "./Character.entity";

export type Sort = "NAME_ASC" | "NAME_DESC";

export type PageInfo = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export type CharacterListFilters = {
  status?: string;
  species?: string;
  gender?: string;
  name?: string;
  origin?: string;    // por nombre (ILIKE)
  originId?: string;  // por ID exacto
};

export type CharacterListParams = {
  page: number;
  pageSize: number;
  sort: Sort;
  filters?: CharacterListFilters; 
};

export type CharacterEntity = Character;
export type ListPage<T> = { items: T[]; pageInfo: PageInfo };

export interface CharacterRepository {
  list(params: CharacterListParams): Promise<ListPage<{
    id: string;
    name: string;
    status?: string | null;
    species?: string | null;
    type?: string | null;
    gender?: string | null;
    image?: string | null;
    originId?: string | null;
  }>>;

  getById(id: string): Promise<CharacterEntity | null>;
}
