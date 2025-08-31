// frontend/src/features/characters/hooks/useCharacterDetail.ts
import { useEffect, useState } from "react";
import {
  useApolloClient,
  ApolloClient,
  NormalizedCacheObject,
} from "@apollo/client";
import { CharacterService } from "../../../core/services/CharacterService";
import type { CharacterVM } from "../../../core/adapters/Character.adapter";

export function useCharacterDetail(id?: string) {
  const client = useApolloClient();
  const [data, setData] = useState<CharacterVM | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let cancelled = false;
    if (!id) {
      console.log("[DetailHook] sin id → limpiar data");
      setData(null);
      return;
    }

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const svc = new CharacterService({
          apollo: client as ApolloClient<NormalizedCacheObject>,
        });
        const result = await svc.get(id);
        if (!cancelled) setData(result);
      } catch (e) {
        if (!cancelled) setError(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, client]);

  return { data, loading, error };
}
