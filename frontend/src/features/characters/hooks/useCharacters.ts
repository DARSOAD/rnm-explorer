// src/features/characters/hooks/useCharacters.ts
import { useEffect, useMemo, useState } from "react";
import { useApolloClient, ApolloClient, NormalizedCacheObject } from "@apollo/client";
import { CharacterService } from "../../../core/services/CharacterService";
import type { CharacterListVM } from "../../../core/adapters/Character.adapter";
import type { Sort } from "../../../core/adapters/Filter.builder";

type Params = {
  page?: number; pageSize?: number; sort?: Sort;
  filters?: { status?:string; species?:string; gender?:string; name?:string; origin?:string; originId?:string };
};

export function useCharacters({ page = 1, pageSize = 15, sort = "NAME_ASC", filters }: Params) {
  const apollo = useApolloClient() as ApolloClient<NormalizedCacheObject>;
  const service = useMemo(() => new CharacterService({ apollo }), [apollo]);

  const [data, setData] = useState<CharacterListVM | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const vars = { page, pageSize, sort, filters };
    

    let canceled = false;
    setLoading(true);
    setError(null);

    service
      .list(vars)
      .then((res) => {
        if (canceled) return;
        
        setData(res);
      })
      .catch((e) => {
        if (canceled) return;
        
        setError(e instanceof Error ? e : new Error("Unknown error"));
      })
      .finally(() => {
        if (canceled) return;
        setLoading(false);
      });

    return () => { canceled = true; };
  }, [page, pageSize, sort, filters, service]);

  return { data, loading, error };
}
