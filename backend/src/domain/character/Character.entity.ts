export interface Character {
    id: string;
    apiId: number | null;
    name: string;
    status: string | null;
    species: string | null;
    type: string | null;
    gender: string | null;
    image?: string | null;
    originId?: string | null;
    locationId?: string | null;
    createdAt: Date;
    updatedAt: Date;
  }
  