import type { Request } from "express";
import { initSequelize } from "../db/sequelize";
import { InMemoryEventBus } from "../events/InMemoryEventBus.adapter";
import { measure } from "../loggin/timing.plugin";
import { RedisCache } from "../cache/RedisCache.adapter";
import { loadFeatureModules, initModules } from "../registry/ModuleLoader";
import type { ContextRegistry } from "../../modules/FeatureModule";

export type Ctx = {
  req: Request;
  logger: Console;
  user?: { id: string | null };
  eventBus: InMemoryEventBus;
  // OCP Access to module-specific
  facades: {
    get<T = any>(moduleName: string): T;
  };
};

type Container = {
  eventBus: InMemoryEventBus;
  ctxReg: ContextRegistry;
  sdl: string;
  resolvers: Record<string, any>;
};

let containerPromise: Promise<Container> | null = null;

async function buildContainer(): Promise<Container> {
  const models = await initSequelize();
  const eventBus = new InMemoryEventBus();
  const cache = (process.env.CACHE_MODE ?? "db-only").toLowerCase() === "cache-first" ? new RedisCache() : undefined;

  const featureModules = await loadFeatureModules();
  const { sdl, resolvers, ctxReg } = await initModules(featureModules, { models, eventBus, cache, measure });

  return { eventBus, ctxReg, sdl, resolvers };
}

export async function getContainer(): Promise<Container> {
  if (!containerPromise) containerPromise = buildContainer();
  return containerPromise;
}

export async function makeContext({ req }: { req: Request }): Promise<Ctx> {
  const { eventBus, ctxReg } = await getContainer();
  const userId = (req.headers["x-user-id"] as string) || null;

  return {
    req,
    logger: console,
    user: { id: userId },
    eventBus,
    facades: {
      get<T = any>(moduleName: string): T {
        const found = ctxReg.facades.get(moduleName);
        if (!found) throw new Error(`Facade not found for module: ${moduleName}`);
        return found as T;
      },
    },
  };
}
