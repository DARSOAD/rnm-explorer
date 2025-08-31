// /src/infrastructure/db/SequelizeCharacterRepository.adapter.ts
import {
  Op,
  type WhereOptions,
  type IncludeOptions,
  type Model,
  type ModelStatic,
} from "sequelize";
import type {
  CharacterRepository,
  CharacterListParams,
} from "../../domain/character/CharacterRepository.port";
import { sequelize } from "./sequelize";
import type { Character as CharacterEntity } from "../../domain/character/Character.entity";

// --- helpers ---
function requireModel<T extends Model>(name: string): ModelStatic<T> {
  const m = (sequelize.models as Record<string, unknown>)[name] as ModelStatic<T> | undefined;
  if (!m) throw new Error(`Sequelize model "${name}" is not registered`);
  return m;
}

const Character = requireModel<Model>("Character");
const Location  = requireModel<Model>("Location"); // debe existir la asociación { as: 'origin' }

export function buildSequelizeQuery(params: CharacterListParams): {
  where: WhereOptions;
  include: IncludeOptions[];
  order: any[];
  limit: number;
  offset: number;
} {
  const { page, pageSize, sort, filters } = params;

  const where: WhereOptions = {};
  const include: IncludeOptions[] = [];

  // ---- filtros directos ----
  if (filters?.status)  where.status  = { [Op.iLike]: filters.status };
  if (filters?.gender)  where.gender  = { [Op.iLike]: filters.gender };
  if (filters?.species) where.species = { [Op.iLike]: `%${filters.species}%` };
  if (filters?.name)    where.name    = { [Op.iLike]: `%${filters.name}%` };

  // ---- filtro por origen (join) ----
  if (filters?.originId) {
    include.push({
      model: Location,
      as: "origin",
      required: true,
      where: { id: filters.originId },
      attributes: [],
    });
  } else if (filters?.origin) {
    include.push({
      model: Location,
      as: "origin",
      required: true,
      where: { name: { [Op.iLike]: `%${filters.origin}%` } },
      attributes: [],
    });
  }

  const order = [["name", sort === "NAME_ASC" ? "ASC" : "DESC"]];
  const limit = pageSize;
  const offset = (page - 1) * pageSize;

  return { where, include, order, limit, offset };
}

export class SequelizeCharacterRepository implements CharacterRepository {
  async list(params: CharacterListParams) {
    const { where, include, order, limit, offset } = buildSequelizeQuery(params);

    // Tipamos el resultado para que `count` sea number y evitar el error de `never`.
    const res = (await Character.findAndCountAll({
      where,
      include,
      order,
      limit,
      offset,
      attributes: ["id", "name", "status", "species", "type", "gender", "image", "origin_id"],
    })) as unknown as { rows: any[]; count: number };

    const { rows, count } = res;
    const totalItems = count; // ya es number
    const totalPages = Math.max(1, Math.ceil(totalItems / params.pageSize));

    return {
      items: rows.map((r: any) => ({
        id: r.id,
        name: r.name,
        status: r.status,
        species: r.species,
        type: r.type,
        gender: r.gender,
        image: r.image,
        originId: r.origin_id ?? null,
      })),
      pageInfo: {
        page: params.page,
        pageSize: params.pageSize,
        totalItems,
        totalPages,
        hasNext: params.page < totalPages,
        hasPrev: params.page > 1,
      },
    };
  }


  
  async getById(id: string): Promise<CharacterEntity | null> {
    const row = await Character.findByPk(id, {
      // pide TODAS las columnas que existen en tu migración 0003 (y que suelen estar en la entidad)
      attributes: [
        "id",
        "api_id",
        "name",
        "status",
        "species",
        "type",
        "gender",
        "image",
        "url",
        "origin_id",
        "location_id",
        "api_created_at",
        "created_at",
        "updated_at",
      ],
    });

    if (!row) return null;

    // `row.toJSON()` te da el objeto plano con snake_case
    const data = (row as any).toJSON ? (row as any).toJSON() : (row as any);
    return toCharacterEntity(data);
  }
}

function toCharacterEntity(row: any): CharacterEntity {
  return {
    id: row.id,
    apiId: row.api_id,
    name: row.name,
    status: row.status ?? null,
    species: row.species ?? null,
    type: row.type ?? null,
    gender: row.gender ?? null,
    image: row.image ?? null,
    originId: row.origin_id ?? null,
    locationId: row.location_id ?? null,
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
    updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),
  };
}
