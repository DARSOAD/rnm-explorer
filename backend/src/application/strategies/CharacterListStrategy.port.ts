import type { CharacterListInput } from "../schemas/CharacterListInput.schema";

export interface CharacterListStrategy {
  list(input: CharacterListInput): Promise<{
    items: {
      id: string;
      name: string;
      status?: string | null;
      species?: string | null;
      type?: string | null;
      gender?: string | null;
      image?: string | null;
    }[];
    pageInfo: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>;
}
