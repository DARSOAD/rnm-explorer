import type { CharacterListStrategy } from "./CharacterListStrategy.port";
import type {
  CharacterRepository,
  CharacterListParams,
  CharacterListFilters,
  CharacterEntity,
} from "../../domain/character/CharacterRepository.port";
import type { CharacterListInput } from "../schemas/CharacterListInput.schema";

// ---- utils ----

// Remueve claves con undefined/null/"" del objeto dado
type Clean<T> = { [K in keyof T]?: Exclude<T[K], undefined | null | ""> };
function prune<T extends Record<string, any>>(obj?: T): Clean<T> | undefined {
  if (!obj) return undefined;
  const out: any = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined && v !== null && String(v).trim() !== "") out[k] = v;
  }
  return Object.keys(out).length ? (out as Clean<T>) : undefined;
}

// Transforma el input de Zod → contrato del dominio (repo)
// Importante: con exactOptionalPropertyTypes=true NO incluimos `filters` si está undefined.
function toRepoParams(input: CharacterListInput): CharacterListParams {
  const cleaned = prune(input.filters) as CharacterListFilters | undefined;
  const base = { page: input.page, pageSize: input.pageSize, sort: input.sort } as const;
  return cleaned ? { ...base, filters: cleaned } : { ...base };
}

// ---- strategy ----

export class DbOnlyStrategy implements CharacterListStrategy {
  constructor(private readonly repo: CharacterRepository) {}

  list(input: CharacterListInput) {
    const params = toRepoParams(input);
    return this.repo.list(params);
  }
  async getById(id: string): Promise<CharacterEntity | null> {
    return this.repo.getById(id);
  }
}
