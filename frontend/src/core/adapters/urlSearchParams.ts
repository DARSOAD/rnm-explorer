export type UrlState = {
    page?: number;
    pageSize?: number;
    sort?: "NAME_ASC" | "NAME_DESC";
    status?: string;
    species?: string;
    gender?: string;
    name?: string;
    origin?: string;
  };
  
  export function readUrlState(sp: URLSearchParams): UrlState {
    const n = (k: string, d?: number) => {
      const v = sp.get(k);
      const parsed = v ? Number(v) : NaN;
      return Number.isFinite(parsed) ? parsed : d;
    };
    const s = (k: string) => {
      const v = sp.get(k);
      return v && v.trim() ? v.trim() : undefined;
    };
    return {
      page: n("page", 1),
      pageSize: n("pageSize", 15),
      sort: (s("sort") as UrlState["sort"]) ?? "NAME_ASC",
      status: s("status"),
      species: s("species"),
      gender: s("gender"),
      name: s("name"),
      origin: s("origin"),
    };
  }
  
  export function writeUrlState(sp: URLSearchParams, state: UrlState) {
    const set = (k: string, v?: string | number) => {
      if (v === undefined || v === "" || v === null) sp.delete(k);
      else sp.set(k, String(v));
    };
    set("page", state.page);
    set("pageSize", state.pageSize);
    set("sort", state.sort);
    set("status", state.status);
    set("species", state.species);
    set("gender", state.gender);
    set("name", state.name);
    set("origin", state.origin);
  }
  