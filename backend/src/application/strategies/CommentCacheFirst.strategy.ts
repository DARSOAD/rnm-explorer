import type {
    Comment,
    PaginatedResult,
    ListCommentsParams,
  } from "../../domain/comments/CommentRepository.port";
  import type { CommentStrategy, CommentStrategyDeps } from "./CommentStrategy.port";
  import type { Cache } from "../../domain/ports/Cache.port";
  
  type Deps = CommentStrategyDeps & { cache: Cache; ttlSeconds?: number };
  
  const DEFAULT_TTL = 60 * 60 * 12;
  
  function keyForList(p: ListCommentsParams) {
    return `comments:list:${p.characterId}:p=${p.page}&ps=${p.pageSize}&sort=${p.sort}`;
  }
  
  export class CommentCacheFirstStrategy implements CommentStrategy {
    private repo = this.deps.repo;
    private cache = this.deps.cache;
    private ttl = this.deps.ttlSeconds ?? DEFAULT_TTL;
  
    constructor(private deps: Deps) {}
  
    async list(input: ListCommentsParams): Promise<PaginatedResult<Comment>> {
      const key = keyForList(input);
      const hit = await this.cache.get<PaginatedResult<Comment>>(key);
      if (hit) {
        // console.log("[Cache] hit", key);
        return hit;
      }
      const fresh = await this.repo.list(input);
      await this.cache.set(key, fresh, this.ttl);
      return fresh;
    }
  
    async create(input: { characterId: string; authorId: string; text: string }): Promise<Comment> {
      const created = await this.repo.create(input);
      await this.invalidateLists(created.characterId);
      return created;
    }
  
    async update(input: { id: string; authorId: string; text: string }): Promise<Comment> {
      const updated = await this.repo.update(input);
      await this.invalidateLists(updated.characterId);
      return updated;
    }
  
    async delete(input: { id: string; authorId: string }): Promise<boolean> {
      // need characterId to invalidate; read once
      const byId = await this.repo.getById(input.id);
      const ok = await this.repo.delete(input);
      if (ok && byId) await this.invalidateLists(byId.characterId);
      return ok;
    }
  
    private async invalidateLists(characterId: string) {
      // Estrategia simple: si tu Cache soporta patrones, úsalo.
      // Si no, borra variantes comunes:
      const sorts = ["CREATED_AT_ASC", "CREATED_AT_DESC"] as const;
      const pages = [1]; // opcional: invalida solo primera página por simplicidad/seguridad
      const pageSizes = [10, 20, 50];
      const keys = [];
      for (const sort of sorts)
        for (const page of pages)
          for (const ps of pageSizes)
            keys.push(`comments:list:${characterId}:p=${page}&ps=${ps}&sort=${sort}`);
      await Promise.all(keys.map((k) => this.deps.cache.del(k)));
    }
  }
  