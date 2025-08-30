import type {
    CharacterRepository, ListParams, ListResult, PageInfo,
  } from "../../domain/character/CharacterRepository.port";
  import type { Character as DomainCharacter } from "../../domain/character/Character.entity";
  
  const toDomain = (row: any): DomainCharacter => ({
    id: row.id,
    apiId: row.api_id ?? null,
    name: row.name,
    status: row.status ?? null,
    species: row.species ?? null,
    type: row.type ?? null,
    gender: row.gender ?? null,
    image: row.image ?? null,
    originId: row.origin_id ?? null,
    locationId: row.location_id ?? null,
    createdAt: row.created_at ?? row.createdAt ?? new Date(),
    updatedAt: row.updated_at ?? row.updatedAt ?? new Date(),
  });
  
  export class SequelizeCharacterRepository implements CharacterRepository {
    constructor(private readonly models: any) {}
  
    async list({ page, pageSize, sort }: ListParams): Promise<ListResult> {
      const offset = (page - 1) * pageSize;
      const order =
        sort === "NAME_ASC"
          ? [["name", "ASC"], ["id", "ASC"]]
          : [["name", "DESC"], ["id", "DESC"]];
  
      const { rows, count } = await this.models.Character.findAndCountAll({
        offset,
        limit: pageSize,
        order,
        // attributes: ["id","name","status","species","gender","image"] // opcional
      });
  
      const totalPages = Math.max(1, Math.ceil(count / pageSize));
      const pageInfo: PageInfo = {
        page,
        pageSize,
        totalItems: count,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      };
  
      return { items: rows.map(toDomain), pageInfo };
    }
  
    async getById(id: string): Promise<DomainCharacter | null> {
      const row = await this.models.Character.findByPk(id);
      return row ? toDomain(row) : null;
    }
  }
  