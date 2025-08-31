// Adapter: 
export type CharacterCardVM = {
  id: string;
  name: string;
  image: string | null;
  status?: string | null;
  species?: string | null;
  gender?: string | null;
  originName?: string | null; 
  isFavorite: boolean; 
};

export type CharacterVM = {
  id: string;
  name: string;
  image: string | null;
  status?: string | null;
  species?: string | null;
  gender?: string | null;
  originId?: string | null; 
  isFavorite: boolean;
};


export type PageInfoVM = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export type CharacterListVM = {
  items: CharacterCardVM[];
  pageInfo: PageInfoVM;
};

export function toCharacterListVM(data: any): CharacterListVM {
  const res = data?.characters ?? {};
  const items = (res.items ?? []).map((c: any) => ({
    id: c.id,
    name: c.name,
    image: c.image ?? null,
    status: c.status ?? null,
    species: c.species ?? null,
    gender: c.gender ?? null,
    isFavorite: c.isFavorite ?? false,
  }));
  const pi = res.pageInfo ?? {};
  return {
    items,
    pageInfo: {
      page: pi.page ?? 1,
      pageSize: pi.pageSize ?? items.length ?? 0,
      totalItems: pi.totalItems ?? items.length ?? 0,
      totalPages: pi.totalPages ?? 1,
      hasNext: !!pi.hasNext,
      hasPrev: !!pi.hasPrev,
    },
  };
}

export function toCharacterVM(node: any): CharacterVM {
  return {
    id: node?.id,
    name: node?.name,
    image: node?.image ?? null,
    status: node?.status ?? null,
    species: node?.species ?? null,
    gender: node?.gender ?? null,
    originId: node?.originId ?? null,
    isFavorite: node?.isFavorite ?? false,
  };
}