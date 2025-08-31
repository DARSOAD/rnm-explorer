// src/core/config/apollo.factory.ts
import { ApolloClient, InMemoryCache, HttpLink, NormalizedCacheObject } from "@apollo/client";

export function makeApolloClient(opts: { uri: string }): ApolloClient<NormalizedCacheObject> {
  return new ApolloClient<NormalizedCacheObject>({
    link: new HttpLink({ uri: opts.uri }),
    cache: new InMemoryCache(),
  });
}
