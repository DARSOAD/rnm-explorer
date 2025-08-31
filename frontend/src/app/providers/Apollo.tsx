import { PropsWithChildren, useMemo } from 'react';
import { ApolloProvider } from '@apollo/client';
import { makeApolloClient } from '../../core/config/apollo.factory';

export function ApolloProviderFactory({ children }: PropsWithChildren) {
  const client = useMemo(() => makeApolloClient(), []);
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
