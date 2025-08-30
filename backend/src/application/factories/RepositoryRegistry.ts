// /src/application/factories/RepositoryRegistry.ts
type Builder<T> = (deps: any) => T;

export interface RepoToken<T> { key: string }
export const createRepoToken = <T>(key: string): RepoToken<T> => ({ key });

class RepositoryRegistry {
  private builders = new Map<string, Builder<any>>();

  register<T>(token: RepoToken<T>, builder: Builder<T>) {
    if (!this.builders.has(token.key)) this.builders.set(token.key, builder);
  }

  resolve<T>(token: RepoToken<T>, deps: any): T {
    const b = this.builders.get(token.key);
    if (!b) throw new Error(`Repository not registered: ${token.key}`);
    return b(deps) as T;
  }
}

export const repositoryRegistry = new RepositoryRegistry();
