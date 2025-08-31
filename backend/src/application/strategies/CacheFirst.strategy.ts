import type { CharacterListStrategy } from "./CharacterListStrategy.port";
import type {
  CharacterRepository,
  CharacterListParams,
  CharacterListFilters,
} from "../../domain/character/CharacterRepository.port";
import type { Cache } from "../../domain/ports/Cache.port";
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
  const params: CharacterListParams = cleaned ? { ...base, filters: cleaned } : { ...base };
  return params;
}

// Clave estable de caché a partir de los parámetros ya limpios
function keyFromParams(params: CharacterListParams) {
  const { page, pageSize, sort } = params;
  const fobj = params.filters ?? {};
  const f = Object.keys(fobj)
    .sort()
    .map((k) => `${k}:${(fobj as any)[k]}`)
    .join("|");
  return `characters:v1:p=${page}:s=${pageSize}:o=${sort}:f=${f}`;
}

type RepoListResult = Awaited<ReturnType<CharacterRepository["list"]>>;

// ---- strategy ----

export class CacheFirstStrategy implements CharacterListStrategy {
  constructor(
    private readonly repo: CharacterRepository,
    private readonly cache: Cache,
    private readonly ttlSeconds = 60 * 5 // 5 min
  ) {}

  async list(input: CharacterListInput) {
    const params = toRepoParams(input);
    const key = keyFromParams(params);

    const cached = await this.cache.get<RepoListResult>(key);
    if (cached) {
      // console.log("[Cache] hit", key);
      return cached;
    }

    const result = await this.repo.list(params);
    await this.cache.set(key, result, this.ttlSeconds);
    return result;
  }
}
