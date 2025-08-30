import fs from "fs";
import path from "path";
import type { FeatureModule, ContextRegistry, ModuleInitDeps } from "../../modules/FeatureModule";

export async function loadFeatureModules(
  dir = path.join(__dirname, "../../modules")
): Promise<FeatureModule[]> {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir);
  const folders = entries.filter(f => fs.statSync(path.join(dir, f)).isDirectory());

  const modules: FeatureModule[] = [];
  for (const folder of folders) {
    const js = path.join(dir, folder, "index.js");
    const ts = path.join(dir, folder, "index.ts");
    const file = fs.existsSync(js) ? js : (fs.existsSync(ts) ? ts : null);
    if (!file) continue;
    const mod: { default: FeatureModule } = await import(file);
    if (!mod?.default?.name) continue;
    modules.push(mod.default);
  }
  return modules;
}

export async function initModules(
  modules: FeatureModule[],
  deps: ModuleInitDeps
): Promise<{ sdl: string; resolvers: Record<string, any>; ctxReg: ContextRegistry }> {
  const ctxReg: ContextRegistry = { facades: new Map() };
  let mergedSDL = "";
  let mergedResolvers: Record<string, any> = {};

  for (const m of modules) {
    await m.init(deps, ctxReg);
    mergedSDL += `\n${m.sdl}\n`;
    mergedResolvers = deepMergeResolvers(mergedResolvers, m.resolvers);
  }
  return { sdl: mergedSDL, resolvers: mergedResolvers, ctxReg };
}

function deepMergeResolvers(a: any, b: any) {
  const out = { ...a };
  for (const k of Object.keys(b)) {
    const va = out[k], vb = b[k];
    if (isPlainObject(va) && isPlainObject(vb)) out[k] = deepMergeResolvers(va, vb);
    else out[k] = vb;
  }
  return out;
}

function isPlainObject(o: any) {
  return o && typeof o === "object" && !Array.isArray(o);
}
