// /src/core/strategies/FetchPolicy.strategy.ts
import type { FetchPolicy /* ojo: NO WatchQueryFetchPolicy */ } from "@apollo/client";

type UseCase = "list" | "detail" | "refresh";

/** Política para llamadas con client.query (no watch). */
export function chooseFetchPolicy(uc: UseCase): FetchPolicy {
  switch (uc) {
    case "refresh":
      return "network-only";   // fuerza ir a red
    case "detail":
      return "cache-first";    // usa caché y cae a red
    case "list":
    default:
      return "cache-first";
  }
}
