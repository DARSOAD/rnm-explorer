export type ModuleInitDeps = {
    models: any; // sequelize.models
    eventBus: any;
    cache?: any;
    measure: <T>(label: string, fn: () => Promise<T>) => Promise<T>;
  };
  
  export type ContextRegistry = {
    // Map: moduleName -> facadeName -> instance
    facades: Map<string, Record<string, unknown>>;
  };
  
  export interface FeatureModule {
    name: string;                    // ej: "characters", "comments"
    sdl: string;                     // SDL (schema GraphQL)
    resolvers: Record<string, any>;  // partial resolvers GraphQL
    init(deps: ModuleInitDeps, ctxReg: ContextRegistry): Promise<void>;
  }
  