export type CharacterListInput = {
    page?: number;
    pageSize?: number;
    sort?: "NAME_ASC" | "NAME_DESC";
  };
  
  export type Sort = "NAME_ASC" | "NAME_DESC";
  export type ListParams = { page: number; pageSize: number; sort: Sort };
  
  export class CharacterFilterBuilder {
    private _page: number = 1;
    private _pageSize: number = 20;
    private _sort: Sort = "NAME_ASC";
  
    withPage(p?: number) {
      if (Number.isFinite(p) && (p as number) > 0) this._page = Math.floor(p as number);
      return this;
    }
    withPageSize(ps?: number) {
      const MAX = 100;
      if (Number.isFinite(ps) && (ps as number) > 0) this._pageSize = Math.min(Math.floor(ps as number), MAX);
      return this;
    }
    withSort(s?: string) {
      if (s === "NAME_ASC" || s === "NAME_DESC") this._sort = s;
      return this;
    }
    build(): ListParams {
      return { page: this._page, pageSize: this._pageSize, sort: this._sort };
    }
  }
  