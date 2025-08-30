// src/domain/character/CharacterRepository.port.ts
import type { Character } from "./Character.entity";

export type Sort = "NAME_ASC" | "NAME_DESC";

export type ListParams = {
  page: number;
  pageSize: number;
  sort: Sort;
  status?: string;
  species?: string;
  gender?: string;
  origin?: string;
  name?: string;
};

export type PageInfo = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export type CharacterEntity = Character;

export type ListResult = { items: CharacterEntity[]; pageInfo: PageInfo };

export interface CharacterRepository {
  list(params: ListParams): Promise<ListResult>;
  getById(id: string): Promise<CharacterEntity | null>;
}
