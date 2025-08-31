// src/features/characters/hooks/useCharacters.ts
import { useEffect, useMemo, useState } from "react";
import { useApolloClient, ApolloClient, NormalizedCacheObject } from "@apollo/client";
import { CharacterService } from "../../../core/services/CharacterService";
import type { CharacterListVM } from "../../../core/adapters/Character.adapter";
import type { Sort } from "../../../core/adapters/Filter.builder";

type Params = {
  page?: number;
  pageSize?: number;
  sort?: Sort; // "NAME_ASC" | "NAME_DESC"
};

type UseCharactersReturn = {
  data: CharacterListVM | null;
  loading: boolean;
  error: Error | null;
};

export function useCharacters({
  page = 1,
  pageSize = 15,
  sort = "NAME_ASC" as Sort,
  filters,
}: { page?: number; pageSize?: number; sort?: "NAME_ASC"|"NAME_DESC"; filters?: { status?:string; species?:string; gender?:string; name?:string; origin?:string } }): UseCharactersReturn {
  const apollo = useApolloClient() as ApolloClient<NormalizedCacheObject>;

  // Facade (Service) 
  const service = useMemo(() => new CharacterService({ apollo }), [apollo]);

  const [data, setData] = useState<CharacterListVM | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let canceled = false;
    setLoading(true);
    setError(null);

    service
      .list({ page, pageSize, sort })
      .then((res) => {
        if (!canceled) setData(res);
      })
      .catch((e) => {
        if (!canceled) setError(e instanceof Error ? e : new Error("Unknown error"));
      })
      .finally(() => {
        if (!canceled) setLoading(false);
      });

    return () => {
      canceled = true;
    };
  }, [page, pageSize, sort, service]);

  return { data, loading, error };
}
