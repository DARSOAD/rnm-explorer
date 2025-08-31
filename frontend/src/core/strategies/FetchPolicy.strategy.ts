// /src/core/strategies/FetchPolicy.strategy.ts
import type { FetchPolicy /* ojo: NO WatchQueryFetchPolicy */ } from "@apollo/client";

type UseCase = "list" | "detail" | "refresh";

export function chooseFetchPolicy(uc: UseCase): FetchPolicy {
  switch (uc) {
    case "refresh":
      return "network-only";   
    case "detail":
      return "cache-first";  
    case "list":
    default:
      return "cache-first";
  }
}
